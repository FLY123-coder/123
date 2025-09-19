import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  LearningRecord,
  KnowledgeMastery,
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

export const useLocalProgressStore = create<ProgressState & ProgressActions>()(
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
          learningRecords: state.learningRecords.map(r =>
            r.id === id ? { ...r, ...updates } : r
          ),
        }));
        get().calculateStatistics();
      },

      getLearningRecords: (filters: Record<string, unknown> = {}) => {
        const { learningRecords } = get();
        return learningRecords.filter(record =>
          Object.entries(filters).every(([k, v]) =>
            v === undefined || v === null
              ? true
              : (record as Record<string, unknown>)[k] === v
          )
        );
      },

      updateKnowledgeMastery: (knowledgePointId, record) => {
        set(state => {
          const current = state.knowledgeMastery[knowledgePointId];
          if (!current) {
            const created: KnowledgeMastery = {
              knowledgePointId,
              name: getKnowledgePointName(knowledgePointId),
              masteryLevel: record.isCorrect ? 20 : 5,
              lastAttempt: record.timestamp,
              totalAttempts: 1,
              correctAttempts: record.isCorrect ? 1 : 0,
              averageScore: record.score,
            };
            return {
              ...state,
              knowledgeMastery: {
                ...state.knowledgeMastery,
                [knowledgePointId]: created,
              },
            };
          }
          const updated: KnowledgeMastery = {
            ...current,
            lastAttempt: record.timestamp,
            totalAttempts: current.totalAttempts + 1,
            correctAttempts:
              current.correctAttempts + (record.isCorrect ? 1 : 0),
            averageScore:
              (current.averageScore * current.totalAttempts + record.score) /
              (current.totalAttempts + 1),
          };
          const accuracy = updated.correctAttempts / updated.totalAttempts;
          const scoreFactor = updated.averageScore / 100;
          updated.masteryLevel = Math.min(
            100,
            Math.round((accuracy * 0.7 + scoreFactor * 0.3) * 100)
          );
          return {
            ...state,
            knowledgeMastery: {
              ...state.knowledgeMastery,
              [knowledgePointId]: updated,
            },
          };
        });
      },

      getKnowledgeMastery: (knowledgePointId?: string) => {
        const { knowledgeMastery } = get();
        return knowledgePointId
          ? knowledgeMastery[knowledgePointId]
          : knowledgeMastery;
      },

      calculateStatistics: () => {
        set(state => {
          const { learningRecords, knowledgeMastery } = state;
          if (learningRecords.length === 0) {
            return {
              ...state,
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
            };
          }
          const totalStudyTime = Math.round(
            learningRecords.reduce((s, r) => s + r.timeSpent, 0) / 60
          );
          const totalQuestionsAnswered = learningRecords.length;
          const averageScore = Math.round(
            learningRecords.reduce((s, r) => s + r.score, 0) /
              learningRecords.length
          );
          const masteredKnowledgePoints = Object.values(
            knowledgeMastery
          ).filter(m => m.masteryLevel >= 70).length;
          const learningDays = new Set(
            learningRecords.map(r => new Date(r.timestamp).toDateString())
          ).size;
          const { currentStreak, longestStreak } =
            calculateStreaks(learningRecords);
          const improvementRate = calculateImprovementRate(learningRecords);
          return {
            ...state,
            statistics: {
              totalStudyTime,
              totalQuestionsAnswered,
              averageScore,
              masteredKnowledgePoints,
              learningDays,
              currentStreak,
              longestStreak,
              improvementRate,
            },
          };
        });
      },

      getLearningTrajectory: (days: number = 30) => {
        const { learningRecords } = get();
        if (learningRecords.length === 0) return [];
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - days);
        const map = new Map<string, LearningTrajectoryPoint>();
        for (
          let d = new Date(startDate);
          d <= endDate;
          d.setDate(d.getDate() + 1)
        ) {
          const ds = d.toISOString().split('T')[0];
          map.set(ds, {
            date: ds,
            studyTime: 0,
            questionsAnswered: 0,
            averageScore: 0,
          });
        }
        learningRecords.forEach(r => {
          const ds = new Date(r.timestamp).toISOString().split('T')[0];
          const p = map.get(ds);
          if (p) {
            p.studyTime += Math.round(r.timeSpent / 60);
            p.questionsAnswered += 1;
            p.averageScore =
              (p.averageScore * (p.questionsAnswered - 1) + r.score) /
              p.questionsAnswered;
          }
        });
        return Array.from(map.values()).sort((a, b) =>
          a.date.localeCompare(b.date)
        );
      },

      generateRecommendations: () => {
        set(state => {
          const recs: LearningRecommendation[] = [];
          Object.values(state.knowledgeMastery).forEach(m => {
            if (m.masteryLevel < 50)
              recs.push({
                id: `weak-${m.knowledgePointId}`,
                type: 'knowledge_point',
                priority: 'high',
                title: `加强${m.name}学习`,
                description: `您在${m.name}方面的掌握度较低(${m.masteryLevel}%)，建议加强练习。`,
                relatedKnowledgePointId: m.knowledgePointId,
                targetScore: 80,
                isCompleted: false,
              });
            else if (m.masteryLevel < 80)
              recs.push({
                id: `improve-${m.knowledgePointId}`,
                type: 'knowledge_point',
                priority: 'medium',
                title: `提升${m.name}水平`,
                description: `您在${m.name}方面还有提升空间，建议继续练习。`,
                relatedKnowledgePointId: m.knowledgePointId,
                targetScore: 90,
                isCompleted: false,
              });
          });
          const recent = state.learningRecords.filter(
            r => Date.now() - r.timestamp < 7 * 24 * 60 * 60 * 1000
          );
          if (recent.length < 5)
            recs.push({
              id: 'study-frequency',
              type: 'study_plan',
              priority: 'medium',
              title: '增加学习频率',
              description: '建议每天至少完成5道题目，保持学习连续性。',
              isCompleted: false,
            });
          if (state.statistics.currentStreak < 3)
            recs.push({
              id: 'daily-study',
              type: 'study_plan',
              priority: 'high',
              title: '建立每日学习习惯',
              description: '建议每天坚持学习，建立良好的学习习惯。',
              isCompleted: false,
            });
          return { ...state, recommendations: recs.slice(0, 10) };
        });
      },

      generateAnalysisReport: (days: number = 30) => {
        const { statistics, knowledgeMastery, recommendations } = get();
        const trajectory = get().getLearningTrajectory(days);
        return {
          period: `${days}天`,
          summary: statistics,
          trajectory,
          mastery: Object.values(knowledgeMastery),
          recommendations,
        };
      },

      setLoading: (loading: boolean) =>
        set(state => ({ ...state, isLoading: loading })),
      setError: (error: string | null) => set(state => ({ ...state, error })),

      generateMockData: () => {
        const mockRecords: LearningRecord[] = [];
        const now = Date.now();
        const kp = [
          'js-basics',
          'js-functions',
          'js-objects',
          'react-basics',
          'react-hooks',
          'css-basics',
          'css-layout',
          'html-basics',
        ];
        for (let i = 0; i < 30; i++) {
          const date = new Date(now - i * 24 * 60 * 60 * 1000);
          const num = Math.floor(Math.random() * 8) + 2;
          for (let j = 0; j < num; j++) {
            const knowledgePointId = kp[Math.floor(Math.random() * kp.length)];
            const isCorrect = Math.random() > 0.3;
            const score = isCorrect
              ? Math.floor(Math.random() * 30) + 70
              : Math.floor(Math.random() * 40) + 30;
            mockRecords.push({
              id: `mock-${i}-${j}`,
              userId: 'user-1',
              knowledgePointId,
              questionId: `question-${i}-${j}`,
              quizId: `quiz-${i}`,
              score,
              maxScore: 100,
              timeSpent: Math.floor(Math.random() * 300) + 60,
              timestamp: date.getTime() + j * 60000,
              isCorrect,
              attempts: 1,
            });
          }
        }
        set(state => ({ ...state, learningRecords: mockRecords }));
        get().calculateStatistics();
        get().generateRecommendations();
      },

      resetProgress: () =>
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
        }),
    }),
    { name: 'chengguo-progress-storage', getStorage: () => localStorage }
  )
);

function calculateStreaks(records: LearningRecord[]): {
  currentStreak: number;
  longestStreak: number;
} {
  if (records.length === 0) return { currentStreak: 0, longestStreak: 0 };
  const days = Array.from(
    new Set(records.map(r => new Date(r.timestamp).toDateString()))
  ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  let current = 0,
    longest = 0,
    temp = 0;
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
  for (let i = 0; i < days.length; i++) {
    const cur = new Date(days[i]);
    const nxt = i < days.length - 1 ? new Date(days[i + 1]) : null;
    if (i === 0) {
      if (days[i] === today || days[i] === yesterday) {
        current = 1;
        temp = 1;
      }
    } else if (nxt) {
      const diff = Math.floor(
        (cur.getTime() - nxt.getTime()) / (24 * 60 * 60 * 1000)
      );
      if (diff === 1) {
        temp++;
        if (i === 0 || (i === 1 && days[0] === today)) current = temp;
      } else {
        longest = Math.max(longest, temp);
        temp = 1;
      }
    }
  }
  longest = Math.max(longest, temp);
  return { currentStreak: current, longestStreak: longest };
}

function calculateImprovementRate(records: LearningRecord[]): number {
  if (records.length < 14) return 0;
  const now = Date.now();
  const seven = now - 7 * 24 * 60 * 60 * 1000;
  const fourteen = now - 14 * 24 * 60 * 60 * 1000;
  const recent = records.filter(r => r.timestamp >= seven);
  const prev = records.filter(
    r => r.timestamp >= fourteen && r.timestamp < seven
  );
  if (recent.length === 0 || prev.length === 0) return 0;
  const recentAvg = recent.reduce((s, r) => s + r.score, 0) / recent.length;
  const prevAvg = prev.reduce((s, r) => s + r.score, 0) / prev.length;
  return Math.round(((recentAvg - prevAvg) / prevAvg) * 100);
}
