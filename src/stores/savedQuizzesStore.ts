import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SavedQuiz } from '@/types/savedQuizTypes';

interface SavedQuizzesState {
  quizzes: SavedQuiz[];
  isLoading: boolean;
  error: string | null;
}

interface SavedQuizzesActions {
  loadSavedQuizzes: () => Promise<void>;
  saveQuiz: (quiz: SavedQuiz) => Promise<void>;
  deleteQuiz: (quizId: string) => Promise<void>;
  clearAllQuizzes: () => Promise<void>;
  getQuizById: (quizId: string) => SavedQuiz | undefined;
  markQuizAsCompleted: (quizId: string, completionDate: number, timeSpent: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

type SavedQuizzesStore = SavedQuizzesState & SavedQuizzesActions;

export const useSavedQuizzesStore = create<SavedQuizzesStore>()(
  persist(
    (set, get) => ({
      quizzes: [],
      isLoading: false,
      error: null,

      setLoading: loading => set({ isLoading: loading }),
      setError: error => set({ error }),

      loadSavedQuizzes: async () => {
        set({ isLoading: true, error: null });
        try {
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
          const existing = get().quizzes;
          const exists = existing.some(q => q.id === quiz.id);
          if (exists) {
            const updated = existing.map(q => (q.id === quiz.id ? quiz : q));
            set({ quizzes: updated });
          } else {
            set({ quizzes: [...existing, quiz] });
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
          const updated = get().quizzes.filter(q => q.id !== quizId);
          set({ quizzes: updated, isLoading: false });
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

      getQuizById: quizId => get().quizzes.find(q => q.id === quizId),

      markQuizAsCompleted: (quizId, completionDate, timeSpent) => {
        const updated = get().quizzes.map(q =>
          q.id === quizId ? { ...q, isCompleted: true, completionDate, timeSpent } : q
        );
        set({ quizzes: updated });
      },
    }),
    {
      name: 'saved-quizzes-storage',
      partialize: state => ({ quizzes: state.quizzes }),
    }
  )
);



