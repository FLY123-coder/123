import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  LearningRecord,
  LearningTrajectoryPoint,
  LearningRecommendation,
  ProgressState,
  ProgressActions,
} from './types';

export const getKnowledgePointId = (questionContent: string): string => {
  const content = questionContent.toLowerCase();
  if (content.includes('javascript') || content.includes('js')) {
    if (content.includes('function') || content.includes('函数'))
      return 'js-functions';
    if (content.includes('object') || content.includes('对象'))
      return 'js-objects';
    if (content.includes('async') || content.includes('异步'))
      return 'js-async';
    if (content.includes('array') || content.includes('数组'))
      return 'js-arrays';
    return 'js-basics';
  }
  if (content.includes('react')) {
    if (content.includes('hook') || content.includes('钩子'))
      return 'react-hooks';
    if (content.includes('component') || content.includes('组件'))
      return 'react-components';
    return 'react-basics';
  }
  if (content.includes('css')) {
    if (content.includes('layout') || content.includes('布局'))
      return 'css-layout';
    if (content.includes('animation') || content.includes('动画'))
      return 'css-animation';
    return 'css-basics';
  }
  if (content.includes('html')) return 'html-basics';
  if (content.includes('algorithm') || content.includes('算法'))
    return 'algorithms';
  if (content.includes('typescript') || content.includes('ts'))
    return 'typescript';
  return 'general';
};

const getKnowledgePointName = (id: string): string => {
  const nameMap: Record<string, string> = {
    'js-basics': 'JavaScript基础',
    'js-functions': 'JavaScript函数',
    'js-objects': 'JavaScript对象',
    'js-async': 'JavaScript异步',
    'js-arrays': 'JavaScript数组',
    'react-basics': 'React基础',
    'react-hooks': 'React Hooks',
    'react-components': 'React组件',
    'css-basics': 'CSS基础',
    'css-layout': 'CSS布局',
    'css-animation': 'CSS动画',
    'html-basics': 'HTML基础',
    algorithms: '算法与数据结构',
    typescript: 'TypeScript',
    general: '通用知识',
  };
  return nameMap[id] || '未知知识点';
};

export const useChengguo1ProgressStore = create<
  ProgressState & ProgressActions
>()(
  persist(
    (set, get) => ({
      learningRecords: [],
      knowledgeMastery: {},
      learningTrajectory: [],
      statistics: {
        totalStudyTime: 0,
        totalQuestionsAnswered: 0,
        averageScore: 0,
        masteredKnowledgePoints: 0,
        learningDays: 0,
        currentStreak: 0,
        longestStreak: 0,
        improvementRate: 0,
      },
      recommendations: [],
      isLoading: false,
      error: null,

      addLearningRecord: (record: LearningRecord) => {
        set(state => ({
          ...state,
          learningRecords: [...state.learningRecords, record],
        }));
        get().updateKnowledgeMastery(record.knowledgePointId, record);
        get().calculateStatistics();
        get().generateRecommendations();
      },

      updateLearningRecord: (id, updates) => {
        set(state => ({
          ...state,
          learningRecords: state.learningRecords.map(record =>
            record.id === id ? { ...record, ...updates } : record
          ),
        }));
      },

      getLearningRecords: (filters = {}) => {
        const records = get().learningRecords;
        if (Object.keys(filters).length === 0) return records;

        return records.filter(record => {
          return Object.entries(filters).every(([key, value]) => {
            if (key === 'knowledgePointId')
              return record.knowledgePointId === value;
            if (key === 'dateRange') {
              const { start, end } = value as { start: number; end: number };
              return record.timestamp >= start && record.timestamp <= end;
            }
            return true;
          });
        });
      },

      updateKnowledgeMastery: (knowledgePointId, record) => {
        set(state => {
          const existing = state.knowledgeMastery[knowledgePointId];
          const totalAttempts = (existing?.totalAttempts || 0) + 1;
          const correctAttempts =
            (existing?.correctAttempts || 0) + (record.isCorrect ? 1 : 0);
          const totalScore =
            (existing?.averageScore || 0) * (existing?.totalAttempts || 0) +
            record.score;
          const averageScore = totalScore / totalAttempts;
          const masteryLevel = Math.min(
            100,
            Math.round(
              (correctAttempts / totalAttempts) * 100 * 0.7 +
                (averageScore / record.maxScore) * 100 * 0.3
            )
          );

          return {
            ...state,
            knowledgeMastery: {
              ...state.knowledgeMastery,
              [knowledgePointId]: {
                knowledgePointId,
                name: getKnowledgePointName(knowledgePointId),
                masteryLevel,
                totalAttempts,
                correctAttempts,
                averageScore,
                lastStudied: new Date(record.timestamp).toISOString(),
                studyTime: (existing?.studyTime || 0) + record.timeSpent,
              },
            },
          };
        });
      },

      getKnowledgeMastery: knowledgePointId => {
        const mastery = get().knowledgeMastery;
        return knowledgePointId ? mastery[knowledgePointId] : mastery;
      },

      calculateStatistics: () => {
        const records = get().learningRecords;
        if (records.length === 0) return;

        const totalStudyTime = records.reduce((sum, r) => sum + r.timeSpent, 0);
        const totalQuestionsAnswered = records.length;
        const averageScore =
          records.reduce((sum, r) => sum + (r.score / r.maxScore) * 100, 0) /
          records.length;
        const masteredKnowledgePoints = Object.values(
          get().knowledgeMastery
        ).filter(m => m.masteryLevel >= 80).length;

        const uniqueDays = new Set(
          records.map(r => new Date(r.timestamp).toDateString())
        );
        const learningDays = uniqueDays.size;

        const { currentStreak, longestStreak } = calculateStreaks(records);
        const improvementRate = calculateImprovementRate(records);

        set(state => ({
          ...state,
          statistics: {
            totalStudyTime,
            totalQuestionsAnswered,
            averageScore: Math.round(averageScore),
            masteredKnowledgePoints,
            learningDays,
            currentStreak,
            longestStreak,
            improvementRate,
          },
        }));
      },

      getLearningTrajectory: (days = 30) => {
        const records = get().learningRecords;
        const endDate = new Date();
        const startDate = new Date(
          endDate.getTime() - days * 24 * 60 * 60 * 1000
        );

        const dailyData = new Map<
          string,
          {
            studyTime: number;
            questionsAnswered: number;
            totalScore: number;
            knowledgePoints: Set<string>;
          }
        >();

        records
          .filter(r => r.timestamp >= startDate.getTime())
          .forEach(record => {
            const date = new Date(record.timestamp).toISOString().split('T')[0];
            const existing = dailyData.get(date) || {
              studyTime: 0,
              questionsAnswered: 0,
              totalScore: 0,
              knowledgePoints: new Set(),
            };

            existing.studyTime += record.timeSpent;
            existing.questionsAnswered += 1;
            existing.totalScore += (record.score / record.maxScore) * 100;
            existing.knowledgePoints.add(record.knowledgePointId);

            dailyData.set(date, existing);
          });

        const trajectory: LearningTrajectoryPoint[] = [];
        for (
          let d = new Date(startDate);
          d <= endDate;
          d.setDate(d.getDate() + 1)
        ) {
          const dateStr = d.toISOString().split('T')[0];
          const data = dailyData.get(dateStr);

          trajectory.push({
            date: dateStr,
            studyTime: data?.studyTime || 0,
            questionsAnswered: data?.questionsAnswered || 0,
            averageScore: data
              ? Math.round(data.totalScore / data.questionsAnswered) || 0
              : 0,
            knowledgePoints: data ? Array.from(data.knowledgePoints) : [],
          });
        }

        set(state => ({ ...state, learningTrajectory: trajectory }));
        return trajectory;
      },

      generateRecommendations: () => {
        const mastery = get().knowledgeMastery;
        const records = get().learningRecords;
        const recommendations: LearningRecommendation[] = [];

        // 基于掌握度生成建议
        Object.values(mastery).forEach(m => {
          if (m.masteryLevel < 60) {
            recommendations.push({
              id: `improve-${m.knowledgePointId}`,
              title: `加强 ${m.name} 练习`,
              description: `您在 ${m.name} 方面的掌握度为 ${m.masteryLevel}%，建议多做相关练习题。`,
              type: 'knowledge_point',
              priority: m.masteryLevel < 40 ? 'high' : 'medium',
              isCompleted: false,
              relatedKnowledgePointId: m.knowledgePointId,
              targetScore: 80,
              createdAt: new Date().toISOString(),
            });
          }
        });

        // 基于学习时间生成建议
        const recentRecords = records.slice(-10);
        const avgStudyTime =
          recentRecords.reduce((sum, r) => sum + r.timeSpent, 0) /
          recentRecords.length;

        if (avgStudyTime < 300) {
          // 少于5分钟
          recommendations.push({
            id: 'increase-study-time',
            title: '增加学习时间',
            description: '建议每次学习时间不少于10分钟，以提高学习效果。',
            type: 'study_plan',
            priority: 'medium',
            isCompleted: false,
            createdAt: new Date().toISOString(),
          });
        }

        set(state => ({ ...state, recommendations }));
      },

      generateAnalysisReport: (days = 30) => {
        const trajectory = get().getLearningTrajectory(days);
        const statistics = get().statistics;
        const mastery = Object.values(get().knowledgeMastery);
        const recommendations = get().recommendations;

        return {
          period: `最近${days}天`,
          summary: statistics,
          trajectory,
          mastery,
          recommendations,
        };
      },

      setLoading: loading => set(state => ({ ...state, isLoading: loading })),
      setError: error => set(state => ({ ...state, error })),

      generateMockData: () => {
        const mockRecords: LearningRecord[] = [];
        const knowledgePoints = [
          'js-basics',
          'react-hooks',
          'css-layout',
          'algorithms',
        ];

        for (let i = 0; i < 50; i++) {
          const timestamp =
            Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000;
          const kpId =
            knowledgePoints[Math.floor(Math.random() * knowledgePoints.length)];
          const score = Math.floor(Math.random() * 100);

          mockRecords.push({
            id: `mock-${i}`,
            userId: 'user-1',
            knowledgePointId: kpId,
            questionId: `q-${i}`,
            quizId: `quiz-${Math.floor(i / 5)}`,
            score,
            maxScore: 100,
            timeSpent: Math.floor(Math.random() * 600) + 60,
            timestamp,
            isCorrect: score >= 60,
            attempts: 1,
          });
        }

        set(state => ({ ...state, learningRecords: mockRecords }));

        mockRecords.forEach(record => {
          get().updateKnowledgeMastery(record.knowledgePointId, record);
        });

        get().calculateStatistics();
        get().generateRecommendations();
      },

      resetProgress: () => {
        set({
          learningRecords: [],
          knowledgeMastery: {},
          learningTrajectory: [],
          statistics: {
            totalStudyTime: 0,
            totalQuestionsAnswered: 0,
            averageScore: 0,
            masteredKnowledgePoints: 0,
            learningDays: 0,
            currentStreak: 0,
            longestStreak: 0,
            improvementRate: 0,
          },
          recommendations: [],
          isLoading: false,
          error: null,
        });
      },
    }),
    {
      name: 'chengguo1-progress-storage',
      version: 1,
    }
  )
);

// 辅助函数
const calculateStreaks = (records: LearningRecord[]) => {
  if (records.length === 0) return { currentStreak: 0, longestStreak: 0 };

  const sortedRecords = [...records].sort((a, b) => a.timestamp - b.timestamp);
  const uniqueDays = Array.from(
    new Set(sortedRecords.map(r => new Date(r.timestamp).toDateString()))
  ).sort();

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 1;

  for (let i = 1; i < uniqueDays.length; i++) {
    const prevDate = new Date(uniqueDays[i - 1]);
    const currDate = new Date(uniqueDays[i]);
    const daysDiff = Math.floor(
      (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }

  longestStreak = Math.max(longestStreak, tempStreak);

  // 计算当前连续天数
  const today = new Date().toDateString();
  const lastStudyDay = uniqueDays[uniqueDays.length - 1];

  if (lastStudyDay === today) {
    currentStreak = tempStreak;
  } else {
    const daysSinceLastStudy = Math.floor(
      (new Date(today).getTime() - new Date(lastStudyDay).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    currentStreak = daysSinceLastStudy <= 1 ? tempStreak : 0;
  }

  return { currentStreak, longestStreak };
};

const calculateImprovementRate = (records: LearningRecord[]) => {
  if (records.length < 10) return 0;

  const sortedRecords = [...records].sort((a, b) => a.timestamp - b.timestamp);
  const firstHalf = sortedRecords.slice(
    0,
    Math.floor(sortedRecords.length / 2)
  );
  const secondHalf = sortedRecords.slice(Math.floor(sortedRecords.length / 2));

  const firstHalfAvg =
    firstHalf.reduce((sum, r) => sum + (r.score / r.maxScore) * 100, 0) /
    firstHalf.length;
  const secondHalfAvg =
    secondHalf.reduce((sum, r) => sum + (r.score / r.maxScore) * 100, 0) /
    secondHalf.length;

  return firstHalfAvg > 0
    ? Math.round(((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100)
    : 0;
};
