import React, { useRef, useState, useEffect, FormEvent } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Tooltip } from 'react-leaflet';
import L, { LatLngExpression, PathOptions } from 'leaflet';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea'; // Added Textarea
import Select from '../../components/common/Select'; // Added Select
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../hooks/useAuth';
import { SurveyAreaAssignment, SurveyAreaStatus, surveyAreaStatusLabels, Project, Question, QuestionType, Answer } from '../../types';

// Fix Leaflet's default icon path issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const getQuestionTypeLabel = (type: QuestionType): string => {
  switch(type) {
    case QuestionType.TEXT: return 'Texto';
    case QuestionType.MULTIPLE_CHOICE: return 'Múltipla Escolha';
    case QuestionType.SINGLE_CHOICE: return 'Escolha Única';
    case QuestionType.NUMERIC: return 'Numérica';
    case QuestionType.SCALE: return 'Escala';
    default: return 'Desconhecido';
  }
}

const FieldMapPage: React.FC = () => {
  const initialPosition: LatLngExpression = [-15.7801, -47.9292]; // Brasília
  const mapRef = useRef<L.Map>(null);
  const { state, dispatch } = useData();
  const { user } = useAuth();

  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState<SurveyAreaAssignment | null>(null);
  const [currentAnswers, setCurrentAnswers] = useState<Record<string, Answer['value']>>({});

  useEffect(() => {
    if (isCollectModalOpen && selectedArea) {
      const initialAnswers: Record<string, Answer['value']> = {};
      const project = state.projects.find(p => p.id === selectedArea.projectId);
      project?.questions.forEach(q => {
        if (q.type === QuestionType.MULTIPLE_CHOICE) {
          initialAnswers[q.id] = []; 
        } else {
          initialAnswers[q.id] = ''; 
        }
      });
      setCurrentAnswers(initialAnswers);
    }
  }, [isCollectModalOpen, selectedArea, state.projects]);


  const assignedAreasData = state.surveyAreas.filter(area => area.assignedToResearcherId === user?.id);

  const getPolygonStyle = (status: SurveyAreaStatus): PathOptions => {
    switch(status) {
      case SurveyAreaStatus.PENDENTE:
        return { color: '#FF6B35', fillColor: '#FF6B35', fillOpacity: 0.3 };
      case SurveyAreaStatus.EM_ANDAMENTO:
        return { color: '#FFC107', fillColor: '#FFC107', fillOpacity: 0.4 };
      case SurveyAreaStatus.CONCLUIDA:
        return { color: '#28A745', fillColor: '#28A745', fillOpacity: 0.5 };
      case SurveyAreaStatus.PROBLEMA:
        return { color: '#DC3545', fillColor: '#DC3545', fillOpacity: 0.4 };
      default:
        return { color: '#6C757D', fillColor: '#6C757D', fillOpacity: 0.2 };
    }
  };

  const handleOpenCollectModal = (area: SurveyAreaAssignment) => {
    if (area.interviewsCompleted >= area.interviewsTarget) {
        alert(`A meta de ${area.interviewsTarget} entrevistas para a área "${area.name}" já foi atingida.`);
        return;
    }
    setSelectedArea(area);
    setIsCollectModalOpen(true);
  };

  const handleCloseCollectModal = () => {
    setIsCollectModalOpen(false);
    setSelectedArea(null);
    setCurrentAnswers({}); 
  };

  const handleAnswerChange = (questionId: string, value: Answer['value']) => {
    setCurrentAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleMultiChoiceChange = (questionId: string, optionValue: string, checked: boolean) => {
    setCurrentAnswers(prev => {
      const existingValues = (prev[questionId] as string[] | undefined) || [];
      if (checked) {
        return { ...prev, [questionId]: [...existingValues, optionValue] };
      } else {
        return { ...prev, [questionId]: existingValues.filter(v => v !== optionValue) };
      }
    });
  };

  const handleSubmitCollection = (e: FormEvent) => {
    e.preventDefault();
    if (selectedArea && projectForSelectedArea && user) {
      const answersArray: Answer[] = projectForSelectedArea.questions.map(q => ({
        questionId: q.id,
        value: currentAnswers[q.id] === undefined ? null : currentAnswers[q.id],
      }));

      const allAnswered = projectForSelectedArea.questions.every(q => {
          const answer = currentAnswers[q.id];
          if (q.type === QuestionType.MULTIPLE_CHOICE) return (answer as string[])?.length > 0;
          return answer !== '' && answer !== undefined && answer !== null;
      });

      if (!allAnswered) {
          alert("Por favor, responda todas as perguntas obrigatórias.");
          return;
      }

      const newSurveyResponse = {
        id: `resp-${Date.now()}`,
        projectId: selectedArea.projectId,
        surveyAreaId: selectedArea.id,
        researcherId: user.id,
        collectionDate: new Date().toISOString(),
        answers: answersArray,
      };

      dispatch({ type: 'ADD_SURVEY_RESPONSE', payload: newSurveyResponse });
      dispatch({ type: 'COMPLETE_INTERVIEW', payload: { areaId: selectedArea.id, interviewsDone: 1 } });
      
      handleCloseCollectModal();
    }
  };

  const handleSyncData = () => {
    alert('Sincronização de dados simulada. Em uma aplicação real, enviaria dados pendentes para o servidor e buscaria novas tarefas.');
    console.log("Respostas coletadas até agora:", state.surveyResponses);
  }

  const projectForSelectedArea: Project | undefined = selectedArea 
    ? state.projects.find(p => p.id === selectedArea.projectId) 
    : undefined;

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-2xl font-inter font-semibold text-pbr-text-main mb-4">Mapa de Coleta</h2>
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 h-[60vh] lg:h-full">
          <Card className="p-0 h-full overflow-hidden">
            <MapContainer center={initialPosition} zoom={12} style={{ height: '100%', width: '100%' }} ref={mapRef}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {assignedAreasData.map((area) => (
                <Polygon
                  key={area.id}
                  pathOptions={getPolygonStyle(area.status)}
                  positions={area.coordinates}
                  eventHandlers={{
                    click: () => handleOpenCollectModal(area),
                  }}
                >
                  <Tooltip sticky>
                    <strong>{area.name}</strong><br />
                    Meta: {area.interviewsCompleted}/{area.interviewsTarget} entrevistas<br />
                    Status: {surveyAreaStatusLabels[area.status]}
                     {area.interviewsCompleted >= area.interviewsTarget && <span className="font-bold block text-green-600"> (Meta Atingida)</span>}
                  </Tooltip>
                  <Popup>
                    <strong>{area.name}</strong><br />
                    Meta: {area.interviewsCompleted}/{area.interviewsTarget} entrevistas<br />
                    Status: {surveyAreaStatusLabels[area.status]}<br />
                    <Button 
                        size="sm" 
                        className="mt-2" 
                        onClick={() => handleOpenCollectModal(area)}
                        disabled={area.interviewsCompleted >= area.interviewsTarget}
                    >
                        {area.interviewsCompleted >= area.interviewsTarget ? 'Meta Atingida' : 'Coletar Nesta Área'}
                    </Button>
                  </Popup>
                </Polygon>
              ))}
            </MapContainer>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <Card title="Minhas Tarefas de Coleta">
            {assignedAreasData.length > 0 ? (
              <ul className="space-y-3 max-h-[calc(60vh-80px)] overflow-y-auto pr-2">
                {assignedAreasData.map(area => {
                   const isTargetMet = area.interviewsCompleted >= area.interviewsTarget;
                   return (
                       <li key={area.id} className="p-3 border rounded-md hover:bg-gray-50 shadow-sm">
                          <h4 className="font-semibold text-pbr-text-main">{area.name}</h4>
                          <p className="text-sm text-pbr-text-secondary">Meta: {area.interviewsCompleted}/{area.interviewsTarget} entrevistas</p>
                          <p className="text-sm text-pbr-text-secondary">Status: 
                            <span className={`font-medium ml-1`} style={{color: getPolygonStyle(area.status).color}}>
                                {surveyAreaStatusLabels[area.status]}
                                {isTargetMet && <span className="font-bold text-green-600"> (Meta Atingida)</span>}
                            </span>
                          </p>
                          <Button 
                            size="sm" 
                            variant={isTargetMet ? "ghost" : "secondary"} 
                            className="mt-2 w-full" 
                            onClick={() => handleOpenCollectModal(area)}
                            disabled={isTargetMet}
                          >
                            {isTargetMet ? 'Meta da Área Atingida' : 'Registrar Entrevista'}
                          </Button>
                       </li>
                   );
                })}
              </ul>
            ) : (
              <p className="text-pbr-text-secondary text-center py-4">Nenhuma área de coleta atribuída no momento.</p>
            )}
             <Button fullWidth className="mt-4" onClick={handleSyncData}>Sincronizar Dados</Button>
          </Card>
        </div>
      </div>

      {selectedArea && projectForSelectedArea && (
        <Modal isOpen={isCollectModalOpen} onClose={handleCloseCollectModal} title={`Registrar Entrevista em: ${selectedArea.name}`} size="lg">
          <form onSubmit={handleSubmitCollection}>
            <p className="text-sm text-pbr-text-secondary mb-1">
              Projeto: {projectForSelectedArea.name}
            </p>
            <p className="text-sm text-pbr-text-secondary mb-4">
              Meta da área: {selectedArea.interviewsCompleted}/{selectedArea.interviewsTarget} entrevistas.
            </p>
            
            <div className="my-4 p-3 border border-dashed rounded-md bg-gray-50 max-h-80 overflow-y-auto space-y-4">
              <h4 className="font-semibold text-pbr-text-main mb-2 border-b pb-2">Questionário</h4>
              {projectForSelectedArea.questions.map((question, index) => (
                <div key={question.id} className="p-2 border-b border-gray-200 last:border-b-0">
                  <label htmlFor={question.id} className="block text-sm font-medium text-pbr-text-main mb-1.5">
                    {index + 1}. {question.text}
                  </label>
                  {question.type === QuestionType.TEXT && (
                    <Textarea
                      id={question.id}
                      value={(currentAnswers[question.id] as string) || ''}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      rows={3}
                      required
                    />
                  )}
                  {question.type === QuestionType.NUMERIC && (
                    <Input
                      id={question.id}
                      type="number"
                      value={(currentAnswers[question.id] as number) || ''}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value === '' ? '' : parseFloat(e.target.value))}
                      min={question.scaleMin}
                      max={question.scaleMax}
                      required
                    />
                  )}
                  {question.type === QuestionType.SINGLE_CHOICE && question.options && (
                    <Select
                      id={question.id}
                      value={(currentAnswers[question.id] as string) || ''}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      options={question.options.map(opt => ({ value: opt, label: opt }))}
                      placeholder="Selecione uma opção"
                      required
                    />
                  )}
                  {question.type === QuestionType.MULTIPLE_CHOICE && question.options && (
                    <fieldset className="space-y-1.5">
                      {question.options.map(opt => (
                        <div key={opt} className="flex items-center">
                          <input
                            id={`${question.id}-${opt}`}
                            name={question.id}
                            type="checkbox"
                            value={opt}
                            checked={((currentAnswers[question.id] as string[]) || []).includes(opt)}
                            onChange={(e) => handleMultiChoiceChange(question.id, e.target.value, e.target.checked)}
                            className="h-4 w-4 text-pbr-primary border-gray-300 rounded focus:ring-pbr-primary"
                          />
                          <label htmlFor={`${question.id}-${opt}`} className="ml-2 block text-sm text-pbr-text-secondary">
                            {opt}
                          </label>
                        </div>
                      ))}
                    </fieldset>
                  )}
                  {question.type === QuestionType.SCALE && question.options && ( 
                     <fieldset className="space-y-1.5">
                      <legend className="sr-only">{question.text}</legend>
                      <div className={`flex ${ (question.options?.length || 0) > 3 ? 'flex-col sm:flex-row sm:space-x-4' : 'space-x-4'}`}>
                        {(question.scaleLabels || question.options).map((opt, idx) => (
                           <div key={opt} className="flex items-center mb-1 sm:mb-0">
                            <input
                              id={`${question.id}-${opt.replace(/\s+/g, '-')}`}
                              name={question.id}
                              type="radio"
                              value={question.scaleMin !== undefined ? question.scaleMin + idx : opt}
                              checked={String(currentAnswers[question.id]) === String(question.scaleMin !== undefined ? question.scaleMin + idx : opt)}
                              onChange={(e) => handleAnswerChange(question.id, question.scaleMin !== undefined ? parseInt(e.target.value) : e.target.value)}
                              className="h-4 w-4 text-pbr-primary border-gray-300 focus:ring-pbr-primary"
                              required
                            />
                            <label htmlFor={`${question.id}-${opt.replace(/\s+/g, '-')}`} className="ml-2 block text-sm text-pbr-text-secondary">
                              {opt}
                            </label>
                          </div>
                        ))}
                      </div>
                    </fieldset>
                  )}
                   {question.type === QuestionType.SCALE && !question.options && question.scaleMin !== undefined && question.scaleMax !== undefined && (
                     <Input
                        id={question.id}
                        type="number"
                        value={(currentAnswers[question.id] as number) || ''}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                        min={question.scaleMin}
                        max={question.scaleMax}
                        placeholder={`Número de ${question.scaleMin} a ${question.scaleMax}`}
                        required
                      />
                   )}
                </div>
              ))}
            </div>

            <Button type="submit" fullWidth disabled={selectedArea.interviewsCompleted >= selectedArea.interviewsTarget}>
              {selectedArea.interviewsCompleted >= selectedArea.interviewsTarget ? 'Meta da Área Atingida' : 'Confirmar Entrevista'}
            </Button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default FieldMapPage;