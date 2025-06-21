
import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import { DashboardCardData, projectStatusLabels, ProjectStatus, SurveyAreaStatus, UserRole } from '../../types';
import { RocketIcon, ChartBarIcon, UserGroupIcon, TargetIcon } from '../../components/icons/Icons';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../hooks/useAuth'; 
import { ROUTES } from '../../constants'; // Import ROUTES

const DashboardMetricCard: React.FC<DashboardCardData> = ({ title, value, icon, bgColor = 'bg-pbr-bg-element', textColor = 'text-pbr-text-main' }) => (
  <div className={`${bgColor} ${textColor} p-4 sm:p-6 rounded-lg shadow-lg flex items-center space-x-3 sm:space-x-4`}>
    <div className={`text-2xl sm:text-3xl ${bgColor === 'bg-pbr-bg-element' ? 'text-pbr-primary' : 'text-white'}`}>{icon}</div>
    <div>
      <p className={`text-xs sm:text-sm ${bgColor === 'bg-pbr-bg-element' ? 'text-pbr-text-secondary' : 'text-gray-200'} font-medium`}>{title}</p>
      <p className="text-xl sm:text-2xl font-semibold">{value}</p>
    </div>
  </div>
);


const DashboardPage: React.FC = () => {
  const { state } = useData();
  const { user } = useAuth(); 

  const activeProjectsCount = state.projects.filter(p => p.status === ProjectStatus.EM_CAMPO).length;
  
  // Alterado para refletir o total de respostas coletadas
  const totalSurveyResponses = state.surveyResponses.length;

  const researchersInFieldCount = state.users.filter(u => 
    u.role === UserRole.PESQUISADOR_CAMPO && 
    state.surveyAreas.some(sa => sa.assignedToResearcherId === u.id && sa.status === SurveyAreaStatus.EM_ANDAMENTO)
  ).length;

  const overallQuotaProgress = () => {
    let totalTarget = 0;
    let totalAchieved = 0;
    state.projects.forEach(p => {
      // Considerar cotas de projetos ativos ou em análise para o progresso geral
      if (p.status === ProjectStatus.EM_CAMPO || p.status === ProjectStatus.ANALISE) {
        p.quotas.forEach(q => {
          totalTarget += q.targetCount;
          totalAchieved += q.achievedCount;
        });
      }
    });
    if (totalTarget === 0) return 'N/A'; // Nenhuma cota definida para projetos relevantes
    return `${Math.round((totalAchieved / totalTarget) * 100)}%`;
  };
  
  const kpiData: DashboardCardData[] = [
    { title: "Projetos Ativos", value: activeProjectsCount, icon: <RocketIcon className="h-6 w-6 sm:h-8 sm:w-8"/> },
    { title: "Total de Respostas Coletadas", value: totalSurveyResponses, icon: <ChartBarIcon className="h-6 w-6 sm:h-8 sm:w-8"/> },
    { title: "Pesquisadores em Campo", value: researchersInFieldCount, icon: <UserGroupIcon className="h-6 w-6 sm:h-8 sm:w-8"/> },
    { title: "Meta Geral de Cotas", value: overallQuotaProgress(), icon: <TargetIcon className="h-6 w-6 sm:h-8 sm:w-8"/>, bgColor: "bg-pbr-secondary", textColor: "text-white" },
  ];

  const recentProjects = state.projects
    .sort((a,b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime())
    .slice(0, 5);

  return (
    <div>
      <h2 className="text-2xl font-inter font-semibold text-pbr-text-main mb-6">Visão Geral {user ? `(Bem-vindo, ${user.name}!)` : ''}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {kpiData.map(kpi => <DashboardMetricCard key={kpi.title} {...kpi} />)}
      </div>

      <Card title="Projetos Recentes">
        {recentProjects.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-pbr-text-secondary uppercase tracking-wider">Nome do Projeto</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-pbr-text-secondary uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-pbr-text-secondary uppercase tracking-wider">Progresso Cotas</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-pbr-text-secondary uppercase tracking-wider">Data Criação</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-pbr-text-secondary uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-pbr-bg-element divide-y divide-gray-200">
                {recentProjects.map(project => {
                  const projectQuotaProgress = () => {
                    let totalTarget = 0;
                    let totalAchieved = 0;
                    project.quotas.forEach(q => {
                      totalTarget += q.targetCount;
                      totalAchieved += q.achievedCount;
                    });
                    if (totalTarget === 0) return 'N/A';
                    return `${Math.round((totalAchieved / totalTarget) * 100)}%`;
                  };
                  return (
                    <tr key={project.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-pbr-text-main">{project.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-pbr-text-secondary">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          project.status === ProjectStatus.EM_CAMPO ? 'bg-green-100 text-green-800' :
                          project.status === ProjectStatus.PLANEJAMENTO ? 'bg-blue-100 text-blue-800' :
                          project.status === ProjectStatus.CONCLUIDO ? 'bg-gray-100 text-gray-800' :
                           project.status === ProjectStatus.ANALISE ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800' // CANCELADO
                        }`}>
                          {projectStatusLabels[project.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-pbr-text-secondary">{projectQuotaProgress()}</td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-pbr-text-secondary">
                        {new Date(project.creationDate).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {/* Corrigido o link para a página de detalhes do projeto */}
                        <Link to={`${ROUTES.PROJECTS}/${project.id}`} className="text-pbr-primary hover:text-blue-700">Detalhes</Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-pbr-text-secondary text-center py-4">Nenhum projeto recente encontrado.</p>
        )}
        <div className="mt-6 p-4 border border-dashed border-gray-300 rounded-md bg-gray-50 text-center text-pbr-text-secondary">
            Acompanhamento de Cotas: {overallQuotaProgress() !== 'N/A' ? `${overallQuotaProgress()} da meta geral atingida para projetos ativos/em análise.` : 'Nenhuma cota definida ou em progresso.'}
        </div>
      </Card>
    </div>
  );
};

export default DashboardPage;
