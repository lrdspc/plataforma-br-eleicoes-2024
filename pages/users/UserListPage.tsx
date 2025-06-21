import React, { useState, FormEvent, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { UsersIcon } from '../../components/icons/Icons';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../hooks/useAuth';
import { User, UserRole } from '../../types';
import { USER_ROLES_HIERARCHY } from '../../constants';

const UserListPage: React.FC = () => {
  const { state, dispatch } = useData();
  const { getRoleDisplayName } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [currentUserName, setCurrentUserName] = useState('');
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>(UserRole.PESQUISADOR_CAMPO);
  const [currentUserPassword, setCurrentUserPassword] = useState(''); // Only for new user creation

  useEffect(() => {
    if (editingUser) {
      setCurrentUserName(editingUser.name);
      setCurrentUserEmail(editingUser.email);
      setCurrentUserRole(editingUser.role);
      setCurrentUserPassword(''); // Password should not be pre-filled for editing
    } else {
      // Reset for new user
      setCurrentUserName('');
      setCurrentUserEmail('');
      setCurrentUserRole(UserRole.PESQUISADOR_CAMPO);
      setCurrentUserPassword('');
    }
  }, [editingUser, isModalOpen]); // Added isModalOpen to reset fields when modal opens for new user

  const handleOpenModalForNew = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleOpenModalForEdit = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null); 
  };

  const handleSubmitUser = (e: FormEvent) => {
    e.preventDefault();

    if (editingUser) {
      // Update existing user
      const updatedUser: User = {
        ...editingUser,
        name: currentUserName,
        email: currentUserEmail,
        role: currentUserRole,
        // Password is not updated here. In a real app, this would be a separate flow.
        // creationDate remains the same.
      };
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
    } else {
      // Add new user
      if (state.users.find(u => u.email.toLowerCase() === currentUserEmail.toLowerCase())) {
        alert("Erro: Email já cadastrado.");
        return;
      }
      if (!currentUserPassword) { // Basic validation for new user password
        alert("Erro: A senha provisória é obrigatória para novos usuários.");
        return;
      }
      const newUser: User = {
        id: `user${Date.now()}`,
        name: currentUserName,
        email: currentUserEmail,
        role: currentUserRole,
        password: currentUserPassword, // Stored for mock auth; in real app, hashed by backend
        creationDate: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_USER', payload: newUser });
    }
    handleCloseModal();
  };
  
  const handleDeleteUser = (userId: string, userName: string) => {
    const userToDelete = state.users.find(u => u.id === userId);
    if (userToDelete && userToDelete.email.toLowerCase() === 'admin@pbr.com') {
        alert('Não é possível excluir o administrador principal.');
        return;
    }
    if (window.confirm(`Tem certeza que deseja excluir o usuário "${userName}"? Esta ação não pode ser desfeita.`)) {
      dispatch({ type: 'DELETE_USER', payload: { userId } });
    }
  };

  const userRoleOptions = Object.entries(USER_ROLES_HIERARCHY)
    .filter(([key]) => key !== UserRole.NONE)
    .map(([value, label]) => ({
      value: value as UserRole,
      label,
  }));

  // Users are now sorted in the DataContext reducer after ADD_USER or UPDATE_USER
  const sortedUsers = state.users;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-inter font-semibold text-pbr-text-main">Gerenciamento de Usuários</h2>
        <Button variant="primary" onClick={handleOpenModalForNew}>
            <UsersIcon className="h-5 w-5 mr-2"/>
            Novo Usuário
        </Button>
      </div>
      <Card>
        {sortedUsers.length > 0 ? (
           <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-pbr-text-secondary uppercase tracking-wider">Nome</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-pbr-text-secondary uppercase tracking-wider">Email</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-pbr-text-secondary uppercase tracking-wider">Papel</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-pbr-text-secondary uppercase tracking-wider">Data Criação</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-pbr-text-secondary uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-pbr-bg-element divide-y divide-gray-200">
                {sortedUsers.map(user => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-pbr-text-main">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-pbr-text-secondary">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-pbr-text-secondary">{getRoleDisplayName(user.role)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-pbr-text-secondary">
                      {user.creationDate ? new Date(user.creationDate).toLocaleDateString('pt-BR') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenModalForEdit(user)} className="text-pbr-primary hover:bg-blue-100">Editar</Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(user.id, user.name)} className="text-pbr-error hover:bg-red-100"
                        disabled={user.email.toLowerCase() === 'admin@pbr.com'} // Also disable button visually for extra safety
                      >Excluir</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-4 p-6 border border-dashed border-gray-300 rounded-md text-center">
              <UsersIcon className="h-16 w-16 text-gray-300 mx-auto mb-2"/>
              <p className="text-pbr-text-secondary">Nenhum usuário cadastrado ainda. Clique em "Novo Usuário" para começar.</p>
          </div>
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingUser ? "Editar Usuário" : "Criar Novo Usuário"}>
        <form onSubmit={handleSubmitUser}>
          <Input
            id="userName"
            label="Nome Completo"
            value={currentUserName}
            onChange={(e) => setCurrentUserName(e.target.value)}
            required
          />
          <Input
            id="userEmail"
            label="Email"
            type="email"
            value={currentUserEmail}
            onChange={(e) => setCurrentUserEmail(e.target.value)}
            required
            disabled={editingUser?.email.toLowerCase() === 'admin@pbr.com'} // Disable email change for admin
          />
          {!editingUser && ( // Only show password field for new users
            <>
              <Input
                id="userPassword"
                label="Senha Provisória"
                type="password"
                value={currentUserPassword}
                onChange={(e) => setCurrentUserPassword(e.target.value)}
                required={!editingUser} // Required only if not editing
                containerClassName="mb-1"
              />
              <p className="text-xs text-pbr-text-secondary mb-4 italic">O usuário deverá trocar esta senha no primeiro login.</p>
            </>
          )}
          <Select
            id="userRole"
            label="Papel do Usuário"
            value={currentUserRole}
            onChange={(e) => setCurrentUserRole(e.target.value as UserRole)}
            options={userRoleOptions}
            required
            disabled={editingUser?.email.toLowerCase() === 'admin@pbr.com'} // Disable role change for admin
          />
          {editingUser && editingUser.email.toLowerCase() === 'admin@pbr.com' && (
            <p className="text-xs text-pbr-warning mt-2 italic">Não é possível alterar o email ou o papel do administrador principal.</p>
          )}
          <div className="mt-6 flex justify-end space-x-3">
            <Button type="button" variant="ghost" onClick={handleCloseModal}>Cancelar</Button>
            <Button type="submit" variant="primary">{editingUser ? "Salvar Alterações" : "Salvar Usuário"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UserListPage;