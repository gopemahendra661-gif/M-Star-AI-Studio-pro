export enum GeneratorMode {
  AUTO = 'Auto Detect',
  ROAST = 'Roast',
  COMPLIMENT = 'Compliment',
  BIO = 'Bio',
  CAPTION = 'Caption',
  STATUS = 'Status',
  STYLISH_NAME = 'Stylish Name',
  HASHTAG = 'Hashtag'
}

export type Language = 'Hinglish' | 'Hindi' | 'English';

export interface GeneratedItem {
  text: string;
  category?: string;
}

export interface GenerationResponse {
  items: string[];
  detectedMode?: string;
}