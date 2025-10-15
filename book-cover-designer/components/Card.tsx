import React from 'react';

interface CardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, children, className = '' }) => {
  return (
    <div className={`bg-white p-6 rounded-xl shadow-lg transition-all duration-300 ease-in-out ${className}`}>
      <h2 className="text-lg font-semibold text-blue-600 border-b-2 border-slate-200 pb-2 mb-3">
        {title}
      </h2>
      {children}
    </div>
  );
};

export default Card;