import React, { useState, FormEvent, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Select from '../../components/common/Select';
import { ProjectsIcon, UsersIcon } from '../../components/icons/Icons'; // UsersIcon might be a typo, keeping ProjectsIcon
import { useData } from '../../contexts/DataContext';
import { Project, ProjectStatus, projectStatusLabels } from '../../types';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants';

const ProjectListPage: React.FC = () => {
  const { state, dispatch } = useData();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [currentProjectName, setCurrentProjectName] = useState('');
  const [currentProjectDescription, setCurrentProjectDescription] = useState('');
  const [currentProjectStatus, setCurrentProjectStatus] = useState<ProjectStatus>(ProjectStatus.PLANEJAMENTO);

  useEffect(() => {
    if (editingProject) {
      setCurrentProjectName(editingProject.name);
      setCurrentProjectDescription(editingProject.description);
      setCurrentProjectStatus(editingProject.status);
    } else {
      // Reset for new project
      setCurrentProjectName('');
      setCurrentProjectDescription('');
      setCurrentProjectStatus(ProjectStatus.PLANEJAMENTO);
    }
  }, [editingProject]);

  const handleOpenModalForNew = () => {
    setEditingProject(null); // Ensure it's for a new project
    // Reset fields for new project explicitly if not handled by useEffect sufficiently
    setCurrentProjectName('');
    setCurrentProjectDescription('');
    setCurrentProjectStatus(ProjectStatus.PLANEJAMENTO);
    setIsModalOpen(true);
  };
  
  const handleOpenModalForEdit = (project: Project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProject(null); // Clear editing state
    // Fields are reset by useEffect when editingProject becomes null
  };

  const handleSubmitProject = (e: FormEvent) => {
    e.preventDefault();
    if (editingProject) {
      // Update existing project
      const updatedProject: Project = {
        ...editingProject,
        name: currentProjectName,
        description: currentProjectDescription,
        status: currentProjectStatus,
        // creationDate remains the same, quotas are not edited here yet
      };
      dispatch({ type: 'UPDATE_PROJECT', payload: updatedProject });
    } else {
      // Add new project
      const newProject: Project = {
        id: `proj${Date.now()}`,
        name: currentProjectName,
        description: currentProjectDescription,
        status: currentProjectStatus,
        creationDate: new Date().toISOString(),
        quotas: [],
        questions: [], // Initialize questions as an empty array
      };
      dispatch({ type: 'ADD_PROJECT', payload: newProject });
    }
    handleCloseModal();
  };

  const handleDeleteProject = (projectId: string, projectName: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o projeto "${projectName}"? Esta ação não pode ser desfeita.`)) {
      dispatch({ type: 'DELETE_PROJECT', payload: { projectId } });
    }
  };
  
  const projectStatusOptions = Object.entries(projectStatusLabels).map(([value, label]) => ({
    value: value as ProjectStatus,
    label,
  }));

  const sortedProjects = [...state.projects].sort((a,b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime());

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-inter font-semibold text-pbr-text-main">Gerenciamento de Projetos</h2>
        <Button variant="primary" onClick={handleOpenModalForNew}>
          <ProjectsIcon className="h-5 w-5 mr-2"/>
          Novo Projeto
        </Button>
      </div>
      <Card>
        {sortedProjects.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-pbr-text-secondary uppercase tracking-wider">Nome do Projeto</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-pbr-text-secondary uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-pbr-text-secondary uppercase tracking-wider">Data de Criação</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-pbr-text-secondary uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-pbr-bg-element divide-y divide-gray-200">
                {sortedProjects.map(project => (
                  <tr key={project.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-pbr-text-main">{project.name}</div>
                      <div className="text-xs text-pbr-text-secondary truncate max-w-xs">{project.description}</div>
                    </td>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-pbr-text-secondary">
                      {new Date(project.creationDate).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Link to={`${ROUTES.PROJECTS}/${project.id}`} className="text-pbr-primary hover:text-blue-700">Detalhes</Link>
                      <Button variant="ghost" size="sm" onClick={() => handleOpenModalForEdit(project)} className="text-pbr-primary hover:bg-blue-100">Editar</Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteProject(project.id, project.name)} className="text-pbr-error hover:bg-red-100">Excluir</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-4 p-6 border border-dashed border-gray-300 rounded-md text-center">
            <ProjectsIcon className="h-16 w-16 text-gray-300 mx-auto mb-2"/>
            <p className="text-pbr-text-secondary">Nenhum projeto cadastrado ainda. Clique em "Novo Projeto" para começar.</p>
          </div>
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingProject ? "Editar Projeto" : "Criar Novo Projeto"}>
        <form onSubmit={handleSubmitProject}>
          <Input
            id="projectName"
            label="Nome do Projeto"
            value={currentProjectName}
            onChange={(e) => setCurrentProjectName(e.target.value)}
            placeholder="Ex: Pesquisa de Satisfação XYZ"
            required
          />
          <Textarea
            id="projectDescription"
            label="Descrição"
            value={currentProjectDescription}
            onChange={(e) => setCurrentProjectDescription(e.target.value)}
            placeholder="Descreva brevemente o objetivo do projeto."
            required
            rows={4}
          />
          <Select
            id="projectStatus"
            label="Status"
            value={currentProjectStatus}
            onChange={(e) => setCurrentProjectStatus(e.target.value as ProjectStatus)}
            options={projectStatusOptions}
            required
          />
          {/* TODO: Add fields for start/end dates, target audience, and quota management in future iterations */}
          <div className="mt-6 flex justify-end space-x-3">
            <Button type="button" variant="ghost" onClick={handleCloseModal}>Cancelar</Button>
            <Button type="submit" variant="primary">{editingProject ? "Salvar Alterações" : "Salvar Projeto"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectListPage;