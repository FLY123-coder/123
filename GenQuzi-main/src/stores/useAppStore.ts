import { create } from 'zustand';
import type { AppState, SavedQuiz } from '@/types';
import {
  createGenerationActions,
  type GenerationActions,
  type GenerationState,
} from './generationActions';
import {
  createAnsweringActions,
  type AnsweringActions,
} from './answeringActions';
import { createGradingActions, type GradingActions } from './gradingActions';

/**
 * 应用主状态管理store
 * 管理题目生成、答题和批改的全流程状态
 */
interface AppStore extends GenerationActions, AnsweringActions, GradingActions {
  generation: GenerationState;
  answering: AppState['answering'];
  grading: AppState['grading'];
  showSavedQuizzes: boolean; // 是否显示历史试卷页面

  // 全局重置
  resetApp: () => void;

  // 显示/隐藏历史试卷页面
  setShowSavedQuizzes: (show: boolean) => void;

  // 设置当前试卷并开始答题
  setCurrentQuiz: (quiz: SavedQuiz) => void;

  // 索引签名以兼容类型系统
  [key: string]: unknown;
}

export const useAppStore = create<AppStore>((set, get) => ({
  // 初始状态
  generation: {
    status: 'idle',
    currentQuiz: null,
    error: null,
  },
  answering: {
    currentQuestionIndex: 0,
    isSubmitted: false,
  },
  grading: {
    status: 'idle',
    result: null,
    error: null,
  },
  showSavedQuizzes: false,

  // 合并模块化的actions
  ...createGenerationActions(set),
  ...createAnsweringActions(set, get),
  ...createGradingActions(set, get),

  // 重置整个应用状态
  resetApp: () => {
    set(() => ({
      generation: {
        status: 'idle',
        currentQuiz: null,
        error: null,
      },
      answering: {
        currentQuestionIndex: 0,
        isSubmitted: false,
      },
      grading: {
        status: 'idle',
        result: null,
        error: null,
      },
      showSavedQuizzes: false,
    }));
  },

  // 显示/隐藏历史试卷页面
  setShowSavedQuizzes: show => set({ showSavedQuizzes: show }),

  // 设置当前试卷并开始答题
  setCurrentQuiz: quiz =>
    set({
      generation: {
        status: 'complete',
        currentQuiz: quiz,
        error: null,
      },
      answering: {
        currentQuestionIndex: 0,
        isSubmitted: false,
      },
      grading: {
        status: 'idle',
        result: null,
        error: null,
      },
      showSavedQuizzes: false,
    }),
}));
