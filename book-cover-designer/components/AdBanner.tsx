import React from 'react';

interface AdBannerProps {
  position: 'top' | 'bottom';
}

const AdBanner: React.FC<AdBannerProps> = ({ position }) => {
  const borderClass = position === 'top' ? 'border-b' : 'border-t';

  return (
    <header
      className={`flex-shrink-0 h-16 bg-gray-200 flex items-center justify-center z-40 ${borderClass} border-gray-300`}
      aria-label="Advertisement banner"
      role="banner"
    >
      <p className="text-gray-500 font-semibold">[AD BANNER]</p>
    </header>
  );
};

export default AdBanner;
