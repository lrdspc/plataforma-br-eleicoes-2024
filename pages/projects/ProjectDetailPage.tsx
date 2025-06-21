import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useData } from '../../contexts/DataContext';
import { Project, ProjectStatus, projectStatusLabels, QuotaTarget, SurveyAreaAssignment, surveyAreaStatusLabels, SurveyAreaStatus, Question, QuestionType, SurveyResponse } from '../../types';
import { ROUTES, USER_ROLES_HIERARCHY } from '../../constants';
import Spinner from '../../components/common/Spinner';
import { ProjectsIcon, MapIcon, ChartBarIcon } from '../../components/icons/Icons'; // ChartBarIcon para respostas

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

const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { state } = useData();
  const navigate = useNavigate();

  const project = state.projects.find(p => p.id === projectId);
  const projectAreas = state.surveyAreas.filter(area => area.projectId === projectId);
  const projectResponsesCount = state.surveyResponses.filter(response => response.projectId === projectId).length;

  const getResearcherName = (researcherId?: string) => {
    if (!researcherId) return 'Não atribuído';
    const researcher = state.users.find(u => u.id === researcherId);
    return researcher ? researcher.name : 'Pesquisador Desconhecido';
  };

  const getStatusColor = (status: SurveyAreaStatus) => {
    switch (status) {
      case SurveyAreaStatus.PENDENTE: return 'text-yellow-600 bg-yellow-100';
      case SurveyAreaStatus.EM_ANDAMENTO: return 'text-blue-600 bg-blue-100';
      case SurveyAreaStatus.CONCLUIDA: return 'text-green-600 bg-green-100';
      case SurveyAreaStatus.PROBLEMA: return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (!project) {
    return (
      <div className="text-center p-10">
        <ProjectsIcon className="h-24 w-24 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-pbr-text-main mb-2">Projeto Não Encontrado</h2>
        <p className="text-pbr-text-secondary mb-6">
          O projeto que você está tentando acessar não existe ou foi removido.
        </p>
        <Button onClick={() => navigate(ROUTES.PROJECTS)} variant="primary">
          Voltar para Lista de Projetos
        </Button>
      </div>
    );
  }

  const DetailItem: React.FC<{ label: string; value: React.ReactNode | string | undefined }> = ({ label, value }) => (
    <div className="mb-3">
      <dt className="text-sm font-medium text-pbr-text-secondary">{label}</dt>
      <dd className="mt-1 text-sm text-pbr-text-main">{value || 'Não informado'}</dd>
    </div>
  );
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Não informado';
    return new Date(dateString).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-inter font-semibold text-pbr-text-main">
          Detalhes do Projeto: <span className="text-pbr-primary">{project.name}</span>
        </h2>
        <Button onClick={() => navigate(ROUTES.PROJECTS)} variant="ghost">
          &larr; Voltar para Lista
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Informações Gerais" className="md:col-span-2">
          <dl className="divide-y divide-gray-200">
            <div className="py-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <DetailItem label="Nome do Projeto" value={project.name} />
            </div>
            <div className="py-3 grid grid-cols-1">
                 <DetailItem label="Descrição" value={<p className="whitespace-pre-wrap">{project.description}</p>} />
            </div>
             <div className="py-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <DetailItem label="Status" value={
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          project.status === ProjectStatus.EM_CAMPO ? 'bg-green-100 text-green-800' :
                          project.status === ProjectStatus.PLANEJAMENTO ? 'bg-blue-100 text-blue-800' :
                          project.status === ProjectStatus.CONCLUIDO ? 'bg-gray-100 text-gray-800' :
                           project.status === ProjectStatus.ANALISE ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800' // CANCELADO
                        }`}>
                        {projectStatusLabels[project.status]}
                    </span>
                } />
                <DetailItem label="Data de Criação" value={formatDate(project.creationDate)} />
            </div>
            <div className="py-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <DetailItem label="Data de Início" value={formatDate(project.startDate)} />
                <DetailItem label="Data de Término" value={formatDate(project.endDate)} />
            </div>
            <div className="py-3 grid grid-cols-1">
                <DetailItem label="Público-Alvo" value={project.targetAudience} />
            </div>
          </dl>
        </Card>

        <div className="space-y-6">
            <Card title="Metas de Cotas">
                {project.quotas.length > 0 ? (
                    <ul className="space-y-3">
                        {project.quotas.map(quota => (
                            <li key={quota.id} className="p-3 border rounded-md bg-gray-50">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-pbr-text-main">{quota.name}</span>
                                    <span className="text-xs text-pbr-text-secondary">
                                        {quota.achievedCount} / {quota.targetCount}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                                    <div 
                                        className="bg-pbr-secondary h-2.5 rounded-full" 
                                        style={{ width: `${(quota.achievedCount / quota.targetCount) * 100}%` }}
                                    ></div>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-pbr-text-secondary text-center py-4">Nenhuma cota definida para este projeto.</p>
                )}
            </Card>

            <Card title="Respostas Coletadas">
                <div className="text-center py-4">
                    <ChartBarIcon className="h-10 w-10 text-pbr-primary mx-auto mb-2"/>
                    <p className="text-2xl font-semibold text-pbr-text-main">{projectResponsesCount}</p>
                    <p className="text-sm text-pbr-text-secondary mb-3">
                        {projectResponsesCount === 1 ? 'Resposta Coletada' : 'Respostas Coletadas'}
                    </p>
                    <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={() => navigate(`${ROUTES.PROJECTS}/${project.id}/responses`)}
                        disabled={projectResponsesCount === 0}
                    >
                        Ver Todas as Respostas
                    </Button>
                </div>
            </Card>
        </div>
      </div>

      <div className="mt-6">
        <Card title="Questionário do Projeto">
            {project.questions && project.questions.length > 0 ? (
                <ul className="space-y-3">
                    {project.questions.map((question, index) => (
                        <li key={question.id} className="p-3 border rounded-md hover:bg-gray-50">
                           <div className="flex justify-between items-center">
                             <span className="text-sm font-medium text-pbr-text-main">{index + 1}. {question.text}</span>
                             <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                                question.type === QuestionType.TEXT ? 'bg-indigo-100 text-indigo-800' :
                                question.type === QuestionType.MULTIPLE_CHOICE || question.type === QuestionType.SINGLE_CHOICE ? 'bg-purple-100 text-purple-800' :
                                question.type === QuestionType.NUMERIC ? 'bg-pink-100 text-pink-800' :
                                'bg-teal-100 text-teal-800' // SCALE
                              }`}>
                               {getQuestionTypeLabel(question.type)}
                             </span>
                           </div>
                            {question.options && (
                                <ul className="mt-2 ml-4 list-disc list-inside text-xs text-pbr-text-secondary">
                                    {question.options.map(opt => <li key={opt}>{opt}</li>)}
                                </ul>
                            )}
                            {question.type === QuestionType.SCALE && (
                                <p className="mt-1 text-xs text-pbr-text-secondary">
                                    Escala de {question.scaleMin} a {question.scaleMax}
                                    {question.scaleLabels && ` (${question.scaleLabels.join(' - ')})`}
                                </p>
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                 <p className="text-pbr-text-secondary text-center py-4">Nenhuma pergunta definida para este projeto.</p>
            )}
        </Card>
      </div>

      <div className="mt-6">
        <Card title="Áreas de Coleta do Projeto">
          {projectAreas.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-pbr-text-secondary uppercase tracking-wider">Nome da Área</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-pbr-text-secondary uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-pbr-text-secondary uppercase tracking-wider">Progresso</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-pbr-text-secondary uppercase tracking-wider">Pesquisador</th>
                  </tr>
                </thead>
                <tbody className="bg-pbr-bg-element divide-y divide-gray-200">
                  {projectAreas.map(area => (
                    <tr key={area.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-pbr-text-main">{area.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${getStatusColor(area.status)}`}>
                          {surveyAreaStatusLabels[area.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-pbr-text-secondary">
                        {area.interviewsCompleted} / {area.interviewsTarget}
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                          <div 
                              className={`${getStatusColor(area.status).split(' ')[1].replace('bg-', 'bg-')}`} 
                              style={{ width: `${(area.interviewsCompleted / area.interviewsTarget) * 100}%`, height: '100%', borderRadius: 'inherit' }}
                          ></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-pbr-text-secondary">{getResearcherName(area.assignedToResearcherId)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-6">
              <MapIcon className="h-12 w-12 text-gray-300 mx-auto mb-2"/>
              <p className="text-pbr-text-secondary">Nenhuma área de coleta definida para este projeto.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ProjectDetailPage;