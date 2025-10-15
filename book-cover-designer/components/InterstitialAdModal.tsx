
import React from 'react';

interface InterstitialAdModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InterstitialAdModal: React.FC<InterstitialAdModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[102]" aria-modal="true" role="dialog">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md text-center relative">
        <h3 className="text-sm font-semibold text-gray-500 mb-4">Advertisement</h3>
        
        <div className="bg-gray-200 w-full aspect-[4/3] rounded-md flex items-center justify-center mb-4">
          <p className="text-gray-500">[ Ad Content ]</p>
        </div>
        
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
          aria-label="Close ad"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>

        <button
          onClick={onClose}
          className="w-full py-2 px-5 rounded-full font-bold text-white shadow-lg transform hover:scale-105 transition-all duration-200 ease-in-out bg-gradient-to-b from-blue-500 to-blue-700 border-b-4 border-blue-800 hover:from-blue-600 hover:to-blue-800 active:border-b-2 active:border-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default InterstitialAdModal;