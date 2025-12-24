
export enum View {
  HOME = 'home',
  CONVERT = 'convert',
  GENERATE = 'generate',
  EDIT = 'edit',
  ANALYZE = 'analyze',
  ARCHIVE = 'archive',
  ASSISTANT = 'assistant'
}

export type AspectRatio = '1:1' | '3:4' | '4:3' | '9:16' | '16:9';
export type ImageSize = '1K' | '2K' | '4K';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  picture: string;
  isGuest: boolean;
}

export interface ForensicResult {
  id: string;
  timestamp: number;
  type: 'generation' | 'edit' | 'analysis';
  data: string; // Base64 or text result
  prompt?: string;
  isWatermarked?: boolean;
}

export interface MetadataInfo {
  filename: string;
  size: string;
  dimensions: string;
  type: string;
  lastModified: string;
}

export interface ExifData {
  make?: string;
  model?: string;
  exposureTime?: string;
  fNumber?: string;
  iso?: string;
  dateTime?: string;
  software?: string;
  focalLength?: string;
  gps?: {
    latitude?: string;
    longitude?: string;
  };
}
