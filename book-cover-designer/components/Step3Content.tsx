import React, { useState } from 'react';
import Card from './Card';
import { BookContent, BackgroundType, Orientation, CustomFont, FrontCoverBackgroundType } from '../types';
import ImageEditor from './ImageEditor';

const ImagePreviewModal: React.FC<{
  isOpen: boolean;
  imageUrl: string | null;
  onClose: () => void;
}> = ({ isOpen, imageUrl, onClose }) => {
  if (!isOpen || !imageUrl) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-[103] p-4" 
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-white p-2 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col relative" 
        onClick={e => e.stopPropagation()}
      >
        <img src={imageUrl} alt="Enlarged artwork" className="w-full h-full object-contain" />
        <button 
          onClick={onClose} 
          className="absolute top-2 right-2 p-2 rounded-full bg-black/20 hover:bg-black/40 transition-colors text-white"
          aria-label="Close enlarged view"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
    </div>
  );
};

const ImageInputField: React.FC<{
  id: string;
  label: string;
  imageSrc: string | null;
  onChange: (base64: string | null) => void;
  onEdit: () => void;
  description: string;
}> = ({ id, label, imageSrc, onChange, onEdit, description }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert("File is too large. Please upload an image smaller than 5MB.");
        e.target.value = ''; // Clear the input
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <label htmlFor={id} className="block mb-2 font-semibold text-gray-700">{label}</label>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <input
          type="file"
          id={id}
          accept="image/png, image/jpeg"
          onChange={handleFileChange}
          className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
        />
        {imageSrc && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <img src={imageSrc} alt="Preview" className="h-12 w-12 object-contain border rounded-md p-1 bg-white" />
            <button
              type="button"
              onClick={onEdit}
              className="py-2 px-4 text-sm rounded-full font-semibold text-white shadow-md transform hover:scale-105 transition-all duration-200 ease-in-out bg-gradient-to-b from-slate-600 to-slate-800 border-b-2 border-slate-900 hover:from-slate-700 hover:to-slate-900 active:border-b-0"
              title="Edit image"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="p-2 rounded-full text-white shadow-md transform hover:scale-105 transition-all duration-200 ease-in-out bg-gradient-to-b from-red-500 to-red-700 border-b-2 border-red-800 hover:from-red-600 hover:to-red-800 active:border-b-0"
              title="Remove image"
            >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            </button>
          </div>
        )}
      </div>
       <p className="text-sm text-slate-500 mt-2">{description}</p>
    </div>
  );
};

const FontSelector: React.FC<{
  id: keyof BookContent;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  isLeftHanded: boolean;
  customFonts: CustomFont[];
}> = ({ id, label, value, onChange, isLeftHanded, customFonts }) => (
  <div>
    <label htmlFor={id} className="block mb-2 font-semibold text-gray-700">{label}</label>
    <select
      id={id}
      name={id}
      value={value}
      onChange={onChange}
      className="w-full max-w-xl p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 focus:bg-white appearance-none"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
        backgroundPosition: 'right 0.5rem center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '1.5em 1.5em',
        paddingRight: '2.5rem',
      }}
    >
      <optgroup label="Standard Fonts">
        <option value="serif">Serif (e.g., Times New Roman)</option>
        <option value="sans-serif">Sans-serif (e.g., Arial)</option>
        <option value="monospace">Monospace (e.g., Courier)</option>
        <option value="cursive">Cursive (e.g., Brush Script)</option>
        <option value="fantasy">Fantasy (e.g., Papyrus)</option>
        {isLeftHanded && <option value="'Noto Nastaliq Urdu', serif">Noto Nastaliq Urdu</option>}
      </optgroup>
      {customFonts.length > 0 && (
        <optgroup label="Custom Fonts">
          {customFonts.map(font => (
            <option key={font.name} value={font.name}>{font.name}</option>
          ))}
        </optgroup>
      )}
    </select>
  </div>
);

type BgType = 'upload' | 'gradient';
const BgTypeToggle: React.FC<{
    value: BgType;
    onChange: (value: BgType) => void;
    colorScheme: 'indigo' | 'teal';
}> = ({ value, onChange, colorScheme }) => (
    <div className="flex items-center gap-2 rounded-lg bg-slate-200 p-1 w-min">
        <button
            type="button"
            onClick={() => onChange('upload')}
            className={`px-3 py-1 rounded-md text-sm font-semibold transition-colors ${value === 'upload' ? `bg-white text-${colorScheme}-700 shadow-sm` : 'bg-transparent text-slate-600 hover:bg-slate-300'}`}
        >
            Upload
        </button>
        <button
            type="button"
            onClick={() => onChange('gradient')}
            className={`px-3 py-1 rounded-md text-sm font-semibold transition-colors ${value === 'gradient' ? `bg-white text-${colorScheme}-700 shadow-sm` : 'bg-transparent text-slate-600 hover:bg-slate-300'}`}
        >
            Gradient
        </button>
    </div>
);

const PRESET_GRADIENTS = [
  { name: 'Sunset', colors: ['#ff7e5f', '#feb47b'], angle: 120 },
  { name: 'Ocean', colors: ['#2193b0', '#6dd5ed'], angle: 120 },
  { name: 'Grapefruit', colors: ['#ff00cc', '#333399'], angle: 90 },
  { name: 'Forest', colors: ['#5A3F37', '#2C7744'], angle: 180 },
  { name: 'Royal', colors: ['#4776E6', '#8E54E9'], angle: 45 },
  { name: 'Steel', colors: ['#757F9A', '#D7DDE8'], angle: 160 },
  { name: 'Peach', colors: ['#FFD8B1', '#E88D67'], angle: 135 },
  { name: 'Night', colors: ['#2c3e50', '#4ca1af'], angle: 120 },
];

const GradientEditor: React.FC<{
    color1: string;
    color2: string;
    angle: number;
    onColorChange: (colorName: 'color1' | 'color2', value: string) => void;
    onAngleChange: (value: number) => void;
    onPresetSelect: (colors: [string, string], angle: number) => void;
}> = ({ color1, color2, angle, onColorChange, onAngleChange, onPresetSelect }) => (
    <div className="space-y-4 pt-2">
        <div>
            <label htmlFor="gradient-preset" className="block text-sm font-semibold text-gray-700 mb-1">Presets</label>
            <select
                id="gradient-preset"
                onChange={(e) => {
                    if (e.target.value) {
                        const preset = PRESET_GRADIENTS.find(p => p.name === e.target.value);
                        if (preset) {
                            onPresetSelect(preset.colors as [string, string], preset.angle);
                        }
                    }
                }}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 focus:bg-white appearance-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem',
                }}
            >
                <option value="">Select a preset...</option>
                {PRESET_GRADIENTS.map(p => (
                    <option key={p.name} value={p.name}>{p.name}</option>
                ))}
            </select>
        </div>
        <div className="flex items-center gap-4">
            <p className="text-sm font-semibold text-gray-700">Colors:</p>
            <input type="color" value={color1} onChange={(e) => onColorChange('color1', e.target.value)} className="w-10 h-10 rounded-md border border-slate-300 cursor-pointer" />
            <input type="color" value={color2} onChange={(e) => onColorChange('color2', e.target.value)} className="w-10 h-10 rounded-md border border-slate-300 cursor-pointer" />
        </div>
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Angle: {angle}°</label>
            <input type="range" min="0" max="360" value={angle} onChange={e => onAngleChange(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
        </div>
    </div>
);

const Accordion: React.FC<{ title: string; children: React.ReactNode, defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => (
    <details className="group border-b border-slate-200" open={defaultOpen}>
      <summary className="cursor-pointer py-4 list-none">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-slate-600">{title}</h3>
          <svg className="w-5 h-5 transition-transform transform group-open:rotate-180 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>
      </summary>
      <div className="pb-6 pt-2 space-y-4">{children}</div>
    </details>
);


interface Step3ContentProps {
  orientation: Orientation;
  content: BookContent;
  setContent: React.Dispatch<React.SetStateAction<BookContent>>;
  onNext: () => void;
  onBack: () => void;
}

const Step3Content: React.FC<Step3ContentProps> = ({ content, setContent, onNext, onBack, orientation }) => {
  const [newFont, setNewFont] = useState<{ file: File | null; name: string }>({ file: null, name: '' });
  const [enlargedImageUrl, setEnlargedImageUrl] = useState<string | null>(null);
  const [editorState, setEditorState] = useState<{
    isOpen: boolean;
    imageUrl: string | null;
    targetField: keyof BookContent | null;
    disableClip?: boolean;
  }>({
    isOpen: false,
    imageUrl: null,
    targetField: null,
    disableClip: false,
  });

  const openImageEditor = (imageUrl: string | null, targetField: keyof BookContent) => {
    if (!imageUrl) return;
    setEditorState({ 
        isOpen: true, 
        imageUrl, 
        targetField,
        disableClip: targetField === 'frontCoverImage' 
    });
  };

  const handleEditorSave = (newImageDataUrl: string) => {
    if (editorState.targetField) {
      setContent(prev => ({ ...prev, [editorState.targetField!]: newImageDataUrl }));
    }
    setEditorState({ isOpen: false, imageUrl: null, targetField: null });
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setContent({ ...content, [e.target.name]: e.target.value });
  };

  const handleImageChange = (name: keyof BookContent, base64: string | null) => {
    setContent(prev => ({ ...prev, [name]: base64 }));
  };
  
  const handleBgTypeChange = (
    part: 'front' | 'spine' | 'back',
    value: 'upload' | 'gradient'
  ) => {
    setContent(prev => {
      const newContent = { ...prev };
      if (part === 'front') {
        newContent.frontCoverBgType = value;
        if (value === 'gradient') newContent.frontCoverImage = null;
      } else if (part === 'spine') {
        newContent.spineBgType = value;
        if (value === 'gradient') newContent.spineImage = null;
      } else {
        newContent.backBgType = value;
        if (value === 'gradient') newContent.backCoverImage = null;
      }
      return newContent;
    });
  };

  const handleAddFont = () => {
    if (!newFont.file || !newFont.name.trim()) {
      alert('Please select a font file and provide a name.');
      return;
    }

    const fontName = newFont.name.trim();

    if (content.customFonts.some(f => f.name === fontName)) {
      alert('A font with this name already exists. Please choose a different name.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const fontUrl = e.target?.result as string;

      const styleEl = document.createElement('style');
      styleEl.id = `font-style-${fontName.replace(/\s/g, '-')}`;
      styleEl.innerHTML = `@font-face { font-family: "${fontName}"; src: url(${fontUrl}); }`;
      document.head.appendChild(styleEl);

      setContent(prev => ({
        ...prev,
        customFonts: [...prev.customFonts, { name: fontName, url: fontUrl }]
      }));

      setNewFont({ file: null, name: '' });
      const fileInput = document.getElementById('font-file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    };
    reader.readAsDataURL(newFont.file);
  };

  const handleRemoveFont = (fontName: string) => {
    const styleEl = document.getElementById(`font-style-${fontName.replace(/\s/g, '-')}`);
    if (styleEl) styleEl.remove();

    if ([content.titleFont, content.subtitleFont, content.authorFont, content.backTextFont, content.spineTitleFont, content.spineAuthorFont, ...content.customTextElements.map(el => el.font)].includes(fontName)) {
        alert(`Warning: The font "${fontName}" is currently in use. Affected text elements will be reset to a default font.`);
    }

    setContent(prev => ({
      ...prev,
      customFonts: prev.customFonts.filter(f => f.name !== fontName),
      titleFont: prev.titleFont === fontName ? 'serif' : prev.titleFont,
      subtitleFont: prev.subtitleFont === fontName ? 'sans-serif' : prev.subtitleFont,
      authorFont: prev.authorFont === fontName ? 'sans-serif' : prev.authorFont,
      backTextFont: prev.backTextFont === fontName ? 'sans-serif' : prev.backTextFont,
      spineTitleFont: prev.spineTitleFont === fontName ? 'serif' : prev.spineTitleFont,
      spineAuthorFont: prev.spineAuthorFont === fontName ? 'sans-serif' : prev.spineAuthorFont,
      customTextElements: prev.customTextElements.map(el => el.font === fontName ? { ...el, font: 'sans-serif' } : el),
    }));
  };

  const handleEnlargeImage = (imageUrl: string) => {
    setEnlargedImageUrl(imageUrl);
  };
  
  return (
    <Card title="3. Add Your Cover Content">
      <div className="space-y-2">
        <Accordion title="📖 Front Cover Text" defaultOpen>
            <div>
              <label htmlFor="title" className="block mb-2 font-semibold text-gray-700">Book Title</label>
              <input type="text" name="title" id="title" value={content.title} onChange={handleTextChange} placeholder="e.g., The Midnight Library" className="w-full max-w-xl p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 focus:bg-white placeholder-slate-400" />
            </div>
            <div>
              <label htmlFor="subtitle" className="block mb-2 font-semibold text-gray-700">Subtitle (Optional)</label>
              <input type="text" name="subtitle" id="subtitle" value={content.subtitle} onChange={handleTextChange} placeholder="e.g., A Novel" className="w-full max-w-xl p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 focus:bg-white placeholder-slate-400" />
            </div>
            <div>
              <label htmlFor="author" className="block mb-2 font-semibold text-gray-700">Author Name</label>
              <input type="text" name="author" id="author" value={content.author} onChange={handleTextChange} placeholder="e.g., Matt Haig" className="w-full max-w-xl p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 focus:bg-white placeholder-slate-400" />
            </div>
        </Accordion>
        
        <Accordion title="🎨 Front Cover Artwork">
            <div className="space-y-4 p-4 border border-indigo-200 rounded-lg bg-indigo-50/50">
                <BgTypeToggle value={content.frontCoverBgType} onChange={(v) => handleBgTypeChange('front', v as BgType)} colorScheme="indigo" />
                {content.frontCoverBgType === 'upload' ? (
                    <div className="pt-2">
                        <ImageInputField id="frontCoverUpload" label="Upload Your Cover Image" imageSrc={content.frontCoverImage} onChange={(base64) => handleImageChange('frontCoverImage', base64)} onEdit={() => openImageEditor(content.frontCoverImage, 'frontCoverImage')} description="Upload your complete front cover artwork. (PNG or JPG, max 5MB)" />
                    </div>
                ) : (
                    <GradientEditor color1={content.frontCoverBgColor1} color2={content.frontCoverBgColor2} angle={content.frontCoverBgAngle} onColorChange={(name, value) => setContent(p => ({...p, [name === 'color1' ? 'frontCoverBgColor1' : 'frontCoverBgColor2']: value}))} onAngleChange={value => setContent(p => ({...p, frontCoverBgAngle: value}))} onPresetSelect={(colors, angle) => setContent(p => ({...p, frontCoverBgColor1: colors[0], frontCoverBgColor2: colors[1], frontCoverBgAngle: angle}))} />
                )}
                {(content.frontCoverImage && content.frontCoverBgType === 'upload') && (
                    <div className="mt-4 text-center">
                        <p className="font-semibold text-gray-700 mb-2">Cover Preview:</p>
                        <img src={content.frontCoverImage} alt="Book cover preview" className="w-48 border rounded-md p-1 bg-white shadow-md mx-auto cursor-pointer" onClick={() => handleEnlargeImage(content.frontCoverImage!)} />
                    </div>
                )}
            </div>
        </Accordion>

        <Accordion title="🎨 Spine & Back Cover Artwork">
            <div className="space-y-6 p-4 border border-teal-200 rounded-lg bg-teal-50/50">
                <div className="space-y-2">
                    <label className="block font-semibold text-gray-700">Spine Background</label>
                    <BgTypeToggle value={content.spineBgType} onChange={(v) => handleBgTypeChange('spine', v)} colorScheme="teal" />
                    {content.spineBgType === 'upload' ? (
                        <div className="pt-2">
                            <ImageInputField id="spineImageUpload" label="Upload Spine Image" imageSrc={content.spineImage} onChange={(base64) => handleImageChange('spineImage', base64)} onEdit={() => openImageEditor(content.spineImage, 'spineImage')} description="Upload a texture or image for the spine. (PNG or JPG, max 5MB)" />
                        </div>
                    ) : (
                        <GradientEditor color1={content.spineBgColor1} color2={content.spineBgColor2} angle={content.spineBgAngle} onColorChange={(name, value) => setContent(p => ({...p, [name === 'color1' ? 'spineBgColor1' : 'spineBgColor2']: value}))} onAngleChange={value => setContent(p => ({...p, spineBgAngle: value}))} onPresetSelect={(colors, angle) => setContent(p => ({...p, spineBgColor1: colors[0], spineBgColor2: colors[1], spineBgAngle: angle}))} />
                    )}
                </div>
                <div className="space-y-2">
                     <label className="block font-semibold text-gray-700">Back Cover Background</label>
                     <BgTypeToggle value={content.backBgType} onChange={(v) => handleBgTypeChange('back', v)} colorScheme="teal" />
                     {content.backBgType === 'upload' ? (
                        <div className="pt-2">
                            <ImageInputField id="backCoverImageUpload" label="Upload Back Cover Image" imageSrc={content.backCoverImage} onChange={(base64) => handleImageChange('backCoverImage', base64)} onEdit={() => openImageEditor(content.backCoverImage, 'backCoverImage')} description="Upload background artwork for the back cover. (PNG or JPG, max 5MB)" />
                        </div>
                     ) : (
                        <GradientEditor color1={content.backBgColor1} color2={content.backBgColor2} angle={content.backBgAngle} onColorChange={(name, value) => setContent(p => ({...p, [name === 'color1' ? 'backBgColor1' : 'backBgColor2']: value}))} onAngleChange={value => setContent(p => ({...p, backBgAngle: value}))} onPresetSelect={(colors, angle) => setContent(p => ({...p, backBgColor1: colors[0], backBgColor2: colors[1], backBgAngle: angle}))} />
                     )}
                </div>
                <div className="mt-4 flex flex-wrap gap-4 justify-center items-end">
                    {content.spineImage && content.spineBgType === 'upload' && (<div className="text-center"><p className="font-semibold text-gray-700 mb-2">Spine Preview:</p><img src={content.spineImage} alt="Spine artwork" className="h-40 border rounded-md p-1 bg-white shadow-md mx-auto cursor-pointer" onClick={() => handleEnlargeImage(content.spineImage!)} /></div>)}
                    {content.backCoverImage && content.backBgType === 'upload' && (<div className="text-center"><p className="font-semibold text-gray-700 mb-2">Back Cover Preview:</p><img src={content.backCoverImage} alt="Back cover artwork" className="w-40 border rounded-md p-1 bg-white shadow-md mx-auto cursor-pointer" onClick={() => handleEnlargeImage(content.backCoverImage!)} /></div>)}
                </div>
            </div>
        </Accordion>

        <Accordion title="✒️ Back Cover Content">
            <div>
              <label htmlFor="aboutText" className="block mb-2 font-semibold text-gray-700">About the Book / Author Blurb</label>
              <textarea name="aboutText" id="aboutText" value={content.aboutText} onChange={handleTextChange} rows={5} placeholder="Enter a captivating summary of the book here..." className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 focus:bg-white placeholder-slate-400"></textarea>
            </div>
            <ImageInputField id="authorImage" label="Author Photo" imageSrc={content.authorImage} onChange={(base64) => handleImageChange('authorImage', base64)} onEdit={() => openImageEditor(content.authorImage, 'authorImage')} description="Upload a photo of the author. (PNG or JPG, max 5MB)" />
            <ImageInputField id="isbnImage" label="ISBN Barcode" imageSrc={content.isbnImage} onChange={(base64) => handleImageChange('isbnImage', base64)} onEdit={() => openImageEditor(content.isbnImage, 'isbnImage')} description="Upload the ISBN barcode image. (PNG format, max 5MB)" />
        </Accordion>

        <Accordion title="🔤 Typography & Fonts">
            <h4 className="text-lg font-semibold text-slate-600">Front Cover Fonts</h4>
            <FontSelector id="titleFont" label="Title Font" value={content.titleFont} onChange={handleTextChange} isLeftHanded={orientation === 'left'} customFonts={content.customFonts} />
            <FontSelector id="subtitleFont" label="Subtitle Font" value={content.subtitleFont} onChange={handleTextChange} isLeftHanded={orientation === 'left'} customFonts={content.customFonts} />
            <FontSelector id="authorFont" label="Author Name Font" value={content.authorFont} onChange={handleTextChange} isLeftHanded={orientation === 'left'} customFonts={content.customFonts} />
            <div className="pt-4 mt-4 border-t border-slate-200">
                <h4 className="text-lg font-semibold text-slate-600 mb-2">Spine & Back Fonts</h4>
                <FontSelector id="spineTitleFont" label="Spine Title Font" value={content.spineTitleFont} onChange={handleTextChange} isLeftHanded={orientation === 'left'} customFonts={content.customFonts} />
                <FontSelector id="spineAuthorFont" label="Spine Author Font" value={content.spineAuthorFont} onChange={handleTextChange} isLeftHanded={orientation === 'left'} customFonts={content.customFonts} />
                <FontSelector id="backTextFont" label="About the Book Font" value={content.backTextFont} onChange={handleTextChange} isLeftHanded={orientation === 'left'} customFonts={content.customFonts} />
            </div>
            <div className="pt-4 mt-4 border-t border-slate-200">
                <h4 className="text-lg font-semibold text-slate-600">Custom Fonts</h4>
                <div className="p-4 border border-slate-200 rounded-lg bg-slate-50/50 space-y-4">
                    <p className="text-sm text-slate-600">Upload your own font files (.ttf, .otf, .woff). They will become available in the font selection dropdowns.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                        <div>
                            <label htmlFor="font-file-upload" className="block mb-2 text-sm font-semibold text-gray-700">Font File</label>
                            <input type="file" id="font-file-upload" accept=".ttf,.otf,.woff,.woff2" onChange={(e) => setNewFont(f => ({ ...f, file: e.target.files ? e.target.files[0] : null }))} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200" />
                        </div>
                        <div>
                            <label htmlFor="font-name" className="block mb-2 text-sm font-semibold text-gray-700">Font Name</label>
                            <input type="text" id="font-name" value={newFont.name} onChange={(e) => setNewFont(f => ({ ...f, name: e.target.value }))} placeholder="e.g., My Cool Font" className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white placeholder-slate-400" />
                        </div>
                    </div>
                    <button onClick={handleAddFont} className="w-full sm:w-auto py-2 px-5 rounded-full font-bold text-white shadow-lg transform hover:scale-105 transition-all duration-200 ease-in-out bg-gradient-to-b from-blue-500 to-blue-700 border-b-4 border-blue-800 hover:from-blue-600 hover:to-blue-800 active:border-b-2 active:border-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">+ Add Font</button>
                    {content.customFonts.length > 0 && (
                        <div className="pt-4 border-t"><h4 className="font-semibold text-gray-700 mb-2">Added Fonts:</h4><ul className="space-y-2">{content.customFonts.map(font => (<li key={font.name} className="flex items-center justify-between bg-white p-2 rounded-md border"><span className="font-mono text-sm">{font.name}</span><button onClick={() => handleRemoveFont(font.name)} className="py-1 px-3 text-xs rounded-full font-semibold text-white shadow-md transform hover:scale-105 transition-all duration-200 ease-in-out bg-gradient-to-b from-red-500 to-red-700 border-b-2 border-red-800 hover:from-red-600 hover:to-red-800 active:border-b-0">REMOVE</button></li>))}</ul></div>
                    )}
                </div>
            </div>
        </Accordion>
        
        <Accordion title="🏢 Shared Elements">
            <ImageInputField id="publisherLogo" label="Publisher Logo" imageSrc={content.publisherLogo} onChange={(base64) => handleImageChange('publisherLogo', base64)} onEdit={() => openImageEditor(content.publisherLogo, 'publisherLogo')} description="This logo will appear on the front, back, and spine. (PNG with transparency, max 5MB)" />
        </Accordion>
      </div>

      <div className="flex flex-row justify-between items-center mt-8 gap-4">
        <button onClick={onBack} className="py-2 px-6 text-base rounded-full font-bold text-white shadow-lg transform hover:scale-105 transition-all duration-200 ease-in-out bg-gradient-to-b from-slate-500 to-slate-700 border-b-4 border-slate-800 hover:from-slate-600 hover:to-slate-800 active:border-b-2 active:border-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500">← Back</button>
        <button onClick={onNext} className="py-2 px-6 text-base rounded-full font-bold text-white shadow-lg transform hover:scale-105 transition-all duration-200 ease-in-out bg-gradient-to-b from-green-500 to-green-700 border-b-4 border-green-800 hover:from-green-600 hover:to-green-800 active:border-b-2 active:border-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">Generate Preview →</button>
      </div>

      <ImagePreviewModal isOpen={!!enlargedImageUrl} imageUrl={enlargedImageUrl} onClose={() => setEnlargedImageUrl(null)} />
      <ImageEditor
        isOpen={editorState.isOpen}
        imageUrl={editorState.imageUrl}
        onClose={() => setEditorState({ isOpen: false, imageUrl: null, targetField: null })}
        onSave={handleEditorSave}
        disableClip={editorState.disableClip}
      />
    </Card>
  );
};

export default Step3Content;