import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { useData } from '../../contexts/DataContext';
import { Project, SurveyResponse, Answer, Question, QuestionType } from '../../types';
import { ROUTES } from '../../constants';
import { ChartBarIcon } from '../../components/icons/Icons';

const getQuestionText = (questionId: string, project?: Project): string => {
  return project?.questions.find(q => q.id === questionId)?.text || 'Pergunta não encontrada';
};

const getAnswerValueDisplay = (answer: Answer, question?: Question): string => {
  if (answer.value === null || answer.value === undefined) return 'Não respondido';
  if (Array.isArray(answer.value)) return answer.value.join(', ');
  if (question?.type === QuestionType.SCALE && question.scaleLabels && typeof answer.value === 'number') {
    const scaleIndex = answer.value - (question.scaleMin || 0);
    if (scaleIndex >= 0 && scaleIndex < question.scaleLabels.length) {
        return `${question.scaleLabels[scaleIndex]} (${answer.value})`;
    }
  }
  return String(answer.value);
};

const SurveyResponsesPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { state } = useData();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<SurveyResponse | null>(null);

  const project = state.projects.find(p => p.id === projectId);
  const projectResponses = state.surveyResponses.filter(r => r.projectId === projectId)
    .sort((a,b) => new Date(b.collectionDate).getTime() - new Date(a.collectionDate).getTime());

  const getResearcherName = (researcherId: string) => {
    const researcher = state.users.find(u => u.id === researcherId);
    return researcher ? researcher.name : 'Pesquisador Desconhecido';
  };

  const getAreaName = (areaId: string) => {
    const area = state.surveyAreas.find(a => a.id === areaId);
    return area ? area.name : 'Área Desconhecida';
  };
  
  const handleOpenModal = (response: SurveyResponse) => {
    setSelectedResponse(response);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedResponse(null);
  };

  if (!project) {
    return (
      <div className="text-center p-10">
        <ChartBarIcon className="h-24 w-24 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-pbr-text-main mb-2">Projeto Não Encontrado</h2>
        <p className="text-pbr-text-secondary mb-6">
          Não foi possível carregar as respostas pois o projeto não foi encontrado.
        </p>
        <Button onClick={() => navigate(ROUTES.PROJECTS)} variant="primary">
          Voltar para Lista de Projetos
        </Button>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-inter font-semibold text-pbr-text-main">
          Respostas Coletadas: <span className="text-pbr-primary">{project.name}</span>
        </h2>
        <Button onClick={() => navigate(`${ROUTES.PROJECTS}/${projectId}`)} variant="ghost">
          &larr; Voltar para Detalhes do Projeto
        </Button>
      </div>

      <Card>
        {projectResponses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-pbr-text-secondary uppercase tracking-wider">ID da Resposta</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-pbr-text-secondary uppercase tracking-wider">Data da Coleta</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-pbr-text-secondary uppercase tracking-wider">Pesquisador</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-pbr-text-secondary uppercase tracking-wider">Área de Coleta</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-pbr-text-secondary uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-pbr-bg-element divide-y divide-gray-200">
                {projectResponses.map(response => (
                  <tr key={response.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-pbr-text-secondary">{response.id.substring(response.id.length - 8)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-pbr-text-secondary">
                      {new Date(response.collectionDate).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-pbr-text-main font-medium">{getResearcherName(response.researcherId)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-pbr-text-secondary">{getAreaName(response.surveyAreaId)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenModal(response)}>Ver Detalhes</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10">
            <ChartBarIcon className="h-16 w-16 text-gray-300 mx-auto mb-3" />
            <p className="text-pbr-text-secondary">Nenhuma resposta coletada para este projeto ainda.</p>
          </div>
        )}
      </Card>

      {selectedResponse && isModalOpen && project && (
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={`Detalhes da Resposta: ${selectedResponse.id.substring(selectedResponse.id.length-8)}`} size="lg">
          <div className="space-y-4">
            <p className="text-sm"><strong>Projeto:</strong> {project.name}</p>
            <p className="text-sm"><strong>Pesquisador:</strong> {getResearcherName(selectedResponse.researcherId)}</p>
            <p className="text-sm"><strong>Área:</strong> {getAreaName(selectedResponse.surveyAreaId)}</p>
            <p className="text-sm"><strong>Data:</strong> {new Date(selectedResponse.collectionDate).toLocaleString('pt-BR')}</p>
            
            <div className="mt-4 pt-4 border-t">
                <h4 className="text-md font-semibold text-pbr-text-main mb-2">Respostas:</h4>
                {selectedResponse.answers.map((answer, index) => {
                    const question = project.questions.find(q => q.id === answer.questionId);
                    return (
                        <div key={index} className="mb-3 pb-2 border-b border-gray-100 last:border-b-0">
                            <p className="text-sm font-medium text-pbr-text-main">
                                {index + 1}. {question?.text || 'Pergunta não encontrada'}
                            </p>
                            <p className="text-sm text-pbr-secondary ml-4">
                                &rarr; {getAnswerValueDisplay(answer, question)}
                            </p>
                        </div>
                    );
                })}
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={handleCloseModal} variant="primary">Fechar</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default SurveyResponsesPage;