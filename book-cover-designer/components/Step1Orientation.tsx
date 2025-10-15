
import React from 'react';
import Card from './Card';
import { Orientation } from '../types';

interface OrientationButtonProps {
  value: Orientation;
  label: string;
  description: string;
  currentOrientation: Orientation;
  setOrientation: (value: Orientation) => void;
}

const OrientationButton: React.FC<OrientationButtonProps> = ({ value, label, description, currentOrientation, setOrientation }) => {
  const isChecked = currentOrientation === value;
  return (
    <label className={`flex-1 text-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
      isChecked ? 'border-blue-600 bg-blue-50 font-bold text-blue-800 shadow-sm' : 'border-gray-300 hover:border-blue-400 hover:bg-slate-50'
    }`}>
      <input
        type="radio"
        name="orientation"
        value={value}
        checked={isChecked}
        onChange={() => setOrientation(value)}
        className="hidden"
      />
      <span className="block text-lg">{label}</span>
      <small className="text-slate-500">{description}</small>
    </label>
  );
};

interface Step1OrientationProps {
  orientation: Orientation;
  setOrientation: (orientation: Orientation) => void;
  onNext: () => void;
}

const Step1Orientation: React.FC<Step1OrientationProps> = ({ orientation, setOrientation, onNext }) => {
  return (
    <Card title="1. Select Book Orientation">
      <p className="text-slate-600 mb-4">
        Is your book read left-to-right (like English) or right-to-left (like Arabic)?
      </p>
      <div className="flex flex-col sm:flex-row gap-4 mt-3">
        <OrientationButton 
          value="right"
          label="Right-handed"
          description="(e.g., English, French, Spanish)"
          currentOrientation={orientation}
          setOrientation={setOrientation}
        />
        <OrientationButton 
          value="left"
          label="Left-handed"
          description="(e.g., Arabic, Hebrew, Persian)"
          currentOrientation={orientation}
          setOrientation={setOrientation}
        />
      </div>
      <div className="flex justify-end mt-6">
        <button
          onClick={onNext}
          className="py-2 px-6 text-base rounded-full font-bold text-white shadow-lg transform hover:scale-105 transition-all duration-200 ease-in-out bg-gradient-to-b from-blue-500 to-blue-700 border-b-4 border-blue-800 hover:from-blue-600 hover:to-blue-800 active:border-b-2 active:border-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Continue →
        </button>
      </div>
    </Card>
  );
};

export default Step1Orientation;
