export type DisplayType = 'standard' | 'metric' | 'progress';

export interface ProjectStats {
  value?: string | number;
  label?: string;
  unit?: string;
  maxValue?: number; // For progress bars
}

export interface Project {
  id?: string;
  title: string;
  author: string;
  description: string;
  category: string;
  imageUrl: string;
  link: string;
  createdAt?: number;
  
  // New fields for diverse analysis formats
  displayType: DisplayType;
  stats?: ProjectStats;
}

export interface CategoryCount {
  name: string;
  count: number;
}