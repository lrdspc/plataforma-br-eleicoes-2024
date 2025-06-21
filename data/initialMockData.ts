import { User, UserRole, Project, ProjectStatus, SurveyAreaAssignment, SurveyAreaStatus, Question, QuestionType, SurveyResponse } from '../types';
import { LatLngExpression } from 'leaflet';

export const initialUsers: User[] = [
  { id: '1', name: 'Admin PBR', email: 'admin@pbr.com', role: UserRole.ADMINISTRADOR_SISTEMA, password: 'admin', creationDate: new Date().toISOString() },
  { id: 'auth-user-pesquisador', name: 'Pesquisador de Campo A', email: 'pesquisador@pbr.com', role: UserRole.PESQUISADOR_CAMPO, password: '123', creationDate: new Date().toISOString() },
  { id: 'auth-user-coordenador', name: 'Coordenador PBR', email: 'coordenador@pbr.com', role: UserRole.COORDENADOR_CAMPO, password: 'cord', creationDate: new Date().toISOString() },
  { id: 'auth-user-gerente', name: 'Gerente PBR', email: 'gerente@pbr.com', role: UserRole.GERENTE_PESQUISA, password: 'ger', creationDate: new Date().toISOString() },
  { id: '3', name: 'Beatriz Lima', email: 'beatriz.lima@example.com', role: UserRole.GERENTE_PESQUISA, creationDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString() },
  { id: '4', name: 'Carlos Santos', email: 'carlos.santos@example.com', role: UserRole.COORDENADOR_CAMPO, creationDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString() },
  { id: '5', name: 'Diana Alves', email: 'diana.alves@example.com', role: UserRole.PESQUISADOR_CAMPO, creationDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() },
];

const sampleQuestionsEleitoral: Question[] = [
  { id: 'q_ele_1', text: 'Se a eleição para prefeito fosse hoje, em qual candidato você votaria (Estimulada)?', type: QuestionType.SINGLE_CHOICE, options: ['Candidato Alfa', 'Candidato Beta', 'Candidato Gama', 'Branco/Nulo'] },
  { id: 'q_ele_2', text: 'Em qual candidato você NÃO votaria de jeito nenhum (Rejeição)?', type: QuestionType.MULTIPLE_CHOICE, options: ['Candidato Alfa', 'Candidato Beta', 'Candidato Gama'] },
  { id: 'q_ele_3', text: 'Como você avalia a atual gestão municipal?', type: QuestionType.SCALE, scaleMin: 1, scaleMax: 5, scaleLabels: ['Péssima', 'Ruim', 'Regular', 'Boa', 'Ótima'] },
  { id: 'q_ele_4', text: 'Qual sua faixa etária?', type: QuestionType.SINGLE_CHOICE, options: ['16-24 anos', '25-34 anos', '35-44 anos', '45-59 anos', '60+ anos'] },
  { id: 'q_ele_5', text: 'Qual seu bairro de residência?', type: QuestionType.TEXT },
];

const sampleQuestionsSatisfacao: Question[] = [
  { id: 'q_sat_1', text: 'Em uma escala de 0 a 10, qual a probabilidade de você recomendar nossa empresa a um amigo ou familiar?', type: QuestionType.NUMERIC, scaleMin: 0, scaleMax: 10 },
  { id: 'q_sat_2', text: 'Qual seu nível de satisfação com a qualidade de nossos produtos?', type: QuestionType.SCALE, scaleMin: 1, scaleMax: 5, scaleLabels: ['Muito Insatisfeito', 'Insatisfeito', 'Neutro', 'Satisfeito', 'Muito Satisfeito'] },
  { id: 'q_sat_3', text: 'Deixe um comentário ou sugestão (opcional):', type: QuestionType.TEXT },
];


export const initialProjects: Project[] = [
  {
    id: 'proj1',
    name: 'Pesquisa Eleitoral Nacional 2024',
    description: 'Levantamento de intenção de voto para as eleições presidenciais.',
    status: ProjectStatus.EM_CAMPO,
    creationDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
    targetAudience: 'Eleitores acima de 16 anos em todas as capitais.',
    quotas: [
      { id: 'q1-1', name: 'Região Sudeste', targetCount: 1000, achievedCount: 650 },
      { id: 'q1-2', name: 'Faixa Etária 18-24', targetCount: 300, achievedCount: 150 },
    ],
    questions: sampleQuestionsEleitoral,
  },
  {
    id: 'proj2',
    name: 'Satisfação do Consumidor - Setor Varejista',
    description: 'Avaliação da satisfação dos clientes de grandes redes varejistas.',
    status: ProjectStatus.PLANEJAMENTO,
    creationDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    quotas: [
      { id: 'q2-1', name: 'Clientes Classe A/B', targetCount: 500, achievedCount: 0 },
    ],
    questions: sampleQuestionsSatisfacao,
  },
  {
    id: 'proj3',
    name: 'Opinião Pública sobre Sustentabilidade',
    description: 'Pesquisa sobre a percepção da população acerca de práticas sustentáveis.',
    status: ProjectStatus.CONCLUIDO,
    creationDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString(),
    startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 80).toISOString(),
    endDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 50).toISOString(),
    quotas: [
      { id: 'q3-1', name: 'População Urbana', targetCount: 1200, achievedCount: 1200 },
    ],
    questions: [
        { id: 'q_sus_1', text: 'Você se considera uma pessoa engajada com práticas sustentáveis?', type: QuestionType.SINGLE_CHOICE, options:['Sim', 'Não', 'Em partes']},
        { id: 'q_sus_2', text: 'Quais práticas sustentáveis você adota no seu dia a dia? (Múltipla Escolha)', type: QuestionType.MULTIPLE_CHOICE, options:['Separação de lixo reciclável', 'Economia de água', 'Economia de energia elétrica', 'Uso de transporte público/bicicleta', 'Não adoto práticas específicas'] },
    ],
  },
];

export const initialSurveyAreaAssignments: SurveyAreaAssignment[] = [
  {
    id: 'area1',
    name: 'Setor Censitário Alpha (PROJ1)',
    coordinates: [
      [-15.77, -47.93],
      [-15.77, -47.91],
      [-15.79, -47.91],
      [-15.79, -47.93],
    ] as LatLngExpression[],
    interviewsTarget: 20,
    interviewsCompleted: 10,
    status: SurveyAreaStatus.EM_ANDAMENTO,
    projectId: 'proj1',
    assignedToResearcherId: 'auth-user-pesquisador'
  },
  {
    id: 'area2',
    name: 'Setor Censitário Beta (PROJ1)',
    coordinates: [
      [-15.80, -47.90],
      [-15.80, -47.88],
      [-15.82, -47.88],
      [-15.82, -47.90],
    ] as LatLngExpression[],
    interviewsTarget: 15,
    interviewsCompleted: 5,
    status: SurveyAreaStatus.PENDENTE,
    projectId: 'proj1',
    assignedToResearcherId: 'auth-user-pesquisador'
  },
  {
    id: 'area3',
    name: 'Região Comercial Central (PROJ2)',
    coordinates: [
        [-15.785, -47.885],
        [-15.785, -47.875],
        [-15.795, -47.875],
        [-15.795, -47.885],
    ] as LatLngExpression[],
    interviewsTarget: 50,
    interviewsCompleted: 0,
    status: SurveyAreaStatus.PENDENTE,
    projectId: 'proj2',
     assignedToResearcherId: '5' // Diana Alves
  }
];

// Array inicial para armazenar as respostas das pesquisas coletadas
export const initialSurveyResponses: SurveyResponse[] = [];