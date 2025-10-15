export type Orientation = 'right' | 'left';

export type TextAlign = 'left' | 'center' | 'right' | 'justify';

export type Position = {
  x: number;
  y: number;
};

export type Size = {
  width: number;
};

export interface Dimensions {
  width: string;
  height: string;
  spine: string;
  bleed: string;
  trim: string;
}

export type FrontCoverBackgroundType = 'upload' | 'gradient';
export type BackgroundType = 'upload' | 'gradient';
export type ClipShape = 'none' | 'circle' | 'oval' | 'square' | 'rectangle' | 'triangle' | 'polygon' | 'heart' | 'star';

export interface CustomFont {
  name: string;
  url: string; // Data URL
}

export interface CustomTextElement {
  id: string;
  text: string;
  coverPart: 'front' | 'back' | 'spine';
  position: Position;
  size: Size;
  font: string;
  fontSize: number;
  fontColor: string;
  align: TextAlign;
  lineHeight: number;
  letterSpacing: number;
  strokeWidth: number;
  strokeColor: string;
  shadowBlur: number;
  shadowColor: string;
}

export interface CustomImageElement {
  id: string;
  src: string;
  coverPart: 'front' | 'back' | 'spine';
  position: Position;
  size: { width: number; };
  rotation: number; // degrees
  opacity: number; // 0-1
  clipShape: ClipShape;
  aspectRatio: number;
}

export interface BookContent {
  title: string;
  subtitle: string;
  author: string;
  publisherLogo: string | null;
  aboutText: string;
  authorImage: string | null;
  isbnImage: string | null;
  titleFont: string;
  subtitleFont: string;
  authorFont: string;
  backTextFont: string;
  titleFontSize: number;
  titleFontColor: string;
  subtitleFontSize: number;
  subtitleFontColor: string;
  authorFontSize: number;
  authorFontColor: string;
  titleAlign: TextAlign;
  subtitleAlign: TextAlign;
  authorAlign: TextAlign;
  backTextAlign: TextAlign;
  titlePosition: Position;
  subtitlePosition: Position;
  authorPosition: Position;
  spineTitleFont: string;
  spineAuthorFont: string;
  spineTitleFontSize: number;
  spineTitleFontColor: string;
  spineAuthorFontSize: number;
  spineAuthorFontColor: string;
  spineTitlePosition: Position;
  spineAuthorPosition: Position;
  backTextFontSize: number;
  backTextColor: string;
  aboutTextPosition: Position;
  aboutTextSize: Size;
  authorImagePosition: Position;
  authorImageSize: Size;
  isbnImagePosition: Position;
  isbnImageSize: Size;
  frontPublisherLogoPosition: Position;
  frontPublisherLogoSize: Size;
  spinePublisherLogoPosition: Position;
  spinePublisherLogoSize: Size;
  backPublisherLogoPosition: Position;
  backPublisherLogoSize: Size;
  frontCoverBgType: FrontCoverBackgroundType;
  frontCoverImage: string | null;
  frontCoverBgColor1: string;
  frontCoverBgColor2: string;
  frontCoverBgAngle: number;
  spineBgType: BackgroundType;
  spineImage: string | null;
  spineBgColor1: string;
  spineBgColor2: string;
  spineBgAngle: number;
  backBgType: BackgroundType;
  backCoverImage: string | null;
  backBgColor1: string;
  backBgColor2: string;
  backBgAngle: number;

  // New text styling properties
  titleLineHeight: number;
  titleLetterSpacing: number;
  titleStrokeWidth: number;
  titleStrokeColor: string;
  titleShadowBlur: number;
  titleShadowColor: string;
  
  subtitleLineHeight: number;
  subtitleLetterSpacing: number;
  subtitleStrokeWidth: number;
  subtitleStrokeColor: string;
  subtitleShadowBlur: number;
  subtitleShadowColor: string;
  
  authorLineHeight: number;
  authorLetterSpacing: number;
  authorStrokeWidth: number;
  authorStrokeColor: string;
  authorShadowBlur: number;
  authorShadowColor: string;
  
  spineTitleLetterSpacing: number;
  spineAuthorLetterSpacing: number;
  
  backTextLineHeight: number;
  backTextLetterSpacing: number;
  backTextStrokeWidth: number;
  backTextStrokeColor: string;
  backTextShadowBlur: number;
  backTextShadowColor: string;

  // User-added text elements
  customTextElements: CustomTextElement[];

  // User-added image elements
  customImageElements: CustomImageElement[];

  // User-added fonts
  customFonts: CustomFont[];
}