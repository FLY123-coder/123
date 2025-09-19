import React, { useState } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { useSavedQuizzesStore } from '@/stores/savedQuizzesStore';
import { useGradingStatus } from './hooks';
import type { SavedQuiz } from '@/types';
import {
  GradingHeader,
  GradingStats,
  GradingActions,
  QuestionResult,
  LearningAdvice,
  GradingLoading,
  EmptyResultState,
} from './components';

/**
 * 批改结果页面
 * 显示AI批改结果和详细解析
 */
export const ResultPage: React.FC = () => {
  // 全局状态
  const { generation, grading, resetApp } = useAppStore();
  const quiz = generation.currentQuiz;
  const result = grading.result;

  // 保存试卷状态
  const { saveQuiz, isLoading: isSaving } = useSavedQuizzesStore();
  const [, setIsSaved] = useState(false);

  // 批改状态
  const {
    scorePercentage,
    scoreLevel,
    scoreColor,
    correctCount,
    partialCount,
    wrongCount,
  } = useGradingStatus(result);

  // 处理打印结果
  const handlePrint = () => {
    window.print();
  };

  // 处理保存试卷
  const handleSaveQuiz = async () => {
    if (!quiz || isSaving) return;

    try {
      // 创建保存的试卷对象
      const savedQuiz: SavedQuiz = {
        ...quiz,
        savedAt: Date.now(),
        isCompleted: true,
        completionDate: Date.now(),
      };

      await saveQuiz(savedQuiz);
      setIsSaved(true);

      // 显示保存成功的提示
      alert('试卷保存成功！');
    } catch (error) {
      console.error('保存试卷失败:', error);
      alert('保存试卷失败，请重试');
    }
  };

  // 如果正在批改，显示加载状态
  if (grading.status === 'grading') {
    return <GradingLoading />;
  }

  // 如果没有试卷或批改结果，显示空状态
  if (!quiz || !result) {
    return <EmptyResultState onReset={resetApp} />;
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* 顶部成绩概览 */}
      <GradingHeader
        result={result}
        scorePercentage={scorePercentage}
        scoreLevel={scoreLevel}
        scoreColor={scoreColor}
      />

      <div className='max-w-6xl mx-auto px-4 py-8'>
        {/* 操作按钮 */}
        <GradingActions
          onPrint={handlePrint}
          onReset={resetApp}
          onSave={handleSaveQuiz}
          isSaving={isSaving}
        />

        {/* 成绩统计 */}
        <GradingStats
          totalQuestions={quiz.questions.length}
          correctCount={correctCount}
          partialCount={partialCount}
          wrongCount={wrongCount}
        />

        {/* 题目详细解析 */}
        <div className='space-y-6'>
          {quiz.questions.map((question, index) => {
            const questionResult = result.results.find(
              r => r.questionId === question.id
            );
            if (!questionResult) return null;

            return (
              <QuestionResult
                key={question.id}
                question={question}
                questionIndex={index}
                score={questionResult.score}
                feedback={questionResult.feedback}
              />
            );
          })}
        </div>

        {/* 总结建议 */}
        <LearningAdvice scorePercentage={scorePercentage} />
      </div>
    </div>
  );
};
