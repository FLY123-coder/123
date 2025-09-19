import type { Quiz } from './index';

export interface SavedQuiz extends Quiz {
  savedAt: number;
  isCompleted?: boolean;
  completionDate?: number;
  timeSpent?: number;
}

export enum ExportFormat {
  PDF = 'pdf',
  WORD = 'word',
  JSON = 'json',
}

export interface ExportOptions {
  format: ExportFormat;
  includeAnswers?: boolean;
  includeUserAnswers?: boolean;
  includeGrading?: boolean;
}



