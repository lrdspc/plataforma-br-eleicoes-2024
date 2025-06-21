
import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants';
import Button from '../components/common/Button';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-pbr-bg-main p-4 text-center">
      <img src="https://picsum.photos/seed/404/300/200" alt="Not Found Illustration" className="w-64 h-40 object-cover rounded-lg mb-8 shadow-lg"/>
      <h1 className="text-6xl font-inter font-bold text-pbr-primary mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-pbr-text-main mb-2">Página Não Encontrada</h2>
      <p className="text-pbr-text-secondary mb-8 max-w-md">
        Oops! Parece que a página que você está procurando não existe ou foi movida.
      </p>
      <Button variant="primary" size="lg">
        <Link to={ROUTES.DASHBOARD}>Voltar para o Início</Link>
      </Button>
    </div>
  );
};

export default NotFoundPage;
