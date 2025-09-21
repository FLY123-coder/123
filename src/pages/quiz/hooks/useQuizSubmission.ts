import { useAppStore } from '@/stores/useAppStore';
import { useLocalProgressStore, getKnowledgePointId } from '@/stores/progressStore';
import { useTimeRecorderStore } from '@/stores/timeRecorderStore';
import type { Question } from '@/types';
import type { Quiz } from '@/types';

/**
 * 答题提交钩子
 * 处理答案更新和试卷提交逻辑
 */
export function useQuizSubmission() {
  const { updateUserAnswer, submitQuiz, startGrading, answering } =
    useAppStore();
  const progress = useLocalProgressStore();
  const { endAnswering } = useTimeRecorderStore();

  /**
   * 更新用户答案
   * @param questionId 题目ID
   * @param answer 用户答案
   */
  const handleAnswerChange = (questionId: string, answer: unknown) => {
    updateUserAnswer(questionId, answer);
  };

  /**
   * 提交试卷
   * @param quiz 当前试卷
   * @returns 是否成功提交
   */
  const handleSubmitQuiz = async (quiz: Quiz) => {
    // 检查未答题目
    const unansweredQuestions = quiz.questions.filter(q => {
      switch (q.type) {
        case 'single-choice':
          return q.userAnswer === undefined;
        case 'multiple-choice':
          return !q.userAnswer || q.userAnswer.length === 0;
        case 'fill-blank':
          return !q.userAnswer || q.userAnswer.some(answer => !answer?.trim());
        case 'short-answer':
        case 'code-output':
        case 'code-writing':
          return !q.userAnswer?.trim();
        default:
          return true;
      }
    });

    // 如果有未答题目，提示用户确认
    if (unansweredQuestions.length > 0) {
      const confirmSubmit = window.confirm(
        `还有 ${unansweredQuestions.length} 道题未完成，确定要提交吗？`
      );
      if (!confirmSubmit) return false;
    }

    // 结束答题计时，提交试卷并开始批改
    endAnswering();
    await submitQuiz();
    await startGrading();

    // 写入学习记录（简化：依据是否与正确答案匹配评估 isCorrect 与分数），并立即刷新统计与建议
    try {
      const now = Date.now();
      const durationsMs = useTimeRecorderStore.getState().questionDurations || {};
      quiz.questions.forEach((q: Question, idx: number) => {
        const content = 'question' in q ? q.question : '';
        const kpId = getKnowledgePointId(content || '');
        let isCorrect = false;
        let score = 0;
        if (q.type === 'single-choice') {
          isCorrect = q.userAnswer === q.correctAnswer;
          score = isCorrect ? 100 : 0;
        } else if (q.type === 'multiple-choice') {
          const ua = q.userAnswer || [];
          isCorrect = ua.length === q.correctAnswers.length && ua.every(v => q.correctAnswers.includes(v));
          score = isCorrect ? 100 : Math.round((ua.filter(v => q.correctAnswers.includes(v)).length / q.correctAnswers.length) * 100);
        } else if (q.type === 'fill-blank') {
          const ua = q.userAnswer || [];
          const correctCount = ua.filter((v, i) => v && v.trim() === q.correctAnswers[i]).length;
          isCorrect = correctCount === q.correctAnswers.length;
          score = Math.round((correctCount / q.correctAnswers.length) * 100);
        } else if (q.type === 'short-answer' || q.type === 'code-output' || q.type === 'code-writing') {
          isCorrect = !!(q as any).userAnswer && (q as any).userAnswer.toString().trim().length > 0;
          score = isCorrect ? 60 : 0; // 主观题此处给基础分，真实项目用批改结果
        }
        // chengguo 进度系统以“秒”为单位存储 timeSpent，统计处会 /60 转成分钟
        const timeSpentSec = Math.max(1, Math.round((((durationsMs as any)[q.id] || 0)) / 1000));
        progress.addLearningRecord({
          id: `${quiz.id}-${q.id}`,
          userId: 'user-1',
          knowledgePointId: kpId,
          questionId: q.id,
          quizId: quiz.id,
          score,
          maxScore: 100,
          timeSpent: timeSpentSec,
          timestamp: now + idx,
          isCorrect,
          attempts: 1,
        });
      });
      progress.calculateStatistics();
      progress.generateRecommendations();
    } catch (e) {
      // 忽略学习记录写入失败
      console.warn('写入学习记录失败', e);
    }
    return true;
  };

  return {
    handleAnswerChange,
    handleSubmitQuiz,
    isSubmitted: answering.isSubmitted,
  };
}