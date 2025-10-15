
import React, { useState, useRef, useEffect, useCallback, useMemo, useLayoutEffect } from 'react';
import Card from './Card';
import { Orientation, BookContent, Dimensions, Position, TextAlign, Size, CustomTextElement, CustomImageElement, ClipShape } from '../types';
import RewardedAdModal from './RewardedAdModal';
import InterstitialAdModal from './InterstitialAdModal';

interface EditorPopoverProps {
  config: {
    // For predefined elements
    sizeElement?: keyof BookContent;
    colorElement?: keyof BookContent;
    fontElement?: keyof BookContent;
    alignElement?: keyof BookContent;
    lineHeightElement?: keyof BookContent;
    letterSpacingElement?: keyof BookContent;
    strokeWidthElement?: keyof BookContent;
    strokeColorElement?: keyof BookContent;
    shadowBlurElement?: keyof BookContent;
    shadowColorElement?: keyof BookContent;
    label: string;
    // For custom elements
    customElementIndex?: number;
    // Position
    top: number;
    left: number;
  };
  content: BookContent;
  setContent: React.Dispatch<React.SetStateAction<BookContent>>;
  onClose: () => void;
  onDelete?: (index: number) => void;
  orientation: Orientation;
}


const EditorPopover: React.FC<EditorPopoverProps> = ({ config, content, setContent, onClose, onDelete, orientation }) => {
  const popoverRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (popoverRef.current) {
        const popover = popoverRef.current;

        // Reset styles to begin calculation
        popover.style.left = `${config.left}px`;
        popover.style.right = 'auto';
        popover.style.transform = 'translateX(-50%)';

        const popoverRect = popover.getBoundingClientRect();
        
        if (popoverRect.left < 10) {
            popover.style.left = '10px';
            popover.style.transform = 'none';
        } else if (popoverRect.right > window.innerWidth - 10) {
            popover.style.left = 'auto';
            popover.style.right = '10px';
            popover.style.transform = 'none';
        }

        if (popoverRect.bottom > window.innerHeight - 10) {
            const overflow = popoverRect.bottom - (window.innerHeight - 10);
            popover.style.top = `${config.top - overflow}px`;
        }
    }
  }, [config.top, config.left]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);
  
  const isCustom = typeof config.customElementIndex === 'number';
  const customElement = isCustom ? content.customTextElements[config.customElementIndex!] : null;
  const isSpineText = isCustom && customElement?.coverPart === 'spine';

  // FIX: Widen key type to accept keys from both BookContent and CustomTextElement.
  const handleGenericChange = (key: keyof BookContent | keyof CustomTextElement, value: any) => {
    if (isCustom) {
      setContent(prev => {
        const newElements = [...prev.customTextElements];
        newElements[config.customElementIndex!] = { ...newElements[config.customElementIndex!], [key as keyof CustomTextElement]: value };
        return { ...prev, customTextElements: newElements };
      });
    } else {
      setContent(prev => ({ ...prev, [key as keyof BookContent]: value }));
    }
  };
  
  // FIX: Widen elementKey type to accept keys from both BookContent and CustomTextElement.
  const getProp = <T,>(elementKey: keyof BookContent | keyof CustomTextElement | undefined, defaultValue: T): T => {
    if (isCustom) {
      // The elementKey will be a keyof CustomTextElement, so we can cast.
      return customElement ? customElement[elementKey as keyof CustomTextElement] as T : defaultValue;
    }
    // The elementKey will be a keyof BookContent, so we can cast.
    return elementKey ? (content[elementKey as keyof BookContent] as T) : defaultValue;
  }

  const currentSize = getProp<number>(isCustom ? 'fontSize' : config.sizeElement, 0);
  const currentColor = getProp<string>(isCustom ? 'fontColor' : config.colorElement, '');
  const currentFont = getProp<string>(isCustom ? 'font' : config.fontElement, '');
  const currentAlign = getProp<TextAlign>(isCustom ? 'align' : config.alignElement, 'center');
  const currentLineHeight = getProp<number>(isCustom ? 'lineHeight' : config.lineHeightElement, 1.2);
  const currentLetterSpacing = getProp<number>(isCustom ? 'letterSpacing' : config.letterSpacingElement, 0);
  const currentStrokeWidth = getProp<number>(isCustom ? 'strokeWidth' : config.strokeWidthElement, 0);
  const currentStrokeColor = getProp<string>(isCustom ? 'strokeColor' : config.strokeColorElement, '#000000');
  const currentShadowBlur = getProp<number>(isCustom ? 'shadowBlur' : config.shadowBlurElement, 0);
  const currentShadowColor = getProp<string>(isCustom ? 'shadowColor' : config.shadowColorElement, '#000000');
  const currentText = isCustom ? customElement?.text || '' : '';
  
  const AdvancedControlGroup: React.FC<{title: string, children: React.ReactNode}> = ({title, children}) => (
    <details className="group border-t border-slate-200 pt-3">
      <summary className="cursor-pointer font-medium text-slate-600 list-none group-open:mb-3">
        <div className="flex items-center justify-between">
          <span>{title}</span>
          <svg className="w-4 h-4 transition-transform transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>
      </summary>
      <div className="space-y-4 pl-2 border-l-2 border-slate-200">{children}</div>
    </details>
  );
  
  const alignmentOptions: TextAlign[] = ['left', 'center', 'right'];
  if (config.alignElement === 'backTextAlign' || (isCustom && customElement?.coverPart === 'back')) {
    alignmentOptions.push('justify');
  }

  const FontSelect: React.FC<{value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void}> = ({value, onChange}) => (
    <select value={value} onChange={onChange} className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-slate-50 text-slate-800 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600">
        <optgroup label="Standard Fonts">
          <option value="serif">Serif</option>
          <option value="sans-serif">Sans-serif</option>
          <option value="monospace">Monospace</option>
          <option value="cursive">Cursive</option>
          <option value="fantasy">Fantasy</option>
          {orientation === 'left' && <option value="'Noto Nastaliq Urdu', serif">Noto Nastaliq Urdu</option>}
        </optgroup>
        {content.customFonts.length > 0 && (
          <optgroup label="Custom Fonts">
            {content.customFonts.map(font => (
              <option key={font.name} value={font.name}>{font.name}</option>
            ))}
          </optgroup>
        )}
    </select>
  );

  return (
    <div
      ref={popoverRef}
      style={{ top: config.top }}
      className="absolute z-50 bg-white p-4 rounded-lg shadow-2xl border border-slate-300 w-72"
      onClick={e => e.stopPropagation()}
    >
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-bold text-slate-700 text-base">Editing: {config.label}</h4>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-2xl leading-none">&times;</button>
      </div>
      <div className="space-y-4">
        {isCustom && (
            <div>
              <label className="text-sm font-medium text-slate-600 block mb-1">Text Content</label>
              <textarea value={currentText} onChange={(e) => handleGenericChange('text', e.target.value)} rows={3} className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-slate-50 text-slate-800 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600"></textarea>
            </div>
        )}
        <div>
          <label className="text-sm font-medium text-slate-600 block mb-1">Font Size: {currentSize}pt</label>
          <input type="range" min="8" max="150" step="1" value={currentSize} onChange={(e) => handleGenericChange(isCustom ? 'fontSize' : config.sizeElement!, Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-600 block mb-1">Color</label>
          <div className="flex items-center gap-2">
            <input type="color" value={currentColor} onChange={(e) => handleGenericChange(isCustom ? 'fontColor' : config.colorElement!, e.target.value)} className="w-8 h-8 p-0 border-none rounded cursor-pointer bg-white" />
            <input type="text" value={currentColor} onChange={(e) => handleGenericChange(isCustom ? 'fontColor' : config.colorElement!, e.target.value)} className="w-full p-1 border border-slate-300 rounded text-sm bg-slate-50 text-slate-800 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600" />
          </div>
        </div>
        {(config.fontElement || isCustom) && (
           <div>
            <label className="text-sm font-medium text-slate-600 block mb-1">Font Family</label>
            <FontSelect value={currentFont} onChange={(e) => handleGenericChange(isCustom ? 'font' : config.fontElement!, e.target.value)} />
          </div>
        )}
        {(config.alignElement || (isCustom && !isSpineText)) && (
            <div>
                <label className="text-sm font-medium text-slate-600 block mb-1">Alignment</label>
                <div className="flex items-center justify-between gap-1 rounded-lg bg-slate-200 p-1 w-full">
                    {alignmentOptions.map(align => (
                        <button key={align} type="button" onClick={() => handleGenericChange(isCustom ? 'align' : config.alignElement!, align)} className={`flex-1 capitalize px-3 py-1 rounded-md text-sm font-semibold transition-colors ${currentAlign === align ? 'bg-white text-blue-700 shadow-sm' : 'bg-transparent text-slate-600 hover:bg-slate-300'}`}>{align}</button>
                    ))}
                </div>
            </div>
        )}

        <AdvancedControlGroup title="Spacing">
            {(config.lineHeightElement || (isCustom && !isSpineText)) && (
                <div>
                    <label className="text-sm font-medium text-slate-600 block mb-1">Line Height: {currentLineHeight.toFixed(1)}</label>
                    <input type="range" min="0.8" max="3" step="0.1" value={currentLineHeight} onChange={(e) => handleGenericChange(isCustom ? 'lineHeight' : config.lineHeightElement!, Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"/>
                </div>
            )}
            {(config.letterSpacingElement || isCustom) && (
                <div>
                    <label className="text-sm font-medium text-slate-600 block mb-1">Letter Spacing: {currentLetterSpacing.toFixed(1)}pt</label>
                    <input type="range" min="-5" max="20" step="0.5" value={currentLetterSpacing} onChange={(e) => handleGenericChange(isCustom ? 'letterSpacing' : config.letterSpacingElement!, Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"/>
                </div>
            )}
        </AdvancedControlGroup>
        
        <AdvancedControlGroup title="Stroke">
             {(config.strokeWidthElement || isCustom) && (
                <div>
                    <label className="text-sm font-medium text-slate-600 block mb-1">Stroke Width: {currentStrokeWidth.toFixed(1)}pt</label>
                    <input type="range" min="0" max="10" step="0.5" value={currentStrokeWidth} onChange={(e) => handleGenericChange(isCustom ? 'strokeWidth' : config.strokeWidthElement!, Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"/>
                </div>
            )}
            {(config.strokeColorElement || isCustom) && (
                <div>
                    <label className="text-sm font-medium text-slate-600 block mb-1">Stroke Color</label>
                    <div className="flex items-center gap-2">
                        <input type="color" value={currentStrokeColor} onChange={(e) => handleGenericChange(isCustom ? 'strokeColor' : config.strokeColorElement!, e.target.value)} className="w-8 h-8 p-0 border-none rounded cursor-pointer bg-white" />
                        <input type="text" value={currentStrokeColor} onChange={(e) => handleGenericChange(isCustom ? 'strokeColor' : config.strokeColorElement!, e.target.value)} className="w-full p-1 border border-slate-300 rounded text-sm bg-slate-50 text-slate-800 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600" />
                    </div>
                </div>
            )}
        </AdvancedControlGroup>
        
        <AdvancedControlGroup title="Shadow">
            {(config.shadowBlurElement || isCustom) && (
                <div>
                    <label className="text-sm font-medium text-slate-600 block mb-1">Shadow Blur: {currentShadowBlur.toFixed(0)}pt</label>
                    <input type="range" min="0" max="30" step="1" value={currentShadowBlur} onChange={(e) => handleGenericChange(isCustom ? 'shadowBlur' : config.shadowBlurElement!, Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"/>
                </div>
            )}
            {(config.shadowColorElement || isCustom) && (
                <div>
                    <label className="text-sm font-medium text-slate-600 block mb-1">Shadow Color</label>
                    <div className="flex items-center gap-2">
                        <input type="color" value={currentShadowColor} onChange={(e) => handleGenericChange(isCustom ? 'shadowColor' : config.shadowColorElement!, e.target.value)} className="w-8 h-8 p-0 border-none rounded cursor-pointer bg-white" />
                        <input type="text" value={currentShadowColor} onChange={(e) => handleGenericChange(isCustom ? 'shadowColor' : config.shadowColorElement!, e.target.value)} className="w-full p-1 border border-slate-300 rounded text-sm bg-slate-50 text-slate-800 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600" />
                    </div>
                </div>
            )}
        </AdvancedControlGroup>
        {isCustom && onDelete && (
            <div className="border-t border-red-200 pt-3 mt-3">
                <button
                  onClick={() => onDelete(config.customElementIndex!)}
                  className="w-full py-2 px-5 rounded-full font-bold text-white shadow-lg transform hover:scale-105 transition-all duration-200 ease-in-out bg-gradient-to-b from-red-500 to-red-700 border-b-4 border-red-800 hover:from-red-600 hover:to-red-800 active:border-b-2 active:border-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                    Delete Text Box
                </button>
            </div>
        )}
      </div>
    </div>
  );
};


const PreviewModal: React.FC<{ 
    imageUrl: string; 
    onClose: () => void; 
    onDownloadWithText: () => void;
    onUnlockWithoutText: () => void;
    isGeneratingPremium: boolean;
}> = ({ imageUrl, onClose, onDownloadWithText, onUnlockWithoutText, isGeneratingPremium }) => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[100] p-4" onClick={onClose}>
        <div className="bg-white rounded-xl shadow-2xl p-4 sm:p-6 max-w-4xl max-h-[90vh] overflow-auto flex flex-col" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center border-b pb-3 mb-4">
            <h3 className="text-2xl font-bold text-slate-700">Final Preview</h3>
            <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-3xl leading-none">&times;</button>
          </div>
          <div className="flex-grow overflow-auto bg-slate-100 p-2 rounded-lg">
            <img src={imageUrl} alt="High-resolution book cover preview" className="max-w-full max-h-full mx-auto" />
          </div>
          <div className="flex flex-col sm:flex-row justify-end items-center mt-6 gap-3">
             <button onClick={onDownloadWithText} className="w-full sm:w-auto py-2 px-6 text-base rounded-full font-bold text-white shadow-lg transform hover:scale-105 transition-all duration-200 ease-in-out bg-gradient-to-b from-green-500 to-green-700 border-b-4 border-green-800 hover:from-green-600 hover:to-green-800 active:border-b-2 active:border-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                Download with Text (Free)
             </button>
             <button onClick={onUnlockWithoutText} disabled={isGeneratingPremium} className="w-full sm:w-auto py-2 px-6 text-base rounded-full font-bold text-white shadow-lg transform hover:scale-105 transition-all duration-200 ease-in-out bg-gradient-to-b from-purple-500 to-purple-700 border-b-4 border-purple-800 hover:from-purple-600 hover:to-purple-800 active:border-b-2 active:border-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:from-purple-400 disabled:to-purple-600 disabled:border-purple-700 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {isGeneratingPremium ? (
                  <><svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Generating...</>
                ) : (
                  <><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" /></svg> Unlock Artwork-Only Download</>
                )}
             </button>
          </div>
        </div>
      </div>
    );
};

type DraggableKey = keyof BookContent;
type KeyPaths = { position: DraggableKey; size?: DraggableKey; };
type HandleStartType = (e: React.MouseEvent | React.TouchEvent, keyPaths: KeyPaths, action: 'drag' | 'resize', container: HTMLDivElement | null, customElementIndex?: number) => void;
type HandleTextClickType = (config: Omit<EditorPopoverProps['config'], 'top' | 'left'>, e: React.MouseEvent) => void;

const getTextStyle = (
    fontSize: number, font: string, color: string, align: TextAlign,
    lineHeight: number, letterSpacing: number,
    strokeWidth: number, strokeColor: string,
    shadowBlur: number, shadowColor: string,
    scaleFactor: number
  ): React.CSSProperties => {
      const ptToPx = (pt: number) => pt * scaleFactor / 72;
      return {
          fontSize: `${ptToPx(fontSize)}px`,
          fontFamily: font,
          color: color,
          textAlign: align,
          lineHeight: lineHeight,
          letterSpacing: `${ptToPx(letterSpacing)}px`,
          // @ts-ignore: vendor prefix
          WebkitTextStroke: strokeWidth > 0 ? `${ptToPx(strokeWidth)}px ${strokeColor}` : '0',
          textShadow: shadowBlur > 0 ? `${ptToPx(2)}px ${ptToPx(2)}px ${ptToPx(shadowBlur)}px ${shadowColor}` : 'none',
      };
  };

const DraggableResizableItem: React.FC<{
    keyPaths: KeyPaths;
    position: Position;
    size: Size | null;
    handleStart: HandleStartType;
    containerRef: React.RefObject<HTMLDivElement>;
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    isResizable?: boolean | 'horizontal';
    isCentered?: boolean;
    onClick?: (e: React.MouseEvent) => void;
    customElementIndex?: number;
  }> = React.memo(({ keyPaths, position, size, handleStart, containerRef, children, className, style, isResizable = true, isCentered = true, onClick, customElementIndex }) => {
  
    const itemStyle: React.CSSProperties = useMemo(() => ({
      position: 'absolute',
      top: `${position.y}%`,
      left: `${position.x}%`,
      width: size ? `${size.width}%` : 'auto',
      transform: isCentered ? 'translate(-50%, -50%)' : 'translate(0, 0)',
      ...style
    }), [position, size, isCentered, style]);
  
    return (
      <div
        style={itemStyle}
        className={`group transition-all hover:outline-dashed hover:outline-2 hover:outline-offset-2 hover:outline-sky-300 ${className}`}
        onMouseDown={(e) => handleStart(e, keyPaths, 'drag', containerRef.current, customElementIndex)}
        onTouchStart={(e) => handleStart(e, keyPaths, 'drag', containerRef.current, customElementIndex)}
        onClick={onClick}
      >
        {children}
        {isResizable && (
           <div
            className={`absolute ${typeof isResizable === 'string' ? 'top-1/2 -translate-y-1/2 -right-2 w-4 h-6 cursor-ew-resize rounded-full' : '-right-2 -bottom-2 w-5 h-5 cursor-se-resize rounded-full'} bg-sky-400 border-2 border-white`}
            onMouseDown={(e) => handleStart(e, keyPaths, 'resize', containerRef.current, customElementIndex)}
            onTouchStart={(e) => handleStart(e, keyPaths, 'resize', containerRef.current, customElementIndex)}
          />
        )}
      </div>
    );
});

const FrontCover: React.FC<{
    width: number; height: number; content: BookContent; scaleFactor: number; handleStart: HandleStartType; handleTextClick: HandleTextClickType; children?: React.ReactNode;
}> = React.memo(({ width, height, content, scaleFactor, handleStart, handleTextClick, children }) => {
    const coverRef = useRef<HTMLDivElement>(null);
    const bgImage = content.frontCoverBgType === 'upload' && content.frontCoverImage
      ? `url(${content.frontCoverImage})`
      : `linear-gradient(${content.frontCoverBgAngle}deg, ${content.frontCoverBgColor1}, ${content.frontCoverBgColor2})`;
    
    return (
      <div ref={coverRef} style={{ width, height, backgroundImage: bgImage, backgroundSize: 'cover', backgroundPosition: 'center' }} className="relative text-center overflow-hidden">
        {content.frontCoverImage && <div className="absolute inset-0 bg-black bg-opacity-30"></div>}
        
        {content.title &&
          <DraggableResizableItem keyPaths={{ position: 'titlePosition' }} position={content.titlePosition} size={null} handleStart={handleStart} containerRef={coverRef} isResizable={false} style={{ cursor: 'move', zIndex: 10, padding: '0.25rem', userSelect: 'none' }} className="w-full">
              <h3 onClick={(e) => handleTextClick({ sizeElement: 'titleFontSize', colorElement: 'titleFontColor', fontElement: 'titleFont', alignElement: 'titleAlign', label: 'Title', lineHeightElement: 'titleLineHeight', letterSpacingElement: 'titleLetterSpacing', strokeWidthElement: 'titleStrokeWidth', strokeColorElement: 'titleStrokeColor', shadowBlurElement: 'titleShadowBlur', shadowColorElement: 'titleShadowColor' }, e)} style={getTextStyle(content.titleFontSize, content.titleFont, content.titleFontColor, content.titleAlign, content.titleLineHeight, content.titleLetterSpacing, content.titleStrokeWidth, content.titleStrokeColor, content.titleShadowBlur, content.titleShadowColor, scaleFactor)} className="font-bold">{content.title}</h3>
          </DraggableResizableItem>
        }

        {content.subtitle && (
          <DraggableResizableItem keyPaths={{ position: 'subtitlePosition' }} position={content.subtitlePosition} size={null} handleStart={handleStart} containerRef={coverRef} isResizable={false} style={{ cursor: 'move', zIndex: 10, padding: '0.25rem', userSelect: 'none' }} className="w-full">
            <p onClick={(e) => handleTextClick({ sizeElement: 'subtitleFontSize', colorElement: 'subtitleFontColor', fontElement: 'subtitleFont', alignElement: 'subtitleAlign', label: 'Subtitle', lineHeightElement: 'subtitleLineHeight', letterSpacingElement: 'subtitleLetterSpacing', strokeWidthElement: 'subtitleStrokeWidth', strokeColorElement: 'subtitleStrokeColor', shadowBlurElement: 'subtitleShadowBlur', shadowColorElement: 'subtitleShadowColor' }, e)} style={getTextStyle(content.subtitleFontSize, content.subtitleFont, content.subtitleFontColor, content.subtitleAlign, content.subtitleLineHeight, content.subtitleLetterSpacing, content.subtitleStrokeWidth, content.subtitleStrokeColor, content.subtitleShadowBlur, content.subtitleShadowColor, scaleFactor)} className="opacity-90">{content.subtitle}</p>
          </DraggableResizableItem>
        )}
        
        {content.author &&
          <DraggableResizableItem keyPaths={{ position: 'authorPosition' }} position={content.authorPosition} size={null} handleStart={handleStart} containerRef={coverRef} isResizable={false} style={{ cursor: 'move', zIndex: 10, padding: '0.25rem', userSelect: 'none' }} className="w-full">
            <p onClick={(e) => handleTextClick({ sizeElement: 'authorFontSize', colorElement: 'authorFontColor', fontElement: 'authorFont', alignElement: 'authorAlign', label: 'Author', lineHeightElement: 'authorLineHeight', letterSpacingElement: 'authorLetterSpacing', strokeWidthElement: 'authorStrokeWidth', strokeColorElement: 'authorStrokeColor', shadowBlurElement: 'authorShadowBlur', shadowColorElement: 'authorShadowColor' }, e)} style={getTextStyle(content.authorFontSize, content.authorFont, content.authorFontColor, content.authorAlign, content.authorLineHeight, content.authorLetterSpacing, content.authorStrokeWidth, content.authorStrokeColor, content.authorShadowBlur, content.authorShadowColor, scaleFactor)}>{content.author}</p>
          </DraggableResizableItem>
        }
        
        {content.publisherLogo && (
          <DraggableResizableItem keyPaths={{ position: 'frontPublisherLogoPosition', size: 'frontPublisherLogoSize' }} position={content.frontPublisherLogoPosition} size={content.frontPublisherLogoSize} handleStart={handleStart} containerRef={coverRef} style={{cursor: 'move', zIndex: 11}}>
            <img src={content.publisherLogo} alt="Publisher Logo" className="w-full h-auto object-contain" />
          </DraggableResizableItem>
        )}
        
        {content.customTextElements.filter(el => el.coverPart === 'front').map((el, index) => {
            const originalIndex = content.customTextElements.findIndex(origEl => origEl.id === el.id);
            return (
                <DraggableResizableItem
                    key={el.id}
                    keyPaths={{ position: 'position', size: 'size' } as any}
                    position={el.position}
                    size={el.size}
                    handleStart={handleStart}
                    containerRef={coverRef}
                    isCentered={false}
                    isResizable="horizontal"
                    customElementIndex={originalIndex}
                    style={{ cursor: 'move', zIndex: 12, userSelect: 'none' }}
                    onClick={(e) => handleTextClick({ customElementIndex: originalIndex, label: 'Custom Text'}, e)}
                >
                  <p style={getTextStyle(el.fontSize, el.font, el.fontColor, el.align, el.lineHeight, el.letterSpacing, el.strokeWidth, el.strokeColor, el.shadowBlur, el.shadowColor, scaleFactor)} className="p-1 w-full h-full">{el.text}</p>
                </DraggableResizableItem>
            );
        })}
        {children}
      </div>
    );
});
  
const Spine: React.FC<{
    width: number; height: number; content: BookContent; scaleFactor: number; handleStart: HandleStartType; handleTextClick: HandleTextClickType; children?: React.ReactNode;
}> = React.memo(({ width, height, content, scaleFactor, handleStart, handleTextClick, children }) => {
    const spineRef = useRef<HTMLDivElement>(null);
    const bgImage = content.spineBgType === 'upload' && content.spineImage
        ? `url(${content.spineImage})`
        : `linear-gradient(${content.spineBgAngle}deg, ${content.spineBgColor1}, ${content.spineBgColor2})`;
    
    const ptToPx = (pt: number) => pt * scaleFactor / 72;

    return (
      <div ref={spineRef} style={{ width, height, backgroundImage: bgImage, backgroundSize: 'cover', backgroundPosition: 'center' }} className="relative text-white flex flex-col items-center justify-between py-4 px-1 overflow-hidden border-x border-dashed border-slate-300/50">
        {content.spineImage && <div className="absolute inset-0 bg-black bg-opacity-30"></div>}
        
        {content.title &&
          <DraggableResizableItem keyPaths={{ position: 'spineTitlePosition' }} position={content.spineTitlePosition} size={null} handleStart={handleStart} containerRef={spineRef} isResizable={false} style={{ cursor: 'move', zIndex: 10, userSelect: 'none' }}>
            <div onClick={(e) => handleTextClick({sizeElement: 'spineTitleFontSize', colorElement: 'spineTitleFontColor', fontElement: 'spineTitleFont', label: 'Spine Title', letterSpacingElement: 'spineTitleLetterSpacing'}, e)} className="[writing-mode:vertical-rl] transform rotate-180 text-center" style={{color: content.spineTitleFontColor}}>
              <span className="font-bold" style={{fontSize: `${ptToPx(content.spineTitleFontSize)}px`, fontFamily: content.spineTitleFont, letterSpacing: `${ptToPx(content.spineTitleLetterSpacing)}px`}}>{content.title}</span>
            </div>
          </DraggableResizableItem>
        }

        {content.author &&
          <DraggableResizableItem keyPaths={{ position: 'spineAuthorPosition' }} position={content.spineAuthorPosition} size={null} handleStart={handleStart} containerRef={spineRef} isResizable={false} style={{ cursor: 'move', zIndex: 10, userSelect: 'none' }}>
            <div onClick={(e) => handleTextClick({sizeElement: 'spineAuthorFontSize', colorElement: 'spineAuthorFontColor', fontElement: 'spineAuthorFont', label: 'Spine Author', letterSpacingElement: 'spineAuthorLetterSpacing'}, e)} className="[writing-mode:vertical-rl] transform rotate-180 text-center" style={{color: content.spineAuthorFontColor}}>
              <span style={{fontSize: `${ptToPx(content.spineAuthorFontSize)}px`, fontFamily: content.spineAuthorFont, letterSpacing: `${ptToPx(content.spineAuthorLetterSpacing)}px`}}>{content.author}</span>
            </div>
          </DraggableResizableItem>
        }
        
        {content.publisherLogo && (
          <DraggableResizableItem keyPaths={{ position: 'spinePublisherLogoPosition', size: 'spinePublisherLogoSize' }} position={content.spinePublisherLogoPosition} size={content.spinePublisherLogoSize} handleStart={handleStart} containerRef={spineRef} style={{cursor: 'move', zIndex: 11}}>
            <img src={content.publisherLogo} alt="Publisher Logo" className="w-full h-auto object-contain" />
          </DraggableResizableItem>
        )}

        {content.customTextElements.filter(el => el.coverPart === 'spine').map((el) => {
            const originalIndex = content.customTextElements.findIndex(origEl => origEl.id === el.id);
            const textStyle: React.CSSProperties = {
                fontSize: `${ptToPx(el.fontSize)}px`, 
                fontFamily: el.font, 
                color: el.fontColor,
                letterSpacing: `${ptToPx(el.letterSpacing)}px`,
                // @ts-ignore
                WebkitTextStroke: el.strokeWidth > 0 ? `${ptToPx(el.strokeWidth)}px ${el.strokeColor}` : '0',
                textShadow: el.shadowBlur > 0 ? `${ptToPx(1)}px ${ptToPx(1)}px ${ptToPx(el.shadowBlur)}px ${el.shadowColor}` : 'none',
            };
            return (
                <DraggableResizableItem
                    key={el.id}
                    keyPaths={{ position: 'position' } as any}
                    position={el.position}
                    size={null}
                    handleStart={handleStart}
                    containerRef={spineRef}
                    isResizable={false}
                    customElementIndex={originalIndex}
                    style={{ cursor: 'move', zIndex: 12, userSelect: 'none' }}
                >
                  <div 
                    onClick={(e) => handleTextClick({ customElementIndex: originalIndex, label: 'Custom Spine Text'}, e)}
                    className="[writing-mode:vertical-rl] transform rotate-180 text-center p-1"
                  >
                    <span style={textStyle}>{el.text}</span>
                  </div>
                </DraggableResizableItem>
            );
        })}
        {children}
      </div>
    );
});
  
const BackCover: React.FC<{
    width: number; height: number; content: BookContent; scaleFactor: number; handleStart: HandleStartType; handleTextClick: HandleTextClickType; children?: React.ReactNode;
}> = React.memo(({ width, height, content, scaleFactor, handleStart, handleTextClick, children }) => {
    const backRef = useRef<HTMLDivElement>(null);
    const textStyle = useMemo(() => getTextStyle(content.backTextFontSize, content.backTextFont, content.backTextColor, content.backTextAlign, content.backTextLineHeight, content.backTextLetterSpacing, content.backTextStrokeWidth, content.backTextStrokeColor, content.backTextShadowBlur, content.backTextShadowColor, scaleFactor),
        [content.backTextFontSize, content.backTextFont, content.backTextColor, content.backTextAlign, content.backTextLineHeight, content.backTextLetterSpacing, content.backTextStrokeWidth, content.backTextStrokeColor, content.backTextShadowBlur, content.backTextShadowColor, scaleFactor]
    );
    const bgImage = content.backBgType === 'upload' && content.backCoverImage
        ? `url(${content.backCoverImage})`
        : `linear-gradient(${content.backBgAngle}deg, ${content.backBgColor1}, ${content.backBgColor2})`;

    return (
      <div ref={backRef} style={{ width, height, backgroundImage: bgImage, backgroundSize: 'cover', backgroundPosition: 'center' }} className="relative text-left overflow-hidden">
        {content.backCoverImage && <div className="absolute inset-0 bg-black bg-opacity-30"></div>}
        
        {content.aboutText &&
          <DraggableResizableItem
            keyPaths={{ position: 'aboutTextPosition', size: 'aboutTextSize' }}
            position={content.aboutTextPosition}
            size={content.aboutTextSize}
            handleStart={handleStart}
            containerRef={backRef} isCentered={false} isResizable="horizontal"
            style={{ cursor: 'move', zIndex: 10, userSelect: 'none' }}
            onClick={(e) => handleTextClick({sizeElement: 'backTextFontSize', colorElement: 'backTextColor', fontElement: 'backTextFont', alignElement: 'backTextAlign', label: 'Back Cover Text', lineHeightElement: 'backTextLineHeight', letterSpacingElement: 'backTextLetterSpacing', strokeWidthElement: 'backTextStrokeWidth', strokeColorElement: 'backTextStrokeColor', shadowBlurElement: 'backTextShadowBlur', shadowColorElement: 'backTextShadowColor'}, e)}
          >
            <p style={textStyle} className="opacity-90 p-1 w-full h-full">{content.aboutText}</p>
          </DraggableResizableItem>
        }
        
        {content.authorImage && (
          <DraggableResizableItem keyPaths={{position: 'authorImagePosition', size: 'authorImageSize'}} position={content.authorImagePosition} size={content.authorImageSize} handleStart={handleStart} containerRef={backRef} isCentered={true} style={{cursor: 'move', zIndex: 11}}>
            <img src={content.authorImage} alt="Author" className="w-full h-auto object-cover rounded-sm shadow-md" />
          </DraggableResizableItem>
        )}
        
        {content.publisherLogo && (
          <DraggableResizableItem keyPaths={{position: 'backPublisherLogoPosition', size: 'backPublisherLogoSize'}} position={content.backPublisherLogoPosition} size={content.backPublisherLogoSize} handleStart={handleStart} containerRef={backRef} isCentered={true} style={{cursor: 'move', zIndex: 11}}>
            <img src={content.publisherLogo} alt="Publisher Logo" className="w-full h-auto object-contain" />
          </DraggableResizableItem>
        )}
        
        {content.isbnImage && (
          <DraggableResizableItem keyPaths={{position: 'isbnImagePosition', size: 'isbnImageSize'}} position={content.isbnImagePosition} size={content.isbnImageSize} handleStart={handleStart} containerRef={backRef} isCentered={true} style={{cursor: 'move', zIndex: 11}}>
            <img src={content.isbnImage} alt="ISBN Barcode" className="w-full h-auto object-contain bg-white p-1" />
          </DraggableResizableItem>
        )}
        
        {content.customTextElements.filter(el => el.coverPart === 'back').map((el, index) => {
            const originalIndex = content.customTextElements.findIndex(origEl => origEl.id === el.id);
            return (
                <DraggableResizableItem
                    key={el.id}
                    keyPaths={{ position: 'position', size: 'size' } as any}
                    position={el.position}
                    size={el.size}
                    handleStart={handleStart}
                    containerRef={backRef}
                    isCentered={false}
                    isResizable="horizontal"
                    customElementIndex={originalIndex}
                    style={{ cursor: 'move', zIndex: 12, userSelect: 'none' }}
                    onClick={(e) => handleTextClick({ customElementIndex: originalIndex, label: 'Custom Text'}, e)}
                >
                  <p style={getTextStyle(el.fontSize, el.font, el.fontColor, el.align, el.lineHeight, el.letterSpacing, el.strokeWidth, el.strokeColor, el.shadowBlur, el.shadowColor, scaleFactor)} className="p-1 w-full h-full">{el.text}</p>
                </DraggableResizableItem>
            );
        })}
        {children}
      </div>
    );
});

interface Step3SummaryProps {
  orientation: Orientation;
  dimensions: Dimensions;
  content: BookContent;
  setContent: React.Dispatch<React.SetStateAction<BookContent>>;
  onBack: () => void;
}

const Step3Summary: React.FC<Step3SummaryProps> = ({ orientation, dimensions, content, setContent, onBack }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingPremium, setIsGeneratingPremium] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [imageWithTextUrl, setImageWithTextUrl] = useState<string | null>(null);
  const [editorConfig, setEditorConfig] = useState<EditorPopoverProps['config'] | null>(null);
  const [isRewardedAdOpen, setIsRewardedAdOpen] = useState(false);
  const [isInterstitialAdOpen, setIsInterstitialAdOpen] = useState(false);
  const [postAdAction, setPostAdAction] = useState<(() => void) | null>(null);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  
  const addMenuRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef(content);
  contentRef.current = content;

  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [imageEditorConfig, setImageEditorConfig] = useState<{ index: number; top: number; left: number; } | null>(null);

  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [showBleed, setShowBleed] = useState(true);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const frontCoverContainerRef = useRef<HTMLDivElement>(null);
  const spineContainerRef = useRef<HTMLDivElement>(null);
  const backCoverContainerRef = useRef<HTMLDivElement>(null);


  const dragData = useRef({
    isDown: false,
    isDragging: false,
    action: null as 'drag' | 'resize' | null,
    keyPaths: null as KeyPaths | null,
    container: null as HTMLDivElement | null,
    startMouse: { x: 0, y: 0 },
    initialPos: { x: 0, y: 0 },
    initialSize: { width: 0 },
    customElementIndex: undefined as number | undefined,
  });

  const imageDragData = useRef({
    isDown: false,
    isDragging: false,
    action: null as 'drag' | 'resize' | 'rotate' | null,
    elementIndex: -1,
    container: null as HTMLDivElement | null,
    startMouse: { x: 0, y: 0 },
    initialPosition: { x: 0, y: 0 },
    initialSize: { width: 0 },
    initialRotation: 0,
    center: { x: 0, y: 0 },
    startAngle: 0,
  });
  
  const deselectAll = () => {
    setSelectedImageIndex(null);
    setImageEditorConfig(null);
    setEditorConfig(null);
  };
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(event.target as Node)) {
        setIsAddMenuOpen(false);
      }
       if (containerRef.current && containerRef.current.contains(event.target as Node)) {
        if((event.target as HTMLElement).closest('.group') === null) {
            deselectAll();
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!dragData.current.isDown) return;
    const { action, container, startMouse, initialPos, initialSize, keyPaths, customElementIndex } = dragData.current;

    const dx = clientX - startMouse.x;
    const dy = clientY - startMouse.y;
  
    if (!dragData.current.isDragging && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
      dragData.current.isDragging = true;
    }
    
    if (dragData.current.isDragging && container) {
      const containerRect = container.getBoundingClientRect();
      if (containerRect.width === 0 || containerRect.height === 0) return;

      if (action === 'drag') {
        const dPercentX = (dx / containerRect.width) * 100;
        const dPercentY = (dy / containerRect.height) * 100;
        const newX = Math.max(0, Math.min(100, initialPos.x + dPercentX));
        const newY = Math.max(0, Math.min(100, initialPos.y + dPercentY));
        
        if (typeof customElementIndex === 'number') {
          setContent(prev => {
            const newElements = [...prev.customTextElements];
            newElements[customElementIndex] = { ...newElements[customElementIndex], position: { x: newX, y: newY } };
            return { ...prev, customTextElements: newElements };
          });
        } else if (keyPaths) {
          setContent(prev => ({...prev, [keyPaths.position]: { x: newX, y: newY }}));
        }

      } else if (action === 'resize') {
        const dPercentX = (dx / containerRect.width) * 100;
        const newWidth = Math.max(5, Math.min(100, initialSize.width + dPercentX));
        
        if (typeof customElementIndex === 'number') {
           setContent(prev => {
            const newElements = [...prev.customTextElements];
            newElements[customElementIndex] = { ...newElements[customElementIndex], size: { width: newWidth } };
            return { ...prev, customTextElements: newElements };
          });
        } else if (keyPaths?.size) {
            setContent(prev => ({...prev, [keyPaths.size!]: { width: newWidth }}));
        }
      }
    }
  };
  
  const handleMouseMove = (e: MouseEvent) => {
    if (dragData.current.isDragging) e.preventDefault();
    handleDragMove(e.clientX, e.clientY);
  };
  
  const handleTouchMove = (e: TouchEvent) => {
    if (dragData.current.isDragging) e.preventDefault();
    if (e.touches.length > 0) handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
  };
  
  const handleDragEnd = () => {
    if (dragData.current.isDown) {
      dragData.current.isDown = false;
      setTimeout(() => { dragData.current.isDragging = false; }, 10);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleDragEnd);
    }
  };
  
  const startDragging = (clientX: number, clientY: number, keyPaths: KeyPaths, action: 'drag' | 'resize', container: HTMLDivElement | null, customElementIndex?: number) => {
    if (!container) return;
    const currentContent = contentRef.current;
    let currentPosition: Position | undefined, currentSize: Size | undefined = { width: 0 };
    
    if (typeof customElementIndex === 'number') {
        const el = currentContent.customTextElements[customElementIndex];
        currentPosition = el.position;
        currentSize = el.size;
    } else {
        currentPosition = currentContent[keyPaths.position] as Position;
        currentSize = keyPaths.size ? currentContent[keyPaths.size] as Size : { width: 0 };
    }
    
    if (!currentPosition) return;
    
    dragData.current = {
      isDown: true, isDragging: false, action, keyPaths, container,
      startMouse: { x: clientX, y: clientY },
      initialPos: { ...currentPosition },
      initialSize: { ...currentSize },
      customElementIndex,
    };
  
    deselectAll();
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleDragEnd);
  };
  
  const handleStart: HandleStartType = useCallback((e, keyPaths, action, container, customElementIndex) => {
    e.stopPropagation();
    let clientX: number, clientY: number;

    if ('touches' in e) {
        if (e.touches.length === 0) return;
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        if (e.button !== 0) return;
        e.preventDefault();
        clientX = e.clientX;
        clientY = e.clientY;
    }
    
    startDragging(clientX, clientY, keyPaths, action, container, customElementIndex);
  }, [setContent]);
  
  const handleTextClick: HandleTextClickType = useCallback((config, e) => {
    if (dragData.current.isDragging || imageDragData.current.isDragging) return;
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    deselectAll();
    setEditorConfig({
      ...config,
      top: rect.bottom - (containerRect?.top || 0) + 10,
      left: rect.left - (containerRect?.left || 0) + rect.width / 2,
    });
  }, []);

  const handleAddCustomText = (coverPart: 'front' | 'back' | 'spine') => {
    const newTextElement: CustomTextElement = {
      id: `custom-${Date.now()}`,
      text: 'New Text',
      coverPart: coverPart,
      position: { x: 50, y: 50 },
      size: { width: coverPart === 'spine' ? 80 : 40 }, // Spine width is more like a height constraint in vertical mode
      font: 'sans-serif',
      fontSize: coverPart === 'spine' ? 18 : 24,
      fontColor: '#FFFFFF',
      align: 'center',
      lineHeight: 1.2,
      letterSpacing: 0,
      strokeWidth: 0,
      strokeColor: '#000000',
      shadowBlur: 0,
      shadowColor: 'rgba(0,0,0,0.5)',
    };
    setContent(prev => ({ ...prev, customTextElements: [...prev.customTextElements, newTextElement] }));
  };
  
  const handleAddImage = (coverPart: 'front' | 'back' | 'spine') => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/png, image/jpeg, image/webp';
      input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
              if (file.size > 5 * 1024 * 1024) { // 5MB limit
                  alert("File is too large. Please upload an image smaller than 5MB.");
                  return;
              }
              const reader = new FileReader();
              reader.onload = (event) => {
                  const src = event.target?.result as string;
                  const img = new Image();
                  img.onload = () => {
                      const newImage: CustomImageElement = {
                          id: `image-${Date.now()}`,
                          src,
                          coverPart,
                          position: { x: 50, y: 50 },
                          size: { width: 30 },
                          rotation: 0,
                          opacity: 1,
                          clipShape: 'none',
                          aspectRatio: img.width / img.height,
                      };
                      setContent(prev => ({ ...prev, customImageElements: [...prev.customImageElements, newImage] }));
                  };
                  img.src = src;
              };
              reader.readAsDataURL(file);
          }
      };
      input.click();
  };


  const handleDeleteCustomText = (index: number) => {
    setContent(prev => ({
      ...prev,
      customTextElements: prev.customTextElements.filter((_, i) => i !== index)
    }));
    setEditorConfig(null);
  };
  
    // --- Custom Image Logic ---

  const handleImageMove = (clientX: number, clientY: number) => {
    if (!imageDragData.current.isDown) return;
    const { action, container, startMouse, initialPosition, initialSize, initialRotation, elementIndex, center, startAngle } = imageDragData.current;
    
    const dx = (clientX - startMouse.x) / zoomLevel;
    const dy = (clientY - startMouse.y) / zoomLevel;

    if (!imageDragData.current.isDragging && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
        imageDragData.current.isDragging = true;
    }
    
    if (imageDragData.current.isDragging && container) {
        const containerRect = container.getBoundingClientRect();
        const originalWidth = containerRect.width / zoomLevel;
        const originalHeight = containerRect.height / zoomLevel;
        if (originalWidth === 0 || originalHeight === 0) return;

        if (action === 'drag') {
            const dPercentX = (dx / originalWidth) * 100;
            const dPercentY = (dy / originalHeight) * 100;
            const newX = Math.max(0, Math.min(100, initialPosition.x + dPercentX));
            const newY = Math.max(0, Math.min(100, initialPosition.y + dPercentY));
            setContent(prev => {
                const newElements = [...prev.customImageElements];
                newElements[elementIndex] = { ...newElements[elementIndex], position: { x: newX, y: newY } };
                return { ...prev, customImageElements: newElements };
            });
        } else if (action === 'resize') {
            const dPercentX = (dx / originalWidth) * 100;
            const newWidth = Math.max(5, Math.min(100, initialSize.width + dPercentX));
            setContent(prev => {
                const newElements = [...prev.customImageElements];
                newElements[elementIndex] = { ...newElements[elementIndex], size: { width: newWidth } };
                return { ...prev, customImageElements: newElements };
            });
        } else if (action === 'rotate') {
            const currentAngle = Math.atan2(clientY - center.y, clientX - center.x);
            const angleDiff = currentAngle - startAngle;
            const newRotation = initialRotation + angleDiff * (180 / Math.PI);
            setContent(prev => {
                const newElements = [...prev.customImageElements];
                newElements[elementIndex] = { ...newElements[elementIndex], rotation: newRotation };
                return { ...prev, customImageElements: newElements };
            });
        }
    }
  };

  const handleImageMouseMove = (e: MouseEvent) => {
      if (imageDragData.current.isDragging) e.preventDefault();
      handleImageMove(e.clientX, e.clientY);
  };
  const handleImageTouchMove = (e: TouchEvent) => {
      if (imageDragData.current.isDragging) e.preventDefault();
      if (e.touches.length > 0) handleImageMove(e.touches[0].clientX, e.touches[0].clientY);
  };

  const handleImageInteractionEnd = () => {
      if (imageDragData.current.isDown) {
          imageDragData.current.isDown = false;
          setTimeout(() => { imageDragData.current.isDragging = false; }, 10);
          window.removeEventListener('mousemove', handleImageMouseMove);
          window.removeEventListener('mouseup', handleImageInteractionEnd);
          window.removeEventListener('touchmove', handleImageTouchMove);
          window.removeEventListener('touchend', handleImageInteractionEnd);
      }
  };

  const handleImageInteractionStart = useCallback((e: React.MouseEvent | React.TouchEvent, index: number, action: 'drag' | 'resize' | 'rotate', container: HTMLDivElement | null, elementRef: HTMLDivElement | null) => {
      e.stopPropagation();
      if (!container || !elementRef) return;
      
      let clientX, clientY;
      if ('touches' in e) {
          if (e.touches.length === 0) return;
          clientX = e.touches[0].clientX;
          clientY = e.touches[0].clientY;
      } else {
          if (e.button !== 0) return;
          e.preventDefault();
          clientX = e.clientX;
          clientY = e.clientY;
      }

      const element = contentRef.current.customImageElements[index];
      const elRect = elementRef.getBoundingClientRect();

      imageDragData.current = {
          isDown: true,
          isDragging: false,
          action,
          elementIndex: index,
          container,
          startMouse: { x: clientX, y: clientY },
          initialPosition: { ...element.position },
          initialSize: { ...element.size },
          initialRotation: element.rotation,
          center: { x: elRect.left + elRect.width / 2, y: elRect.top + elRect.height / 2 },
          startAngle: Math.atan2(clientY - (elRect.top + elRect.height / 2), clientX - (elRect.left + elRect.width / 2)),
      };
      
      deselectAll();
      setSelectedImageIndex(index);
      
      window.addEventListener('mousemove', handleImageMouseMove);
      window.addEventListener('mouseup', handleImageInteractionEnd);
      window.addEventListener('touchmove', handleImageTouchMove, { passive: false });
      window.addEventListener('touchend', handleImageInteractionEnd);
  }, [zoomLevel]);

    const handleImageClick = (e: React.MouseEvent, index: number) => {
      if (imageDragData.current.isDragging) return;
      e.stopPropagation();
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const containerRect = containerRef.current?.getBoundingClientRect();

      deselectAll();
      setSelectedImageIndex(index);
      setImageEditorConfig({
        index,
        top: rect.bottom - (containerRect?.top || 0) + 10,
        left: rect.left - (containerRect?.left || 0) + rect.width / 2,
      });
  };
  
  const handleDeleteCustomImage = (index: number) => {
      setContent(prev => ({
          ...prev,
          customImageElements: prev.customImageElements.filter((_, i) => i !== index)
      }));
      setImageEditorConfig(null);
      setSelectedImageIndex(null);
  };

  const orientationText = orientation === 'right' ? 'Right-handed (e.g., English)' : 'Left-handed (e.g., Arabic)';
  const coverSize = `${dimensions.width}" × ${dimensions.height}"`;
  const spineSize = `${dimensions.spine}"`;
  const bleedSize = `${dimensions.bleed}"`;
  const trimSize = `${dimensions.trim}"`;

  const { scaled, fullMockupWidth, fullMockupHeight, scaleFactor } = useMemo(() => {
    const width = parseFloat(dimensions.width);
    const height = parseFloat(dimensions.height);
    const spine = parseFloat(dimensions.spine);
    const bleed = parseFloat(dimensions.bleed);
    
    const totalWidthInches = (width * 2) + spine + (bleed * 2);
    const maxWidthPixels = 450;
    const scaleFactor = Math.min(40, maxWidthPixels / totalWidthInches);

    const scaled = {
      height: height * scaleFactor,
      frontBackWidth: width * scaleFactor,
      spineWidth: spine * scaleFactor,
      bleed: bleed * scaleFactor,
      trim: parseFloat(dimensions.trim) * scaleFactor,
    };
    const fullMockupWidth = scaled.frontBackWidth * 2 + scaled.spineWidth + scaled.bleed * 2;
    const fullMockupHeight = scaled.height + scaled.bleed * 2;
    return { scaled, fullMockupWidth, fullMockupHeight, scaleFactor };
  }, [dimensions]);

  const generateCanvas = async (options: { includeText: boolean; includeOverlayImages: boolean; }): Promise<string | null> => {
    try {
      const { includeText, includeOverlayImages } = options;
      const fontsToLoad = new Set<string>();
      
      if (includeText) {
          const allFontsUsed = [
            content.titleFont,
            content.subtitleFont,
            content.authorFont,
            content.backTextFont,
            content.spineTitleFont,
            content.spineAuthorFont,
            ...content.customTextElements.map(el => el.font)
          ];

          for (const fontName of allFontsUsed) {
            if (!fontName) continue;
            
            if (fontName.includes('Noto Nastaliq Urdu')) {
                fontsToLoad.add('400 1rem "Noto Nastaliq Urdu"');
                fontsToLoad.add('700 1rem "Noto Nastaliq Urdu"');
            } else if (content.customFonts?.some(cf => cf.name === fontName)) {
                fontsToLoad.add(`1rem "${fontName}"`);
                fontsToLoad.add(`bold 1rem "${fontName}"`);
            }
          }

          if (fontsToLoad.size > 0) {
              await Promise.all(Array.from(fontsToLoad).map(font => document.fonts.load(font)));
          }
      }
      
      const width = parseFloat(dimensions.width);
      const height = parseFloat(dimensions.height);
      const spine = parseFloat(dimensions.spine);
      const bleed = parseFloat(dimensions.bleed);

      const DPI = 300;
      const PPI = 72; // Pixels per inch for web/CSS units
      const canvasScale = DPI / PPI;

      const totalWidthInches = (width * 2) + spine + (bleed * 2);
      const totalHeightInches = height + (bleed * 2);

      const canvas = document.createElement('canvas');
      canvas.width = totalWidthInches * DPI;
      canvas.height = totalHeightInches * DPI;
      const ctx = canvas.getContext('2d');

      if (!ctx) throw new Error('Could not create canvas context');

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const px = {
          bleed: bleed * DPI,
          trim: parseFloat(dimensions.trim) * DPI,
          height: height * DPI,
          width: width * DPI,
          spine: spine * DPI,
      };

      const loadImage = (src: string): Promise<HTMLImageElement> => new Promise((resolve, reject) => {
          if (!src) return reject(new Error('No image source provided.'));
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error(`Failed to load image. Source: ${src.substring(0, 100)}...`));
          img.src = src;
      });
      
      const drawGradient = (x: number, y: number, w: number, h: number, c1: string, c2: string, angle: number) => {
          const angleRad = (angle - 90) * Math.PI / 180;
          const x1 = w * 0.5 + Math.cos(angleRad) * w * 0.5;
          const y1 = h * 0.5 + Math.sin(angleRad) * h * 0.5;
          const x2 = w * 0.5 - Math.cos(angleRad) * w * 0.5;
          const y2 = h * 0.5 - Math.sin(angleRad) * h * 0.5;

          const g = ctx.createLinearGradient(x + x1, y + y1, x + x2, y + y2);
          g.addColorStop(0, c1);
          g.addColorStop(1, c2);
          ctx.fillStyle = g;
          ctx.fillRect(x, y, w, h);
      };

      const drawImageCover = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) => {
          const imgRatio = img.width / img.height;
          const containerRatio = w / h;
          let sx, sy, sWidth, sHeight;

          if (imgRatio > containerRatio) { // Image is wider than container
              sHeight = img.height;
              sWidth = sHeight * containerRatio;
              sx = (img.width - sWidth) / 2;
              sy = 0;
          } else { // Image is taller or same ratio
              sWidth = img.width;
              sHeight = sWidth / containerRatio;
              sx = 0;
              sy = (img.height - sHeight) / 2;
          }
          ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, w, h);
      };
      
      const getWrappedLines = (text: string, maxWidth: number, font: string): string[] => {
          ctx.font = font;
          const words = text.split(' ');
          if (!words.length) return [];
          const lines: string[] = [];
          let currentLine = words[0];
          for (let i = 1; i < words.length; i++) {
              const testLine = `${currentLine} ${words[i]}`;
              if (ctx.measureText(testLine).width > maxWidth) {
                  lines.push(currentLine);
                  currentLine = words[i];
              } else {
                  currentLine = testLine;
              }
          }
          lines.push(currentLine);
          return lines;
      };
      
      const widthOfTextWithSpacing = (text: string, letterSpacing: number): number => {
        if (!text) return 0;
        return ctx.measureText(text).width + (text.length > 1 ? (text.length - 1) * letterSpacing : 0);
      };

      const drawTextWithSpacing = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, letterSpacing: number, isStroke: boolean) => {
        if (letterSpacing === 0) {
            if (isStroke) ctx.strokeText(text, x, y);
            else ctx.fillText(text, x, y);
            return;
        }
        
        let currentX = x;
        const totalWidth = widthOfTextWithSpacing(text, letterSpacing);
    
        if (ctx.textAlign === 'right') currentX -= totalWidth;
        else if (ctx.textAlign === 'center') currentX -= totalWidth / 2;
    
        for (const char of text) {
            if (isStroke) ctx.strokeText(char, currentX, y);
            else ctx.fillText(char, currentX, y);
            currentX += ctx.measureText(char).width + letterSpacing;
        }
      };

      const backCoverX = px.bleed;
      const spineX = backCoverX + px.width;
      const frontCoverX = spineX + px.spine;
      
      const sections = orientation === 'right' ? 
        [{ name: 'back', x: backCoverX, w: px.width }, { name: 'spine', x: spineX, w: px.spine }, { name: 'front', x: frontCoverX, w: px.width }] : 
        [{ name: 'front', x: backCoverX, w: px.width }, { name: 'spine', x: spineX, w: px.spine }, { name: 'back', x: frontCoverX, w: px.width }];
      
      // --- Draw Full-Bleed Backgrounds ---
      const drawH = px.height + 2 * px.bleed;
      const coverDrawW = px.width + px.bleed;

      const backgroundParts = [
        {
          name: 'front',
          bgType: content.frontCoverBgType, image: content.frontCoverImage,
          c1: content.frontCoverBgColor1, c2: content.frontCoverBgColor2, angle: content.frontCoverBgAngle,
        },
        {
          name: 'spine',
          bgType: content.spineBgType, image: content.spineImage,
          c1: content.spineBgColor1, c2: content.spineBgColor2, angle: content.spineBgAngle,
        },
        {
          name: 'back',
          bgType: content.backBgType, image: content.backCoverImage,
          c1: content.backBgColor1, c2: content.backBgColor2, angle: content.backBgAngle,
        }
      ];

      for (const part of backgroundParts) {
        let drawX = 0, drawW = 0;

        if (orientation === 'right') {
          if (part.name === 'back') { drawX = 0; drawW = coverDrawW; }
          else if (part.name === 'spine') { drawX = coverDrawW; drawW = px.spine; }
          else if (part.name === 'front') { drawX = coverDrawW + px.spine; drawW = coverDrawW; }
        } else { // left-handed
          if (part.name === 'front') { drawX = 0; drawW = coverDrawW; }
          else if (part.name === 'spine') { drawX = coverDrawW; drawW = px.spine; }
          else if (part.name === 'back') { drawX = coverDrawW + px.spine; drawW = coverDrawW; }
        }

        if (drawW > 0) {
          if ((!includeText && !includeOverlayImages) || (part.bgType === 'upload' && part.image)) {
              if (part.image) {
                const img = await loadImage(part.image);
                drawImageCover(ctx, img, drawX, 0, drawW, drawH);
              }
          } else if (part.bgType === 'gradient') {
              drawGradient(drawX, 0, drawW, drawH, part.c1, part.c2, part.angle);
          }
        }
      }

      const drawImageElement = async (src: string | null, pos: Position, size: Size, containerX: number, containerW: number, containerH: number) => {
        if (!src) return;
        const img = await loadImage(src);
        const imgW = (size.width / 100) * containerW;
        const imgH = img.height * (imgW / img.width);
        const imgX = containerX + (pos.x / 100) * containerW - imgW / 2;
        const imgY = px.bleed + (pos.y / 100) * containerH - imgH / 2;
        ctx.drawImage(img, imgX, imgY, imgW, imgH);
      };
      
      const drawCustomImageOnCanvas = async (ctx: CanvasRenderingContext2D, imageElement: CustomImageElement, containerX: number, containerW: number, containerH: number) => {
        const img = await loadImage(imageElement.src);
        const imgW = (imageElement.size.width / 100) * containerW;
        const imgH = imgW / imageElement.aspectRatio;
        const centerX = containerX + (imageElement.position.x / 100) * containerW;
        const centerY = px.bleed + (imageElement.position.y / 100) * containerH;

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(imageElement.rotation * Math.PI / 180);
        ctx.globalAlpha = imageElement.opacity;

        if (imageElement.clipShape !== 'none') {
            const w = imgW, h = imgH;
            ctx.beginPath();
            switch (imageElement.clipShape) {
                case 'circle': ctx.arc(0, 0, Math.min(w, h) / 2, 0, 2 * Math.PI); break;
                case 'oval': ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, 2 * Math.PI); break;
                case 'square': const size = Math.min(w, h); ctx.rect(-size / 2, -size / 2, size, size); break;
                case 'rectangle': ctx.rect(-w / 2, -w / 2, w, h); break;
                case 'triangle':
                    ctx.moveTo(0, -h / 2);
                    ctx.lineTo(-w / 2, h / 2);
                    ctx.lineTo(w / 2, h / 2);
                    break;
                case 'star':
                    const spikes = 5, outerR = w / 2, innerR = outerR / 2.5; let rot = Math.PI / 2 * 3;
                    for (let i = 0; i < spikes; i++) {
                        ctx.lineTo(Math.cos(rot) * outerR, Math.sin(rot) * outerR); rot += Math.PI / spikes;
                        ctx.lineTo(Math.cos(rot) * innerR, Math.sin(rot) * innerR); rot += Math.PI / spikes;
                    }
                    break;
            }
            ctx.closePath();
            ctx.clip();
        }

        ctx.drawImage(img, -imgW / 2, -imgH / 2, imgW, imgH);
        ctx.restore();
      };


      const frontSection = sections.find(s => s.name === 'front')!;

      type TextStyles = {
        fontSize: number; font: string; fontStyle?: string; color: string; align: TextAlign;
        lineHeight: number; letterSpacing: number;
        strokeWidth: number; strokeColor: string;
        shadowBlur: number; shadowColor: string;
      };
      
      const formatFontFamilyForCanvas = (fontFamily: string) => {
        // Font families with fallbacks (containing a comma) are assumed to be correctly quoted.
        // Other font names (including those with spaces) should be wrapped in quotes for safety.
        return fontFamily.includes(',') ? fontFamily : `"${fontFamily}"`;
      };

      const drawTextElement = (text: string, pos: Position, styles: TextStyles, containerX: number, containerW: number, containerH: number, maxWidth: number, isCentered: boolean) => {
        if (!text) return;
        ctx.save();
        
        const ptToPx = (pt: number) => pt * canvasScale;
        const fontSizePx = ptToPx(styles.fontSize);
        const fontStr = `${styles.fontStyle || ''} ${fontSizePx}px ${formatFontFamilyForCanvas(styles.font)}`;
        const letterSpacingPx = ptToPx(styles.letterSpacing);

        if (styles.shadowBlur > 0) {
            ctx.shadowColor = styles.shadowColor;
            ctx.shadowBlur = ptToPx(styles.shadowBlur);
            ctx.shadowOffsetX = ptToPx(2);
            ctx.shadowOffsetY = ptToPx(2);
        }

        ctx.font = fontStr;
        const lines = getWrappedLines(text, maxWidth, fontStr);
        const lineHeightPx = fontSizePx * styles.lineHeight;
        const totalTextHeight = lines.length * lineHeightPx;
        
        const refX = containerX + (pos.x / 100) * containerW;
        const refY = px.bleed + (pos.y / 100) * containerH;

        ctx.textBaseline = 'top';
        let y = isCentered ? (refY - totalTextHeight / 2) : refY;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const isLastLine = i === lines.length - 1;

            if (styles.strokeWidth > 0) {
                ctx.strokeStyle = styles.strokeColor;
                ctx.lineWidth = ptToPx(styles.strokeWidth);
            }
            ctx.fillStyle = styles.color;
            
            let currentAlign = styles.align;
            if (currentAlign === 'justify' && isLastLine) {
                currentAlign = 'left';
            }

            if (currentAlign === 'justify') {
                const words = line.split(' ');
                if (words.length > 1) {
                    const totalWordsWidth = words.reduce((acc, word) => acc + ctx.measureText(word).width, 0);
                    const totalLetterSpacingWidth = letterSpacingPx * (line.length - words.length);
                    const totalWidth = totalWordsWidth + totalLetterSpacingWidth;
                    const totalSpacing = maxWidth - totalWidth;
                    const spaceBetweenWords = totalSpacing / (words.length - 1);
                    
                    let currentX = isCentered ? refX - maxWidth/2 : refX;
                    ctx.textAlign = 'left'; // Justify means we position each word manually
                    words.forEach(word => {
                        if (styles.strokeWidth > 0) drawTextWithSpacing(ctx, word, currentX, y, letterSpacingPx, true);
                        drawTextWithSpacing(ctx, word, currentX, y, letterSpacingPx, false);
                        currentX += widthOfTextWithSpacing(word, letterSpacingPx) + spaceBetweenWords;
                    });
                }
            } else {
                ctx.textAlign = currentAlign;
                let drawX = refX;
                // If text is left-aligned in a non-centered box, pos.x is the left edge.
                // If it's left-aligned in a centered box, we need to calculate the left edge of the box.
                if (currentAlign === 'left' && isCentered) {
                    drawX = refX - maxWidth / 2;
                } else if (currentAlign === 'right' && isCentered) {
                    drawX = refX + maxWidth / 2;
                }
                
                if (styles.strokeWidth > 0) drawTextWithSpacing(ctx, line, drawX, y, letterSpacingPx, true);
                drawTextWithSpacing(ctx, line, drawX, y, letterSpacingPx, false);
            }
            y += lineHeightPx;
        }
        ctx.restore();
      };
      
      if (includeText) {
        drawTextElement(content.title, content.titlePosition, { fontSize: content.titleFontSize, font: content.titleFont, fontStyle: 'bold', color: content.titleFontColor, align: content.titleAlign, lineHeight: content.titleLineHeight, letterSpacing: content.titleLetterSpacing, strokeWidth: content.titleStrokeWidth, strokeColor: content.titleStrokeColor, shadowBlur: content.titleShadowBlur, shadowColor: content.titleShadowColor }, frontSection.x, frontSection.w, px.height, px.width * 0.9, true);
        drawTextElement(content.subtitle, content.subtitlePosition, { fontSize: content.subtitleFontSize, font: content.subtitleFont, color: content.subtitleFontColor, align: content.subtitleAlign, lineHeight: content.subtitleLineHeight, letterSpacing: content.subtitleLetterSpacing, strokeWidth: content.subtitleStrokeWidth, strokeColor: content.subtitleStrokeColor, shadowBlur: content.subtitleShadowBlur, shadowColor: content.subtitleShadowColor }, frontSection.x, frontSection.w, px.height, px.width * 0.85, true);
        drawTextElement(content.author, content.authorPosition, { fontSize: content.authorFontSize, font: content.authorFont, color: content.authorFontColor, align: content.authorAlign, lineHeight: content.authorLineHeight, letterSpacing: content.authorLetterSpacing, strokeWidth: content.authorStrokeWidth, strokeColor: content.authorStrokeColor, shadowBlur: content.authorShadowBlur, shadowColor: content.authorShadowColor }, frontSection.x, frontSection.w, px.height, px.width * 0.9, true);
        content.customTextElements.filter(el => el.coverPart === 'front').forEach(el => {
            const maxWidth = (el.size.width / 100) * frontSection.w;
            drawTextElement(el.text, el.position, { ...el, color: el.fontColor, font: el.font }, frontSection.x, frontSection.w, px.height, maxWidth, false);
        });
      }
      if (includeOverlayImages) {
        await drawImageElement(content.publisherLogo, content.frontPublisherLogoPosition, content.frontPublisherLogoSize, frontSection.x, frontSection.w, px.height);
        for (const imageEl of content.customImageElements.filter(el => el.coverPart === 'front')) {
            await drawCustomImageOnCanvas(ctx, imageEl, frontSection.x, frontSection.w, px.height);
        }
      }

      const spineSection = sections.find(s => s.name === 'spine')!;
      
      const ptToPx = (pt: number) => pt * canvasScale;

      const drawSpineText = (text: string, pos: Position, fontSizePt: number, font: string, color: string, letterSpacing: number, fontWeight = 'normal', strokeWidth = 0, strokeColor = '#000000', shadowBlur = 0, shadowColor = 'rgba(0,0,0,0)') => {
        if (!text) return;
        ctx.save();
        const fontSizePx = ptToPx(fontSizePt);
        const letterSpacingPx = ptToPx(letterSpacing);
        ctx.font = `${fontWeight} ${fontSizePx}px ${formatFontFamilyForCanvas(font)}`;
        ctx.fillStyle = color;
        
        if (shadowBlur > 0) {
            ctx.shadowColor = shadowColor;
            ctx.shadowBlur = ptToPx(shadowBlur);
            ctx.shadowOffsetX = ptToPx(1);
            ctx.shadowOffsetY = ptToPx(1);
        }

        const x = (pos.y / 100 - 0.5) * px.height;
        const y = (pos.x / 100 - 0.5) * px.spine;
        
        if (strokeWidth > 0) {
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = ptToPx(strokeWidth);
            drawTextWithSpacing(ctx, text, x, y, letterSpacingPx, true);
        }
        drawTextWithSpacing(ctx, text, x, y, letterSpacingPx, false);
        ctx.restore();
      };
      
      ctx.save(); // Save state before clipping spine
      ctx.beginPath();
      ctx.rect(spineSection.x, px.bleed, spineSection.w, px.height);
      ctx.clip();
      
      ctx.save(); // Save state for rotation
      ctx.translate(spineSection.x + spineSection.w / 2, px.bleed + px.height / 2);
      ctx.rotate(Math.PI / 2);
      ctx.textAlign = 'center';
      
      if (includeText) {
        drawSpineText(content.title, content.spineTitlePosition, content.spineTitleFontSize, content.spineTitleFont, content.spineTitleFontColor, content.spineTitleLetterSpacing, 'bold');
        drawSpineText(content.author, content.spineAuthorPosition, content.spineAuthorFontSize, content.spineAuthorFont, content.spineAuthorFontColor, content.spineAuthorLetterSpacing);
        content.customTextElements.filter(el => el.coverPart === 'spine').forEach(el => {
            drawSpineText(el.text, el.position, el.fontSize, el.font, el.fontColor, el.letterSpacing, 'normal', el.strokeWidth, el.strokeColor, el.shadowBlur, el.shadowColor);
        });
      }
      ctx.restore(); // Restore from rotation

      if (includeOverlayImages) {
        await drawImageElement(content.publisherLogo, content.spinePublisherLogoPosition, content.spinePublisherLogoSize, spineSection.x, spineSection.w, px.height);
         for (const imageEl of content.customImageElements.filter(el => el.coverPart === 'spine')) {
            await drawCustomImageOnCanvas(ctx, imageEl, spineSection.x, spineSection.w, px.height);
        }
      }
      
      ctx.restore(); // Restore state, removing spine clip
      
      const backSection = sections.find(s => s.name === 'back')!;
      
      if (includeText) {
        const aboutTextW = (content.aboutTextSize.width / 100) * backSection.w;
        drawTextElement(
          content.aboutText,
          content.aboutTextPosition,
          { 
            fontSize: content.backTextFontSize, font: content.backTextFont, color: content.backTextColor, 
            align: content.backTextAlign, lineHeight: content.backTextLineHeight, letterSpacing: content.backTextLetterSpacing, 
            strokeWidth: content.backTextStrokeWidth, strokeColor: content.backTextStrokeColor, 
            shadowBlur: content.backTextShadowBlur, shadowColor: content.backTextShadowColor 
          },
          backSection.x, backSection.w, px.height, aboutTextW, false
        );
        content.customTextElements.filter(el => el.coverPart === 'back').forEach(el => {
            const maxWidth = (el.size.width / 100) * backSection.w;
            drawTextElement(el.text, el.position, { ...el, color: el.fontColor, font: el.font }, backSection.x, backSection.w, px.height, maxWidth, false);
        });
      }

      if (includeOverlayImages) {
        await drawImageElement(content.authorImage, content.authorImagePosition, content.authorImageSize, backSection.x, backSection.w, px.height);
        await drawImageElement(content.publisherLogo, content.backPublisherLogoPosition, content.backPublisherLogoSize, backSection.x, backSection.w, px.height);
        
        if (content.isbnImage) {
          ctx.save();
          ctx.shadowColor = 'transparent';
          const isbnImg = await loadImage(content.isbnImage);
          const isbnW = (content.isbnImageSize.width / 100) * backSection.w;
          const isbnH = isbnImg.height * (isbnW / isbnImg.width);
          const isbnX = backSection.x + (content.isbnImagePosition.x / 100) * backSection.w - isbnW/2;
          const isbnY = px.bleed + (content.isbnImagePosition.y / 100) * px.height - isbnH/2;
          
          ctx.fillStyle = 'white';
          ctx.fillRect(isbnX - 5, isbnY - 5, isbnW + 10, isbnH + 10);
          ctx.drawImage(isbnImg, isbnX, isbnY, isbnW, isbnH);
          ctx.restore();
        }
        for (const imageEl of content.customImageElements.filter(el => el.coverPart === 'back')) {
            await drawCustomImageOnCanvas(ctx, imageEl, backSection.x, backSection.w, px.height);
        }
      }

      return canvas.toDataURL('image/jpeg', 0.95);
    } catch(error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("Failed to generate canvas:", error);
        alert(`Sorry, there was an error creating the preview file: ${errorMessage}. Please check the console for more details.`);
        return null;
    }
  };

  const generateAndShowPreview = async () => {
    setIsGenerating(true);
    const dataUrl = await generateCanvas({ includeText: true, includeOverlayImages: true });
    if (dataUrl) {
      setImageWithTextUrl(dataUrl);
      setIsPreviewModalOpen(true);
    }
    setIsGenerating(false);
  };
  
  const triggerDownload = (dataUrl: string | null, filename: string) => {
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  };

  const handleDownloadWithText = () => {
    triggerDownload(imageWithTextUrl, 'book-cover-with-text.jpeg');
    setIsPreviewModalOpen(false);
  };
  
  const handleUnlockWithoutText = () => {
    setIsPreviewModalOpen(false);
    setIsRewardedAdOpen(true);
  };

  const handleRewardClaimed = async () => {
    setIsRewardedAdOpen(false);
    setIsGeneratingPremium(true);
    const dataUrl = await generateCanvas({ includeText: false, includeOverlayImages: false });
    triggerDownload(dataUrl, 'book-cover-artwork-only.jpeg');
    setIsGeneratingPremium(false);
  };

  const showInterstitialAd = (nextAction: () => void) => {
    setPostAdAction(() => nextAction);
    setIsInterstitialAdOpen(true);
  };

  const handleInterstitialAdClose = () => {
    setIsInterstitialAdOpen(false);
    if (postAdAction) {
      postAdAction();
      setPostAdAction(null);
    }
  };
  
  const AddMenuItem: React.FC<{ icon: string, label: string, onClick: () => void }> = ({ icon, label, onClick }) => (
    <button
      onClick={onClick}
      className="w-full text-left flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900"
      role="menuitem"
    >
      <span className="mr-3 text-lg">{icon}</span>
      {label}
    </button>
  );

    const ImageEditorPopover: React.FC<{
        index: number;
        top: number;
        left: number;
        content: BookContent;
        setContent: React.Dispatch<React.SetStateAction<BookContent>>;
        onClose: () => void;
        onDelete: (index: number) => void;
    }> = ({ index, top, left, content, setContent, onClose, onDelete }) => {
        const popoverRef = useRef<HTMLDivElement>(null);
        const element = content.customImageElements[index];

        useLayoutEffect(() => {
          if (popoverRef.current) {
              const popover = popoverRef.current;
      
              // Reset styles to begin calculation
              popover.style.left = `${left}px`;
              popover.style.right = 'auto';
              popover.style.transform = 'translateX(-50%)';
      
              const popoverRect = popover.getBoundingClientRect();
              
              if (popoverRect.left < 10) {
                  popover.style.left = '10px';
                  popover.style.transform = 'none';
              } else if (popoverRect.right > window.innerWidth - 10) {
                  popover.style.left = 'auto';
                  popover.style.right = '10px';
                  popover.style.transform = 'none';
              }
      
              if (popoverRect.bottom > window.innerHeight - 10) {
                  const overflow = popoverRect.bottom - (window.innerHeight - 10);
                  popover.style.top = `${top - overflow}px`;
              }
          }
        }, [top, left]);

        useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                    onClose();
                }
            };
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }, [onClose]);

        const handleChange = (key: keyof CustomImageElement, value: any) => {
            setContent(prev => {
                const newElements = [...prev.customImageElements];
                newElements[index] = { ...newElements[index], [key]: value };
                return { ...prev, customImageElements: newElements };
            });
        };
        
        const clipShapes: ClipShape[] = ['none', 'circle', 'square', 'oval', 'rectangle', 'triangle', 'star'];

        return (
            <div ref={popoverRef} style={{ top }} className="absolute z-50 bg-white p-4 rounded-lg shadow-2xl border border-slate-300 w-72 text-slate-800" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-slate-700 text-base">Editing Image</h4>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-2xl leading-none">&times;</button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-slate-600 block mb-1">Opacity: {Math.round(element.opacity * 100)}%</label>
                        <input type="range" min="0" max="1" step="0.01" value={element.opacity} onChange={(e) => handleChange('opacity', Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-600 block mb-1">Clip Shape</label>
                        <div className="grid grid-cols-4 gap-2">
                          {clipShapes.map(shape => (
                            <button key={shape} onClick={() => handleChange('clipShape', shape)} className={`capitalize h-10 flex items-center justify-center rounded-md transition text-xs ${element.clipShape === shape ? 'bg-blue-200 ring-2 ring-blue-500' : 'bg-slate-200 hover:bg-slate-300'}`}>{shape}</button>
                          ))}
                        </div>
                    </div>
                    <div className="border-t border-red-200 pt-3 mt-3">
                        <button onClick={() => onDelete(index)} className="w-full py-2 px-5 rounded-full font-bold text-white shadow-lg transform hover:scale-105 transition-all duration-200 ease-in-out bg-gradient-to-b from-red-500 to-red-700 border-b-4 border-red-800 hover:from-red-600 hover:to-red-800 active:border-b-2 active:border-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                            Delete Image
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const getClipPathStyle = (shape: ClipShape): React.CSSProperties => {
        switch (shape) {
            case 'circle': return { clipPath: 'circle(50% at 50% 50%)' };
            case 'oval': return { clipPath: 'ellipse(50% 50% at 50% 50%)' };
            case 'triangle': return { clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' };
            case 'star': return { clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' };
            default: return {};
        }
    }

    const DraggableImage: React.FC<{
        element: CustomImageElement;
        index: number;
        containerRef: React.RefObject<HTMLDivElement>;
        onInteractionStart: (e: React.MouseEvent | React.TouchEvent, index: number, action: 'drag' | 'resize' | 'rotate', container: HTMLDivElement | null, elementRef: HTMLDivElement | null) => void;
        onClick: (e: React.MouseEvent, index: number) => void;
        isSelected: boolean;
    }> = React.memo(({ element, index, containerRef, onInteractionStart, onClick, isSelected }) => {
        const itemRef = useRef<HTMLDivElement>(null);
        
        const itemStyle: React.CSSProperties = {
            position: 'absolute',
            top: `${element.position.y}%`,
            left: `${element.position.x}%`,
            width: `${element.size.width}%`,
            height: `auto`,
            aspectRatio: `${element.aspectRatio}`,
            transform: `translate(-50%, -50%) rotate(${element.rotation}deg)`,
            opacity: element.opacity,
            cursor: 'move',
            zIndex: 15 + index,
        };
        const imageStyle: React.CSSProperties = {
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            ...getClipPathStyle(element.clipShape),
        };
        
        return (
            <div ref={itemRef} style={itemStyle} className={`group ${isSelected ? 'outline-dashed outline-2 outline-offset-2 outline-sky-400' : 'hover:outline-dashed hover:outline-1 hover:outline-sky-300/70'}`} onMouseDown={(e) => onInteractionStart(e, index, 'drag', containerRef.current, itemRef.current)} onTouchStart={(e) => onInteractionStart(e, index, 'drag', containerRef.current, itemRef.current)} onClick={(e) => onClick(e, index)}>
                <img src={element.src} alt="Custom element" style={imageStyle} className="pointer-events-none" />
                {isSelected && (
                    <>
                        <div className="absolute -right-1.5 -bottom-1.5 w-4 h-4 cursor-se-resize rounded-full bg-sky-400 border-2 border-white" onMouseDown={(e) => onInteractionStart(e, index, 'resize', containerRef.current, itemRef.current)} onTouchStart={(e) => onInteractionStart(e, index, 'resize', containerRef.current, itemRef.current)}/>
                        <div className="absolute left-1/2 -top-5 -translate-x-1/2 w-4 h-4 cursor-alias rounded-full bg-green-400 border-2 border-white" onMouseDown={(e) => onInteractionStart(e, index, 'rotate', containerRef.current, itemRef.current)} onTouchStart={(e) => onInteractionStart(e, index, 'rotate', containerRef.current, itemRef.current)}/>
                    </>
                )}
            </div>
        );
    });

  const handleZoom = (direction: 'in' | 'out' | 'reset') => {
      if (direction === 'in') {
          setZoomLevel(z => Math.min(3, z + 0.15)); // Max zoom 300%
      } else if (direction === 'out') {
          setZoomLevel(z => Math.max(0.5, z - 0.15)); // Min zoom 50%
      } else {
          setZoomLevel(1.0);
      }
  };

  const handleViewSelect = (view: 'front' | 'spine' | 'back') => {
      let targetRef;
      if (view === 'front') targetRef = frontCoverContainerRef;
      if (view === 'spine') targetRef = spineContainerRef;
      if (view === 'back') targetRef = backCoverContainerRef;
      
      if (targetRef?.current && previewContainerRef.current) {
          const container = previewContainerRef.current;
          const element = targetRef.current;
          
          const elementLeft = element.offsetLeft;
          const elementWidth = element.offsetWidth;
          const containerWidth = container.clientWidth;

          const targetScrollLeft = (elementLeft * zoomLevel) + (elementWidth * zoomLevel / 2) - (containerWidth / 2);
                                   
          container.scrollTo({
              left: targetScrollLeft,
              behavior: 'smooth'
          });
      }
  };

  const handleFullView = () => {
      if(previewContainerRef.current && containerRef.current) {
          const container = previewContainerRef.current;
          const content = containerRef.current;
          const contentWidth = content.offsetWidth * zoomLevel;
          const containerWidth = container.clientWidth;

          container.scrollTo({
              left: (contentWidth - containerWidth) / 2,
              behavior: 'smooth'
          });
      }
  };


  return (
    <Card title="4. Fine-Tune Your Design" className="border-l-4 border-green-500 bg-slate-50">
       <div className="relative">
        {editorConfig && <EditorPopover config={editorConfig} content={content} setContent={setContent} onClose={deselectAll} onDelete={handleDeleteCustomText} orientation={orientation} />}
        {imageEditorConfig && <ImageEditorPopover index={imageEditorConfig.index} top={imageEditorConfig.top} left={imageEditorConfig.left} content={content} setContent={setContent} onClose={deselectAll} onDelete={handleDeleteCustomImage} />}
      </div>
       <div className="flex flex-wrap justify-center gap-x-4 sm:gap-x-6 gap-y-1 sm:gap-y-2 text-xs sm:text-sm text-slate-600 mb-6 p-2 sm:p-3 bg-slate-200 rounded-lg">
         <p><strong>Orientation:</strong> <span className="font-medium text-slate-800">{orientationText}</span></p>
         <p><strong>Cover:</strong> <span className="font-medium text-slate-800">{coverSize}</span></p>
         <p><strong>Spine:</strong> <span className="font-medium text-slate-800">{spineSize}</span></p>
         <p><strong>Bleed:</strong> <span className="font-medium text-slate-800">{bleedSize}</span></p>
         <p><strong>Margin:</strong> <span className="font-medium text-slate-800">{trimSize}</span></p>
      </div>

      <h3 className="text-xl font-semibold text-slate-700 border-t pt-6 mb-4">🖼️ Live Layout Editor</h3>
       <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="relative inline-block text-left" ref={addMenuRef}>
            <div>
              <button
                type="button"
                onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
                className="inline-flex items-center justify-center rounded-full border-b-4 border-slate-400 active:border-b-2 shadow-lg px-5 py-2 bg-gradient-to-b from-slate-200 to-slate-50 text-sm font-bold text-slate-800 hover:from-slate-300 hover:to-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 ease-in-out"
              >
                + Add Element
                <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            {isAddMenuOpen && (
              <div className="origin-top-left absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20" role="menu" aria-orientation="vertical">
                <div className="py-1">
                  <AddMenuItem icon="✏️" label="Text to Front" onClick={() => { handleAddCustomText('front'); setIsAddMenuOpen(false); }} />
                  <AddMenuItem icon="✏️" label="Text to Spine" onClick={() => { handleAddCustomText('spine'); setIsAddMenuOpen(false); }} />
                  <AddMenuItem icon="✏️" label="Text to Back" onClick={() => { handleAddCustomText('back'); setIsAddMenuOpen(false); }} />
                   <div className="border-t my-1 border-slate-200"></div>
                  <AddMenuItem icon="🖼️" label="Image to Front" onClick={() => { handleAddImage('front'); setIsAddMenuOpen(false); }} />
                  <AddMenuItem icon="🖼️" label="Image to Spine" onClick={() => { handleAddImage('spine'); setIsAddMenuOpen(false); }} />
                  <AddMenuItem icon="🖼️" label="Image to Back" onClick={() => { handleAddImage('back'); setIsAddMenuOpen(false); }} />
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2 p-1 bg-slate-200 rounded-lg">
              <div className="flex items-center gap-2 border-r border-slate-300 pr-2 sm:pr-3 mr-1 sm:mr-2">
                  <input type="checkbox" id="show-bleed" checked={showBleed} onChange={(e) => setShowBleed(e.target.checked)} className="h-4 w-4 rounded border-gray-400 text-indigo-600 focus:ring-indigo-500 cursor-pointer" />
                  <label htmlFor="show-bleed" className="text-sm font-medium text-slate-700 select-none cursor-pointer">Show Bleed</label>
              </div>
              <span className="text-sm font-semibold text-slate-700 mx-2 hidden sm:inline">View:</span>
              <button onClick={() => handleViewSelect('front')} className="px-2 sm:px-3 py-1 text-sm bg-white rounded-md shadow-sm hover:bg-slate-50">Front</button>
              <button onClick={() => handleViewSelect('spine')} className="px-2 sm:px-3 py-1 text-sm bg-white rounded-md shadow-sm hover:bg-slate-50">Spine</button>
              <button onClick={() => handleViewSelect('back')} className="px-2 sm:px-3 py-1 text-sm bg-white rounded-md shadow-sm hover:bg-slate-50">Back</button>
              <button onClick={handleFullView} className="px-2 sm:px-3 py-1 text-sm bg-white rounded-md shadow-sm hover:bg-slate-50">Full</button>
              <span className="text-sm font-semibold text-slate-700 mx-2 hidden sm:inline">Zoom:</span>
              <button onClick={() => handleZoom('out')} className="px-2 py-1 text-base font-bold bg-white rounded-md shadow-sm hover:bg-slate-50">-</button>
              <button onClick={() => handleZoom('reset')} className="px-2 sm:px-3 py-1 text-sm w-16 text-center bg-white rounded-md shadow-sm hover:bg-slate-50">{Math.round(zoomLevel * 100)}%</button>
              <button onClick={() => handleZoom('in')} className="px-2 py-1 text-base font-bold bg-white rounded-md shadow-sm hover:bg-slate-50">+</button>
          </div>
       </div>

      <div
          ref={previewContainerRef}
          className="bg-gradient-to-br from-slate-200 to-slate-300 p-2 md:p-4 rounded-lg overflow-auto select-none relative flex items-center justify-start cursor-grab active:cursor-grabbing"
          style={{ height: '70vh', minHeight: '400px', maxHeight: '800px', resize: 'vertical' }}
      >
          <div
              ref={containerRef}
              style={{
                  minWidth: fullMockupWidth,
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: 'top left',
                  transition: 'transform 0.2s ease-out',
                  padding: '40px'
              }}
          >
              <div
                  style={{
                      width: fullMockupWidth,
                      height: fullMockupHeight,
                      transform: `rotateY(${orientation === 'right' ? '-8deg' : '8deg'}) rotateX(2deg)`,
                      filter: 'drop-shadow(0 20px 15px rgba(0,0,0,0.2))'
                  }}
                  className="bg-transparent mx-auto relative"
              >
                  <div className={`flex items-center h-full w-full shadow-2xl ${orientation === 'left' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div ref={backCoverContainerRef}>
                      <BackCover width={scaled.frontBackWidth} height={scaled.height} content={content} scaleFactor={scaleFactor} handleStart={handleStart} handleTextClick={handleTextClick}>
                        {content.customImageElements.filter(el => el.coverPart === 'back').map((el, index) => { const originalIndex = content.customImageElements.findIndex(origEl => origEl.id === el.id); return <DraggableImage key={el.id} element={el} index={originalIndex} containerRef={backCoverContainerRef} onInteractionStart={handleImageInteractionStart} onClick={handleImageClick} isSelected={selectedImageIndex === originalIndex} /> })}
                      </BackCover>
                    </div>
                    <div ref={spineContainerRef}>
                      <Spine width={scaled.spineWidth} height={scaled.height} content={content} scaleFactor={scaleFactor} handleStart={handleStart} handleTextClick={handleTextClick}>
                        {content.customImageElements.filter(el => el.coverPart === 'spine').map((el, index) => { const originalIndex = content.customImageElements.findIndex(origEl => origEl.id === el.id); return <DraggableImage key={el.id} element={el} index={originalIndex} containerRef={spineContainerRef} onInteractionStart={handleImageInteractionStart} onClick={handleImageClick} isSelected={selectedImageIndex === originalIndex} /> })}
                      </Spine>
                    </div>
                    <div ref={frontCoverContainerRef}>
                      <FrontCover width={scaled.frontBackWidth} height={scaled.height} content={content} scaleFactor={scaleFactor} handleStart={handleStart} handleTextClick={handleTextClick}>
                        {content.customImageElements.filter(el => el.coverPart === 'front').map((el, index) => { const originalIndex = content.customImageElements.findIndex(origEl => origEl.id === el.id); return <DraggableImage key={el.id} element={el} index={originalIndex} containerRef={frontCoverContainerRef} onInteractionStart={handleImageInteractionStart} onClick={handleImageClick} isSelected={selectedImageIndex === originalIndex} /> })}
                      </FrontCover>
                    </div>
                  </div>
                  
                  {/* OVERLAYS */}
                  {showBleed && (
                      <div 
                          className="absolute border-2 border-dashed border-red-500/80 pointer-events-none"
                          style={{ top: scaled.bleed, left: scaled.bleed, right: scaled.bleed, bottom: scaled.bleed }}
                          title={`Trim Line (${coverSize})`}
                      >
                           <span className="absolute -top-5 left-1 text-red-500 text-xs font-mono bg-white/50 px-1 rounded">Trim</span>
                      </div>
                  )}
                  <div 
                      className="absolute border border-dashed border-cyan-300/80 pointer-events-none"
                      style={{ 
                          top: scaled.bleed + scaled.trim, 
                          left: scaled.bleed + scaled.trim, 
                          right: scaled.bleed + scaled.trim, 
                          bottom: scaled.bleed + scaled.trim 
                      }}
                       title={`Safety Margin (${trimSize})`}
                  >
                      <span className="absolute -top-5 right-1 text-cyan-300 text-xs font-mono bg-black/50 px-1 rounded">Safety</span>
                  </div>
              </div>
          </div>
      </div>
      <p className="text-sm text-slate-500 pt-4 italic text-center">💡 Use the toolbar to zoom and focus on different parts of the cover.</p>

      <div className="flex flex-row justify-between items-center mt-8 gap-4">
         <button onClick={() => showInterstitialAd(onBack)} className="py-2 px-6 text-base rounded-full font-bold text-white shadow-lg transform hover:scale-105 transition-all duration-200 ease-in-out bg-gradient-to-b from-slate-500 to-slate-700 border-b-4 border-slate-800 hover:from-slate-600 hover:to-slate-800 active:border-b-2 active:border-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500">
          ← Edit
        </button>
        <button onClick={() => showInterstitialAd(generateAndShowPreview)} disabled={isGenerating} className="py-2 px-6 text-base rounded-full font-bold text-white shadow-lg transform hover:scale-105 transition-all duration-200 ease-in-out bg-gradient-to-b from-green-500 to-green-700 border-b-4 border-green-800 hover:from-green-600 hover:to-green-800 active:border-b-2 active:border-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:from-green-400 disabled:to-green-600 disabled:border-green-700 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          {isGenerating ? (
            <><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Preparing Preview...</>
          ) : '✓ Preview'}
        </button>
      </div>

      {isPreviewModalOpen && imageWithTextUrl && (
        <PreviewModal 
            imageUrl={imageWithTextUrl} 
            onClose={() => setIsPreviewModalOpen(false)}
            onDownloadWithText={handleDownloadWithText}
            onUnlockWithoutText={handleUnlockWithoutText}
            isGeneratingPremium={isGeneratingPremium}
        />
      )}

      <RewardedAdModal 
        isOpen={isRewardedAdOpen}
        onClose={() => setIsRewardedAdOpen(false)}
        onRewardClaimed={handleRewardClaimed}
      />

      <InterstitialAdModal 
        isOpen={isInterstitialAdOpen}
        onClose={handleInterstitialAdClose}
      />
    </Card>
  );
};

export default Step3Summary;
