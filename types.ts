
export enum GeneratorMode {
  AUTO = 'Auto Detect',
  ROAST = 'Roast',
  COMPLIMENT = 'Compliment',
  SHAYARI = 'Shayari',
  QUOTES = 'Quotes',
  BIO = 'Bio',
  CAPTION = 'Caption',
  STATUS = 'Status',
  STYLISH_NAME = 'Stylish Name',
  HASHTAG = 'Hashtag',
  SCRIPT = 'Script Writing',
  DESCRIPTION = 'Description Writing',
  TITLE = 'Title Generator'
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
