
import React, { ReactNode } from 'react';
import { CloseIcon } from '../icons/Icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        className={`bg-pbr-bg-element p-6 rounded-lg shadow-xl w-full ${sizeClasses[size]} relative max-h-[90vh] flex flex-col`}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        <div className="flex justify-between items-center mb-4">
          {title && <h2 id="modal-title" className="text-xl font-inter font-semibold text-pbr-text-main">{title}</h2>}
          <button
            onClick={onClose}
            className="text-pbr-text-secondary hover:text-pbr-text-main"
            aria-label="Fechar modal"
          >
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="overflow-y-auto flex-grow">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
