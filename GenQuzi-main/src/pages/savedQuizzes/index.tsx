import React, { useEffect, useState } from 'react';
import { useSavedQuizzesStore } from '@/stores/savedQuizzesStore';
import { useAppStore } from '@/stores/useAppStore';
import type { SavedQuiz } from '@/types';
import { exportQuiz } from '@/utils/exportUtils';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Trash2, FileText, Download, RotateCcw, ArrowLeft } from 'lucide-react';

/**
 * 历史试卷管理页面
 * 显示用户保存的所有试卷列表，支持查看、删除、导出等功能
 */
export const SavedQuizzesPage: React.FC = () => {
  const { quizzes, loadSavedQuizzes, deleteQuiz, isLoading, error } =
    useSavedQuizzesStore();
  const { setCurrentQuiz, setShowSavedQuizzes } = useAppStore();
  const [selectedQuiz, setSelectedQuiz] = useState<SavedQuiz | null>(null);
  const [showExportMenu, setShowExportMenu] = useState<string | null>(null);

  // 加载保存的试卷
  useEffect(() => {
    loadSavedQuizzes();
  }, [loadSavedQuizzes]);

  // 点击外部关闭导出菜单
  useEffect(() => {
    const handleClickOutside = () => {
      setShowExportMenu(null);
    };

    if (showExportMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showExportMenu]);

  // 处理删除试卷
  const handleDeleteQuiz = async (quizId: string, quizTitle: string) => {
    if (window.confirm(`确定要删除试卷"${quizTitle}"吗？`)) {
      try {
        await deleteQuiz(quizId);
        // 如果删除的是当前选中的试卷，取消选中
        if (selectedQuiz?.id === quizId) {
          setSelectedQuiz(null);
        }
      } catch (error) {
        console.error('删除试卷失败:', error);
        alert('删除试卷失败，请重试');
      }
    }
  };

  // 处理重新开始试卷
  const handleRestartQuiz = (quiz: SavedQuiz) => {
    // 设置应用状态为该试卷并开始答题
    setCurrentQuiz(quiz);
  };

  // 处理导出试卷
  const handleExportQuiz = async (
    quiz: SavedQuiz,
    format: 'pdf' | 'word' | 'json'
  ) => {
    try {
      console.log('开始导出试卷:', quiz.title, '格式:', format);
      await exportQuiz(quiz, format);
      console.log('导出成功');
      setShowExportMenu(null); // 关闭菜单
    } catch (error) {
      console.error('导出试卷失败:', error);
      alert(
        `导出试卷失败: ${error instanceof Error ? error.message : '未知错误'}`
      );
    }
  };

  // 格式化日期
  const formatDate = (timestamp: number) => {
    return format(new Date(timestamp), 'yyyy年MM月dd日 HH:mm', {
      locale: zhCN,
    });
  };

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-6xl mx-auto px-4'>
        <div className='bg-white rounded-lg shadow-lg overflow-hidden'>
          {/* 页面头部 */}
          <div className='bg-white px-8 py-6 border-b border-gray-200'>
            <div className='flex items-center justify-between'>
              <div>
                <h1 className='text-3xl font-bold text-gray-800 mb-2'>
                  历史试卷
                </h1>
                <p className='text-gray-500'>管理您保存的试卷</p>
              </div>
              <button
                onClick={() => setShowSavedQuizzes(false)}
                className='inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
              >
                <ArrowLeft className='mr-2 h-4 w-4' />
                返回主页
              </button>
            </div>
          </div>

          {/* 内容区域 */}
          <div className='p-8'>
            {error && (
              <div className='mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg'>
                {error}
              </div>
            )}

            {isLoading ? (
              <div className='flex justify-center items-center h-64'>
                <div className='text-gray-500'>加载中...</div>
              </div>
            ) : quizzes.length === 0 ? (
              <div className='text-center py-12'>
                <FileText className='mx-auto h-12 w-12 text-gray-400' />
                <h3 className='mt-2 text-sm font-medium text-gray-900'>
                  暂无保存的试卷
                </h3>
                <p className='mt-1 text-sm text-gray-500'>
                  开始生成试卷后会自动保存到这里
                </p>
              </div>
            ) : (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {quizzes.map(quiz => (
                  <div
                    key={quiz.id}
                    className={`bg-white border rounded-lg shadow-sm overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                      selectedQuiz?.id === quiz.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedQuiz(quiz)}
                  >
                    <div className='p-6'>
                      <div className='flex justify-between items-start'>
                        <div>
                          <h3 className='text-lg font-medium text-gray-900 line-clamp-2'>
                            {quiz.title}
                          </h3>
                          <p className='mt-1 text-sm text-gray-500'>
                            {quiz.questions.length} 题
                          </p>
                        </div>
                        {quiz.isCompleted && (
                          <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                            已完成
                          </span>
                        )}
                      </div>

                      <div className='mt-4 flex items-center text-sm text-gray-500'>
                        <span>保存于 {formatDate(quiz.savedAt)}</span>
                      </div>

                      {quiz.completionDate && (
                        <div className='mt-2 flex items-center text-sm text-gray-500'>
                          <span>完成于 {formatDate(quiz.completionDate)}</span>
                        </div>
                      )}

                      <div className='mt-4 flex justify-between'>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleRestartQuiz(quiz);
                          }}
                          className='inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50'
                        >
                          <RotateCcw className='mr-1 h-4 w-4' />
                          重新开始
                        </button>
                        <div className='flex space-x-2'>
                          <div className='relative'>
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                setShowExportMenu(
                                  showExportMenu === quiz.id ? null : quiz.id
                                );
                              }}
                              className='inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50'
                            >
                              <Download className='mr-1 h-4 w-4' />
                              导出
                            </button>
                            {showExportMenu === quiz.id && (
                              <div className='absolute right-0 bottom-full mb-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-50'>
                                <button
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleExportQuiz(quiz, 'pdf');
                                  }}
                                  className='block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-md'
                                >
                                  PDF格式
                                </button>
                                <button
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleExportQuiz(quiz, 'word');
                                  }}
                                  className='block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                                >
                                  Word格式
                                </button>
                                <button
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleExportQuiz(quiz, 'json');
                                  }}
                                  className='block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-b-md'
                                >
                                  JSON格式
                                </button>
                              </div>
                            )}
                          </div>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handleDeleteQuiz(quiz.id, quiz.title);
                            }}
                            className='inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100'
                          >
                            <Trash2 className='mr-1 h-4 w-4' />
                            删除
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
