// ================================
// 试卷保存功能相关类型定义
// ================================

import type { Quiz } from './index';

/**
 * 保存的试卷信息
 * 与原始Quiz的区别：
 * - 添加了保存时间
 * - 添加了完成状态
 * - 可能包含用户的答题记录
 */
export interface SavedQuiz extends Quiz {
  savedAt: number; // 保存时间戳
  isCompleted?: boolean; // 是否已完成（提交过）
  completionDate?: number; // 完成时间戳
  timeSpent?: number; // 花费时间（毫秒）
}

/**
 * 用户答题记录
 * 记录用户在某个试卷中的答题情况
 */
export interface UserAnswerRecord {
  quizId: string; // 试卷ID
  questionId: string; // 题目ID
  answer: unknown; // 用户答案（不同类型题目答案格式不同）
  answeredAt: number; // 答题时间
  timeSpent?: number; // 本题花费时间
}

/**
 * 导出格式枚举
 */
export enum ExportFormat {
  PDF = 'pdf',
  WORD = 'word',
  JSON = 'json',
}

/**
 * 导出选项
 */
export interface ExportOptions {
  format: ExportFormat;
  includeAnswers?: boolean; // 是否包含答案
  includeUserAnswers?: boolean; // 是否包含用户答案
  includeGrading?: boolean; // 是否包含批改结果
}
