/**
 * 保存试卷状态管理
 * 管理用户保存的试卷列表、删除、导出等功能
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SavedQuiz } from '@/types';

interface SavedQuizzesState {
  quizzes: SavedQuiz[];
  isLoading: boolean;
  error: string | null;
}

interface SavedQuizzesActions {
  // 加载保存的试卷列表
  loadSavedQuizzes: () => Promise<void>;

  // 保存试卷
  saveQuiz: (quiz: SavedQuiz) => Promise<void>;

  // 删除试卷
  deleteQuiz: (quizId: string) => Promise<void>;

  // 清空所有试卷
  clearAllQuizzes: () => Promise<void>;

  // 获取特定试卷
  getQuizById: (quizId: string) => SavedQuiz | undefined;

  // 更新试卷完成状态
  markQuizAsCompleted: (
    quizId: string,
    completionDate: number,
    timeSpent: number
  ) => void;

  // 设置加载状态
  setLoading: (loading: boolean) => void;

  // 设置错误信息
  setError: (error: string | null) => void;
}

type SavedQuizzesStore = SavedQuizzesState & SavedQuizzesActions;

const useSavedQuizzesStore = create<SavedQuizzesStore>()(
  persist(
    (set, get) => ({
      // 初始状态
      quizzes: [],
      isLoading: false,
      error: null,

      // Actions
      setLoading: loading => set({ isLoading: loading }),

      setError: error => set({ error }),

      loadSavedQuizzes: async () => {
        set({ isLoading: true, error: null });
        try {
          // 从localStorage获取保存的试卷
          // 实际实现中，这里可以从localStorage或其他存储方式获取数据
          // 在这个例子中，数据已经在store中
          set({ isLoading: false });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : '加载试卷失败',
          });
        }
      },

      saveQuiz: async quiz => {
        set({ isLoading: true, error: null });
        try {
          const existingQuizzes = get().quizzes;
          const quizExists = existingQuizzes.some(q => q.id === quiz.id);

          if (quizExists) {
            // 更新已存在的试卷
            const updatedQuizzes = existingQuizzes.map(q =>
              q.id === quiz.id ? quiz : q
            );
            set({ quizzes: updatedQuizzes });
          } else {
            // 添加新试卷
            set({ quizzes: [...existingQuizzes, quiz] });
          }

          set({ isLoading: false });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : '保存试卷失败',
          });
        }
      },

      deleteQuiz: async quizId => {
        set({ isLoading: true, error: null });
        try {
          const existingQuizzes = get().quizzes;
          const updatedQuizzes = existingQuizzes.filter(q => q.id !== quizId);
          set({ quizzes: updatedQuizzes, isLoading: false });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : '删除试卷失败',
          });
        }
      },

      clearAllQuizzes: async () => {
        set({ isLoading: true, error: null });
        try {
          set({ quizzes: [], isLoading: false });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : '清空试卷失败',
          });
        }
      },

      getQuizById: quizId => {
        return get().quizzes.find(q => q.id === quizId);
      },

      markQuizAsCompleted: (quizId, completionDate, timeSpent) => {
        const existingQuizzes = get().quizzes;
        const updatedQuizzes = existingQuizzes.map(q =>
          q.id === quizId
            ? { ...q, isCompleted: true, completionDate, timeSpent }
            : q
        );
        set({ quizzes: updatedQuizzes });
      },
    }),
    {
      name: 'saved-quizzes-storage', // localStorage key
      partialize: state => ({ quizzes: state.quizzes }), // 只持久化quizzes
    }
  )
);

export { useSavedQuizzesStore, type SavedQuizzesStore };
