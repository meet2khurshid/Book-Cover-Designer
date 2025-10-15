import React, { useState, useRef, useEffect, useCallback } from 'react';

interface ImageEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (imageDataUrl: string) => void;
  imageUrl: string | null;
  disableClip?: boolean;
}

type Tool = 'crop' | 'clip';
type Shape = 'none' | 'circle' | 'oval' | 'square' | 'rectangle' | 'triangle' | 'polygon' | 'heart' | 'star';
interface CropRect { x: number; y: number; width: number; height: number; }

const ImageEditor: React.FC<ImageEditorProps> = ({ isOpen, onClose, onSave, imageUrl, disableClip = false }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [history, setHistory] = useState<string[]>([]);
    
    const [activeTool, setActiveTool] = useState<Tool | null>(null);

    // Crop state
    const cropOverlayRef = useRef<HTMLDivElement>(null);
    const [isCropping, setIsCropping] = useState(false);
    const [cropRect, setCropRect] = useState<CropRect | null>(null);
    const [cropStartPoint, setCropStartPoint] = useState<{ x: number; y: number } | null>(null);

    // Clip state
    const [clipShape, setClipShape] = useState<Shape>('none');
    const [clipBorderWidth, setClipBorderWidth] = useState(0);
    const [clipBorderColor, setClipBorderColor] = useState('#ffffff');
    
    const loadImageToCanvas = useCallback((dataUrl: string) => {
        return new Promise<HTMLImageElement>((resolve) => {
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext('2d');
            if (!ctx || !canvas) return resolve(new Image());

            const img = new Image();
            img.onload = () => {
                const MAX_WIDTH = 800;
                const MAX_HEIGHT = 600;
                let { width, height } = img;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                ctx.clearRect(0, 0, width, height);
                ctx.drawImage(img, 0, 0, width, height);
                resolve(img);
            };
            img.src = dataUrl;
        });
    }, []);

    const saveToHistory = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        setHistory(prev => [...prev, canvas.toDataURL('image/png')]);
    }, []);

    useEffect(() => {
        if (isOpen && imageUrl) {
            loadImageToCanvas(imageUrl).then(() => {
                const canvas = canvasRef.current;
                if(canvas) setHistory([canvas.toDataURL('image/png')]);
            });
            setActiveTool(null);
            setClipShape('none');
            setCropRect(null);
        } else {
            setHistory([]);
        }
    }, [isOpen, imageUrl, loadImageToCanvas]);

    const handleUndo = () => {
        if (history.length > 1) {
            const newHistory = [...history];
            newHistory.pop();
            const previousState = newHistory[newHistory.length - 1];
            loadImageToCanvas(previousState).then(() => {
                setHistory(newHistory);
            });
        }
    };
    
    // --- Cropping Logic ---

    const getCanvasRelativeCoords = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    };

    const handleCropMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
        if (activeTool !== 'crop') return;
        e.preventDefault();
        e.stopPropagation();
        const coords = getCanvasRelativeCoords(e);
        setIsCropping(true);
        setCropStartPoint(coords);
        setCropRect({ x: coords.x, y: coords.y, width: 0, height: 0 });
    };

    const handleCropMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
        if (!isCropping || !cropStartPoint || activeTool !== 'crop') return;
        e.preventDefault();
        e.stopPropagation();
        const coords = getCanvasRelativeCoords(e);
        const newRect: CropRect = {
            x: Math.min(cropStartPoint.x, coords.x),
            y: Math.min(cropStartPoint.y, coords.y),
            width: Math.abs(coords.x - cropStartPoint.x),
            height: Math.abs(coords.y - cropStartPoint.y)
        };
        setCropRect(newRect);
    }, [isCropping, cropStartPoint, activeTool]);

    const handleCropMouseUp = useCallback(() => {
        setIsCropping(false);
        setCropStartPoint(null);
        if (cropRect && (cropRect.width < 10 || cropRect.height < 10)) {
            setCropRect(null);
        }
    }, [cropRect]);

    useEffect(() => {
        if (activeTool !== 'crop') return;
        window.addEventListener('mousemove', handleCropMouseMove);
        window.addEventListener('mouseup', handleCropMouseUp);
        window.addEventListener('touchmove', handleCropMouseMove);
        window.addEventListener('touchend', handleCropMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleCropMouseMove);
            window.removeEventListener('mouseup', handleCropMouseUp);
            window.removeEventListener('touchmove', handleCropMouseMove);
            window.removeEventListener('touchend', handleCropMouseUp);
        };
    }, [activeTool, handleCropMouseMove, handleCropMouseUp]);

    useEffect(() => {
        const overlay = cropOverlayRef.current;
        const canvas = canvasRef.current;
        if (overlay && canvas && cropRect && activeTool === 'crop') {
            const canvasRect = canvas.getBoundingClientRect();
            const containerRect = canvas.parentElement!.getBoundingClientRect();
            const scaleX = canvasRect.width / canvas.width;
            const scaleY = canvasRect.height / canvas.height;
            
            overlay.style.left = `${canvasRect.left - containerRect.left + cropRect.x * scaleX}px`;
            overlay.style.top = `${canvasRect.top - containerRect.top + cropRect.y * scaleY}px`;
            overlay.style.width = `${cropRect.width * scaleX}px`;
            overlay.style.height = `${cropRect.height * scaleY}px`;
            overlay.style.display = 'block';
        } else if (overlay) {
            overlay.style.display = 'none';
        }
    }, [cropRect, activeTool]);

    const applyCrop = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas || !cropRect || cropRect.width < 1 || cropRect.height < 1) {
            setActiveTool(null);
            setCropRect(null);
            return;
        }
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const boundedCropRect = {
            x: Math.max(0, cropRect.x),
            y: Math.max(0, cropRect.y),
            width: Math.min(canvas.width - cropRect.x, cropRect.width),
            height: Math.min(canvas.height - cropRect.y, cropRect.height),
        };

        if (boundedCropRect.width < 1 || boundedCropRect.height < 1) return;

        const croppedImageData = ctx.getImageData(boundedCropRect.x, boundedCropRect.y, boundedCropRect.width, boundedCropRect.height);
        
        canvas.width = boundedCropRect.width;
        canvas.height = boundedCropRect.height;
        ctx.putImageData(croppedImageData, 0, 0);

        saveToHistory();
        setCropRect(null);
        setActiveTool(null);
    }, [cropRect, saveToHistory]);

    const cancelCrop = () => {
        setActiveTool(null);
        setCropRect(null);
    };

    // --- Clipping Logic ---
    const applyClip = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx || !canvas || history.length === 0) return;
    
        const lastStateImg = new Image();
        lastStateImg.onload = () => {
            canvas.width = lastStateImg.width;
            canvas.height = lastStateImg.height;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
    
            const { width: w, height: h } = canvas;
            const centerX = w / 2;
            const centerY = h / 2;
    
            const definePath = () => {
                ctx.beginPath();
                switch(clipShape) {
                    case 'circle':
                        ctx.arc(centerX, centerY, Math.min(w, h) / 2 - clipBorderWidth, 0, 2 * Math.PI);
                        break;
                    case 'oval':
                        ctx.ellipse(centerX, centerY, w / 2 - clipBorderWidth, h / 2 - clipBorderWidth, 0, 0, 2 * Math.PI);
                        break;
                    case 'square': {
                        const size = Math.min(w, h);
                        ctx.rect(centerX - size/2 + clipBorderWidth, centerY - size/2 + clipBorderWidth, size - clipBorderWidth * 2, size - clipBorderWidth * 2);
                        break;
                    }
                    case 'rectangle':
                        ctx.rect(clipBorderWidth, clipBorderWidth, w - clipBorderWidth * 2, h - clipBorderWidth * 2);
                        break;
                    case 'triangle': {
                        const side = Math.min(w, h) - clipBorderWidth * 2;
                        const triHeight = side * (Math.sqrt(3) / 2);
                        ctx.moveTo(centerX, centerY - triHeight / 2);
                        ctx.lineTo(centerX - side / 2, centerY + triHeight / 2);
                        ctx.lineTo(centerX + side / 2, centerY + triHeight / 2);
                        break;
                    }
                    case 'polygon': { // Hexagon
                        const radius = Math.min(w, h) / 2 - clipBorderWidth;
                        for (let i = 0; i < 6; i++) {
                            ctx.lineTo(centerX + radius * Math.cos(Math.PI / 3 * i), centerY + radius * Math.sin(Math.PI / 3 * i));
                        }
                        break;
                    }
                    case 'heart': {
                        const size = Math.min(w, h) * 0.9;
                        const topCurveHeight = size * 0.3;
                        ctx.moveTo(centerX, centerY + (size - topCurveHeight) / 2);
                        ctx.bezierCurveTo(centerX, centerY + (size - topCurveHeight * 1.5) / 2, centerX - size / 2, centerY - topCurveHeight / 2, centerX - size / 2, centerY + topCurveHeight / 2);
                        ctx.arc(centerX - size / 4, centerY + topCurveHeight / 2, size / 4, Math.PI, 0, false);
                        ctx.arc(centerX + size / 4, centerY + topCurveHeight / 2, size / 4, Math.PI, 0, false);
                        ctx.bezierCurveTo(centerX + size / 2, centerY - topCurveHeight / 2, centerX, centerY + (size - topCurveHeight * 1.5) / 2, centerX, centerY + (size - topCurveHeight) / 2);
                        break;
                    }
                    case 'star': {
                        const spikes = 5;
                        const outerRadius = Math.min(w, h) / 2;
                        const innerRadius = outerRadius / 2;
                        let rot = Math.PI / 2 * 3;
                        const step = Math.PI / spikes;
                        ctx.moveTo(centerX, centerY - outerRadius);
                        for (let i = 0; i < spikes; i++) {
                            ctx.lineTo(centerX + Math.cos(rot) * outerRadius, centerY + Math.sin(rot) * outerRadius);
                            rot += step;
                            ctx.lineTo(centerX + Math.cos(rot) * innerRadius, centerY + Math.sin(rot) * innerRadius);
                            rot += step;
                        }
                        ctx.lineTo(centerX, centerY - outerRadius);
                        break;
                    }
                }
                ctx.closePath();
            };
    
            ctx.save();
            if (clipShape !== 'none') {
                definePath();
                ctx.clip();
            }
            ctx.drawImage(lastStateImg, 0, 0, w, h);
            ctx.restore();
    
            if (clipShape !== 'none' && clipBorderWidth > 0) {
                definePath();
                ctx.strokeStyle = clipBorderColor;
                ctx.lineWidth = clipBorderWidth * 2;
                ctx.stroke();
            }
        };
        lastStateImg.src = history[history.length - 1];
    }, [clipShape, clipBorderColor, clipBorderWidth, history]);
    
    useEffect(() => {
        if (activeTool === 'clip') {
            applyClip();
        } else if (activeTool !== 'crop' && history.length > 0) {
             loadImageToCanvas(history[history.length-1]);
        }
    }, [activeTool, clipShape, clipBorderColor, clipBorderWidth, applyClip, loadImageToCanvas, history]);


    const handleSave = () => {
        if (!canvasRef.current) return;
        
        if (activeTool === 'crop' && cropRect) {
            alert("Please apply or cancel your crop before saving.");
            return;
        }

        if(activeTool === 'clip' && clipShape !== 'none') {
            // Final apply to make sure it's rendered, then save to history
            applyClip();
            saveToHistory();
        }
        
        onSave(canvasRef.current.toDataURL('image/png'));
        onClose();
    };
    
    if (!isOpen) return null;

    const ToolButton: React.FC<{ tool: Tool, label: string, icon: React.ReactNode }> = ({ tool, label, icon }) => (
        <button
            onClick={() => {
                if (activeTool === 'crop' && cropRect) {
                    if(!window.confirm("You have an unapplied crop. Do you want to discard it and switch tools?")) return;
                }
                setActiveTool(activeTool === tool ? null : tool);
                setCropRect(null);
            }}
            className={`flex flex-col items-center justify-center p-1 rounded-lg w-14 h-14 sm:w-16 sm:h-16 transition-colors ${activeTool === tool ? 'bg-blue-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}
        >
            {icon}
            <span className="text-xs mt-1 font-semibold">{label}</span>
        </button>
    );

    const ShapeButton: React.FC<{shape: Shape, children: React.ReactNode}> = ({shape, children}) => (
        <button onClick={() => setClipShape(shape)} className={`w-8 h-8 flex items-center justify-center rounded-md transition ${clipShape === shape ? 'bg-blue-200 ring-2 ring-blue-500' : 'bg-slate-200 hover:bg-slate-300'}`}>{children}</button>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[102] p-2 sm:p-4" onClick={onClose}>
            <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-6xl h-[95vh] flex flex-col md:flex-row text-white" onClick={e => e.stopPropagation()}>
                
                {/* Main Content Area (Canvas + Contextual Controls) */}
                <div className="flex-1 flex flex-col bg-slate-800 md:rounded-l-xl overflow-hidden order-1 md:order-2">
                    {/* Top Bar - Contextual Controls */}
                    <div className="h-auto min-h-[4rem] md:h-16 bg-slate-900/50 flex items-center justify-center px-4">
                        {activeTool === 'crop' && cropRect && (
                            <div className="flex items-center gap-4">
                                <button onClick={applyCrop} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg">Apply Crop</button>
                                <button onClick={cancelCrop} className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-lg">Cancel</button>
                            </div>
                        )}
                        {activeTool === 'clip' && (
                            <div className="flex items-center gap-x-3 gap-y-2 w-full flex-wrap justify-center">
                               <p className="font-semibold text-sm hidden sm:block">Shape:</p>
                               <div className="flex items-center gap-2 flex-wrap">
                                   <ShapeButton shape="none"><svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg></ShapeButton>
                                   <ShapeButton shape="square"><div className="w-4 h-4 bg-slate-500 rounded-sm"></div></ShapeButton>
                                   <ShapeButton shape="rectangle"><div className="w-5 h-4 bg-slate-500 rounded-sm"></div></ShapeButton>
                                   <ShapeButton shape="circle"><div className="w-4 h-4 bg-slate-500 rounded-full"></div></ShapeButton>
                                   <ShapeButton shape="oval"><div className="w-5 h-4 bg-slate-500 rounded-full"></div></ShapeButton>
                                   <ShapeButton shape="triangle"><svg className="w-5 h-5 text-slate-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2L1.5 17h17L10 2z"/></svg></ShapeButton>
                                   <ShapeButton shape="polygon"><svg className="w-5 h-5 text-slate-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 8.5V15.5L12 22L22 15.5V8.5L12 2Z"/></svg></ShapeButton>
                                   <ShapeButton shape="heart"><svg className="w-5 h-5 text-slate-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/></svg></ShapeButton>
                                   <ShapeButton shape="star"><svg className="w-5 h-5 text-slate-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg></ShapeButton>
                               </div>
                               <div className="flex items-center gap-2">
                                 <label className="text-sm font-semibold hidden sm:block">Border:</label>
                                 <input type="color" value={clipBorderColor} onChange={e => setClipBorderColor(e.target.value)} className="w-8 h-8 rounded-md border-2 border-slate-600 cursor-pointer bg-transparent" />
                                 <input type="range" min="0" max="20" value={clipBorderWidth} onChange={e => setClipBorderWidth(Number(e.target.value))} className="w-20 sm:w-28" />
                               </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Canvas Area */}
                    <div className="flex-1 flex items-center justify-center p-2 sm:p-4 overflow-hidden relative">
                        <canvas 
                           ref={canvasRef} 
                           className={`max-w-full max-h-full rounded-sm shadow-lg ${activeTool === 'crop' ? 'cursor-crosshair' : ''}`}
                           onMouseDown={handleCropMouseDown}
                           onTouchStart={handleCropMouseDown}
                        ></canvas>
                        <div ref={cropOverlayRef} className="absolute border-2 border-dashed border-sky-400 bg-sky-400/20 pointer-events-none" style={{display: 'none'}}></div>
                    </div>
                </div>
                
                {/* Toolbar and Actions */}
                <div className="order-2 md:order-1 w-full md:w-24 bg-slate-900/50 p-2 md:p-3 flex flex-row md:flex-col items-center justify-between md:justify-start md:rounded-r-xl md:rounded-l-none rounded-b-xl">
                    <div className="flex flex-row md:flex-col items-center gap-2 md:space-y-3">
                        <ToolButton tool="crop" label="Crop" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.304 4.844l-2.857 2.857m-2.286 0L4.843 4.844m11.314 11.314l-2.857-2.857m-2.286 0l-4.314 4.314M4 12h16"/></svg>} />
                        {!disableClip && <ToolButton tool="clip" label="Clip" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002 2V8l-6-6z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 2v6h6M9.707 11.707a1 1 0 010-1.414l2-2a1 1 0 011.414 0l2 2a1 1 0 01-1.414 1.414L14 10.414V16a1 1 0 11-2 0v-5.586l-.293.293a1 1 0 01-1.414 0z"/></svg>} />}
                    </div>
                    
                    <div className="md:flex-grow"></div>
                    
                    <div className="flex flex-row-reverse md:flex-col items-center gap-2">
                         <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-1.5 px-3 sm:py-2 sm:px-5 text-sm sm:text-base rounded-lg transition-colors">Save</button>
                         <button onClick={onClose} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-1.5 px-3 sm:py-2 sm:px-4 text-sm sm:text-base rounded-lg transition-colors">Cancel</button>
                         <button onClick={handleUndo} disabled={history.length <= 1} className="p-1.5 sm:p-2 mt-0 md:mt-4 rounded-lg w-auto transition-colors bg-slate-700 hover:bg-slate-600 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed" title="Undo">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                         </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ImageEditor;