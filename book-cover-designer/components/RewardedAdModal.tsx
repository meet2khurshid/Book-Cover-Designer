import React, { useState, useEffect } from 'react';

interface RewardedAdModalProps {
  isOpen: boolean;
  onClose: () => void; // For closing without reward
  onRewardClaimed: () => void; // For claiming the reward
}

const RewardedAdModal: React.FC<RewardedAdModalProps> = ({ isOpen, onClose, onRewardClaimed }) => {
  const REWARD_DELAY = 5; // in seconds
  const [countdown, setCountdown] = useState(REWARD_DELAY);

  useEffect(() => {
    if (isOpen) {
      setCountdown(REWARD_DELAY); // Reset countdown
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const canClaim = countdown === 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col justify-center items-center z-[101] p-4 text-white" aria-modal="true" role="dialog">
      <div className="bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-lg text-center relative border-2 border-yellow-400">
        <h3 className="text-xl font-bold text-yellow-300 mb-2">🌟 Unlock Premium Feature 🌟</h3>
        <p className="text-slate-300 mb-4">Watch this short ad to download your book cover's <strong className="font-semibold">artwork only</strong> (no text, logos, or barcodes).</p>
        
        <div className="bg-black w-full aspect-video rounded-lg flex items-center justify-center mb-4">
          <p className="text-slate-400">[ Your Ad Content Here ]</p>
        </div>
        
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-2 rounded-full transition-colors bg-black/30 hover:bg-black/60"
          aria-label="Close ad"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>

        <button
          onClick={onRewardClaimed}
          disabled={!canClaim}
          className="w-full py-2 px-6 text-base rounded-full font-bold text-slate-800 shadow-lg transform hover:scale-105 transition-all duration-200 ease-in-out bg-gradient-to-b from-yellow-400 to-yellow-600 border-b-4 border-yellow-700 hover:from-yellow-500 hover:to-yellow-700 active:border-b-2 active:border-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 focus:ring-offset-gray-800 disabled:from-gray-500 disabled:to-gray-700 disabled:border-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed disabled:transform-none"
        >
          {canClaim ? 'Claim Reward & Download' : `Claim Reward in ${countdown}...`}
        </button>
      </div>
    </div>
  );
};

export default RewardedAdModal;