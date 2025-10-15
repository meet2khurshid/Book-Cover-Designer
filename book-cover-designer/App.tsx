
import React, { useState } from 'react';
import Step1Orientation from './components/Step1Orientation';
import Step2Dimensions from './components/Step2Dimensions';
import Step3Content from './components/Step3Content';
import Step3Summary from './components/Step3Summary';
import AdBanner from './components/AdBanner';
import { Orientation, BookContent } from './types';

const App: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [orientation, setOrientation] = useState<Orientation>('right');
  const [dimensions, setDimensions] = useState({
    width: '6',
    height: '9',
    spine: '1',
    bleed: '0.125',
    trim: '0.125',
  });
  const [content, setContent] = useState<BookContent>({
    title: '',
    subtitle: '',
    author: '',
    publisherLogo: null,
    aboutText: '',
    authorImage: null,
    isbnImage: null,
    titleFont: 'serif',
    subtitleFont: 'sans-serif',
    authorFont: 'sans-serif',
    backTextFont: 'sans-serif',
    titleFontSize: 64,
    titleFontColor: '#FFFFFF',
    subtitleFontSize: 32,
    subtitleFontColor: '#FFFFFF',
    authorFontSize: 42,
    authorFontColor: '#FFFFFF',
    titleAlign: 'center',
    subtitleAlign: 'center',
    authorAlign: 'center',
    backTextAlign: 'left',
    titlePosition: { x: 50, y: 25 },
    subtitlePosition: { x: 50, y: 45 },
    authorPosition: { x: 50, y: 85 },
    spineTitleFont: 'serif',
    spineAuthorFont: 'sans-serif',
    spineTitleFontSize: 36,
    spineTitleFontColor: '#FFFFFF',
    spineAuthorFontSize: 24,
    spineAuthorFontColor: '#FFFFFF',
    spineTitlePosition: { x: 50, y: 30 },
    spineAuthorPosition: { x: 50, y: 80 },
    backTextFontSize: 12,
    backTextColor: '#FFFFFF',
    aboutTextPosition: { x: 5, y: 15 },
    aboutTextSize: { width: 60 },
    authorImagePosition: { x: 70, y: 5 },
    authorImageSize: { width: 25 },
    isbnImagePosition: { x: 70, y: 85 },
    isbnImageSize: { width: 25 },
    frontPublisherLogoPosition: { x: 50, y: 95 },
    frontPublisherLogoSize: { width: 15 },
    spinePublisherLogoPosition: { x: 50, y: 95 },
    spinePublisherLogoSize: { width: 60 },
    backPublisherLogoPosition: { x: 5, y: 93 },
    backPublisherLogoSize: { width: 10 },
    frontCoverBgType: 'gradient',
    frontCoverImage: null,
    frontCoverBgColor1: '#63B3ED',
    frontCoverBgColor2: '#3182CE',
    frontCoverBgAngle: 145,
    spineBgType: 'gradient',
    spineImage: null,
    spineBgColor1: '#ED8936',
    spineBgColor2: '#C05621',
    spineBgAngle: 180,
    backBgType: 'gradient',
    backCoverImage: null,
    backBgColor1: '#2D3748',
    backBgColor2: '#1A202C',
    backBgAngle: 180,
    // New Text Styles
    titleLineHeight: 1.2,
    titleLetterSpacing: 0,
    titleStrokeWidth: 0,
    titleStrokeColor: '#000000',
    titleShadowBlur: 0,
    titleShadowColor: 'rgba(0,0,0,0.5)',
    subtitleLineHeight: 1.2,
    subtitleLetterSpacing: 0,
    subtitleStrokeWidth: 0,
    subtitleStrokeColor: '#000000',
    subtitleShadowBlur: 0,
    subtitleShadowColor: 'rgba(0,0,0,0.5)',
    authorLineHeight: 1.2,
    authorLetterSpacing: 0,
    authorStrokeWidth: 0,
    authorStrokeColor: '#000000',
    authorShadowBlur: 0,
    authorShadowColor: 'rgba(0,0,0,0.5)',
    spineTitleLetterSpacing: 0,
    spineAuthorLetterSpacing: 0,
    backTextLineHeight: 1.4,
    backTextLetterSpacing: 0,
    backTextStrokeWidth: 0,
    backTextStrokeColor: '#000000',
    backTextShadowBlur: 0,
    backTextShadowColor: 'rgba(0,0,0,0.5)',
    customTextElements: [],
    customImageElements: [],
    customFonts: [],
  });


  const handleNextFromStep1 = () => {
    setStep(2);
  };

  const handleNextFromStep2 = () => {
    const width = parseFloat(dimensions.width);
    const height = parseFloat(dimensions.height);
    const spine = parseFloat(dimensions.spine);
    const bleed = parseFloat(dimensions.bleed);
    const trim = parseFloat(dimensions.trim);

    if (isNaN(width) || isNaN(height) || isNaN(spine) || width <= 0 || height <= 0 || spine <= 0) {
      alert('Please enter valid positive numbers for width, height, and spine.');
      return;
    }
    if (isNaN(bleed) || isNaN(trim) || bleed < 0 || trim < 0) {
      alert('Bleed and Safety Margin must be zero or positive numbers.');
      return;
    }
    setStep(3);
  };
  
  const handleNextFromStep3 = () => {
    setStep(4);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleRestart = () => {
    setStep(1);
    setOrientation('right');
    setDimensions({
      width: '6',
      height: '9',
      spine: '1',
      bleed: '0.125',
      trim: '0.125',
    });
    setContent({
      title: '',
      subtitle: '',
      author: '',
      publisherLogo: null,
      aboutText: '',
      authorImage: null,
      isbnImage: null,
      titleFont: 'serif',
      subtitleFont: 'sans-serif',
      authorFont: 'sans-serif',
      backTextFont: 'sans-serif',
      titleFontSize: 64,
      titleFontColor: '#FFFFFF',
      subtitleFontSize: 32,
      subtitleFontColor: '#FFFFFF',
      authorFontSize: 42,
      authorFontColor: '#FFFFFF',
      titleAlign: 'center',
      subtitleAlign: 'center',
      authorAlign: 'center',
      backTextAlign: 'left',
      titlePosition: { x: 50, y: 25 },
      subtitlePosition: { x: 50, y: 45 },
      authorPosition: { x: 50, y: 85 },
      spineTitleFont: 'serif',
      spineAuthorFont: 'sans-serif',
      spineTitleFontSize: 36,
      spineTitleFontColor: '#FFFFFF',
      spineAuthorFontSize: 24,
      spineAuthorFontColor: '#FFFFFF',
      spineTitlePosition: { x: 50, y: 30 },
      spineAuthorPosition: { x: 50, y: 80 },
      backTextFontSize: 12,
      backTextColor: '#FFFFFF',
      aboutTextPosition: { x: 5, y: 15 },
      aboutTextSize: { width: 60 },
      authorImagePosition: { x: 70, y: 5 },
      authorImageSize: { width: 25 },
      isbnImagePosition: { x: 70, y: 85 },
      isbnImageSize: { width: 25 },
      frontPublisherLogoPosition: { x: 50, y: 95 },
      frontPublisherLogoSize: { width: 15 },
      spinePublisherLogoPosition: { x: 50, y: 95 },
      spinePublisherLogoSize: { width: 60 },
      backPublisherLogoPosition: { x: 5, y: 93 },
      backPublisherLogoSize: { width: 10 },
      frontCoverBgType: 'gradient',
      frontCoverImage: null,
      frontCoverBgColor1: '#63B3ED',
      frontCoverBgColor2: '#3182CE',
      frontCoverBgAngle: 145,
      spineBgType: 'gradient',
      spineImage: null,
      spineBgColor1: '#ED8936',
      spineBgColor2: '#C05621',
      spineBgAngle: 180,
      backBgType: 'gradient',
      backCoverImage: null,
      backBgColor1: '#2D3748',
      backBgColor2: '#1A202C',
      backBgAngle: 180,
      // Reset Text Styles
      titleLineHeight: 1.2,
      titleLetterSpacing: 0,
      titleStrokeWidth: 0,
      titleStrokeColor: '#000000',
      titleShadowBlur: 0,
      titleShadowColor: 'rgba(0,0,0,0.5)',
      subtitleLineHeight: 1.2,
      subtitleLetterSpacing: 0,
      subtitleStrokeWidth: 0,
      subtitleStrokeColor: '#000000',
      subtitleShadowBlur: 0,
      subtitleShadowColor: 'rgba(0,0,0,0.5)',
      authorLineHeight: 1.2,
      authorLetterSpacing: 0,
      authorStrokeWidth: 0,
      authorStrokeColor: '#000000',
      authorShadowBlur: 0,
      authorShadowColor: 'rgba(0,0,0,0.5)',
      spineTitleLetterSpacing: 0,
      spineAuthorLetterSpacing: 0,
      backTextLineHeight: 1.4,
      backTextLetterSpacing: 0,
      backTextStrokeWidth: 0,
      backTextStrokeColor: '#000000',
      backTextShadowBlur: 0,
      backTextShadowColor: 'rgba(0,0,0,0.5)',
      customTextElements: [],
      customImageElements: [],
      customFonts: [],
    });
  };

  const isVerticallyCenteredStep = step === 1 || step === 2;

  return (
    <div className="flex flex-col h-screen bg-slate-100">
      <AdBanner position="top" />
      <div className="flex-1 flex flex-col overflow-y-auto p-4 sm:p-6 md:p-8">
        <div className={`w-full max-w-[38.4rem] mx-auto text-slate-800 ${isVerticallyCenteredStep ? 'my-auto' : ''}`}>
          <header className="text-center mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-700">
              🎨 Book Cover Designer
            </h1>
            <p className="text-slate-500 mt-2 text-sm">Define Your Cover Specs & Generate a Print-Ready Layout</p>
          </header>
          
          <main>
            {step === 1 && (
              <Step1Orientation
                orientation={orientation}
                setOrientation={setOrientation}
                onNext={handleNextFromStep1}
              />
            )}
            {step === 2 && (
              <Step2Dimensions
                dimensions={dimensions}
                setDimensions={setDimensions}
                onNext={handleNextFromStep2}
                onBack={handleBack}
              />
            )}
            {step === 3 && (
              <Step3Content
                orientation={orientation}
                content={content}
                setContent={setContent}
                onNext={handleNextFromStep3}
                onBack={handleBack}
              />
            )}
            {step === 4 && (
              <Step3Summary
                orientation={orientation}
                dimensions={dimensions}
                content={content}
                setContent={setContent}
                onBack={handleBack}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default App;
