import React from 'react';
import Card from './Card';
import { Dimensions } from '../types';

interface Step2DimensionsProps {
  dimensions: Dimensions;
  setDimensions: React.Dispatch<React.SetStateAction<Dimensions>>;
  onNext: () => void;
  onBack: () => void;
}

const InputField: React.FC<{
  id: keyof Dimensions;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  min: string;
  step: string;
  description?: string;
}> = ({ id, label, value, onChange, placeholder, min, step, description }) => (
  <div className="form-group">
    <label htmlFor={id} className="block mb-2 font-semibold text-gray-700">
      {label}
    </label>
    <input
      type="number"
      id={id}
      name={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      min={min}
      step={step}
      required
      className="w-full p-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-slate-50 focus:bg-white placeholder-slate-400"
    />
    {description && <p className="text-sm text-slate-500 mt-2">{description}</p>}
  </div>
);

const Step2Dimensions: React.FC<Step2DimensionsProps> = ({ dimensions, setDimensions, onNext, onBack }) => {

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDimensions({
      ...dimensions,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Card title="2. Enter Cover Dimensions (in inches)">
      <div className="max-w-sm mx-auto">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <InputField
              id="width"
              label="Width:"
              value={dimensions.width}
              onChange={handleChange}
              placeholder="e.g., 6"
              min="0.1"
              step="0.1"
            />
            <InputField
              id="height"
              label="Height:"
              value={dimensions.height}
              onChange={handleChange}
              placeholder="e.g., 9"
              min="0.1"
              step="0.1"
            />
            <InputField
              id="spine"
              label="Spine:"
              value={dimensions.spine}
              onChange={handleChange}
              placeholder="e.g., 0.5"
              min="0.01"
              step="0.01"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputField
              id="bleed"
              label="Bleed:"
              value={dimensions.bleed}
              onChange={handleChange}
              placeholder="e.g., 0.125"
              min="0"
              step="0.001"
              description="Area outside the trim line."
            />
            <InputField
              id="trim"
              label="Safety Margin:"
              value={dimensions.trim}
              onChange={handleChange}
              placeholder="e.g., 0.125"
              min="0"
              step="0.001"
              description="Keep important content inside."
            />
          </div>
        </div>
      </div>
      <div className="flex flex-row justify-between items-center mt-6 gap-4">
        <button
          onClick={onBack}
          className="py-2 px-6 text-base rounded-full font-bold text-white shadow-lg transform hover:scale-105 transition-all duration-200 ease-in-out bg-gradient-to-b from-slate-500 to-slate-700 border-b-4 border-slate-800 hover:from-slate-600 hover:to-slate-800 active:border-b-2 active:border-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          className="py-2 px-6 text-base rounded-full font-bold text-white shadow-lg transform hover:scale-105 transition-all duration-200 ease-in-out bg-gradient-to-b from-blue-500 to-blue-700 border-b-4 border-blue-800 hover:from-blue-600 hover:to-blue-800 active:border-b-2 active:border-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Set Content →
        </button>
      </div>
    </Card>
  );
};

export default Step2Dimensions;