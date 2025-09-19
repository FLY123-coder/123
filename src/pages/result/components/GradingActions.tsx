import React from 'react';
import { Download } from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { useSavedQuizzesStore } from '@/stores/savedQuizzesStore';
import { exportQuiz } from '@/utils/exportUtils';
import type { SavedQuiz } from '@/types/savedQuizTypes';

interface Props {
  onPrint: () => void;
  onReset: () => void;
}

/**
 * 批改结果操作按钮组件
 * 提供打印结果和重新开始按钮
 */
export const GradingActions: React.FC<Props> = ({ onPrint, onReset }) => {
  const { generation } = useAppStore();
  const { saveQuiz } = useSavedQuizzesStore();
  return (
    <div className='flex justify-between items-center mb-6'>
      <h2 className='text-2xl font-bold text-gray-900'>详细解析</h2>
      <div className='flex gap-3'>
        <button
          onClick={onPrint}
          className='px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50'
        >
          打印结果
        </button>
        <button
          onClick={async () => {
            if (!generation.currentQuiz) return;
            const quiz: SavedQuiz = {
              ...generation.currentQuiz,
              savedAt: Date.now(),
            } as SavedQuiz;
            await saveQuiz(quiz);
            await exportQuiz(quiz, 'pdf');
          }}
          className='px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2'
        >
          <Download size={18} /> 导出PDF
        </button>
        <button
          onClick={onReset}
          className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
        >
          重新开始
        </button>
      </div>
    </div>
  );
};
