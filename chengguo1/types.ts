/**
 * 学习进度追踪系统类型定义（chengguo1版本）
 */

export interface LearningRecord {
  id: string;
  userId: string;
  knowledgePointId: string;
  questionId: string;
  quizId: string;
  score: number;
  maxScore: number;
  timeSpent: number;
  timestamp: number;
  isCorrect: boolean;
  attempts: number;
}

export interface KnowledgeMastery {
  knowledgePointId: string;
  name: string;
  masteryLevel: number;
  totalAttempts: number;
  correctAttempts: number;
  averageScore: number;
  lastStudied: string;
  studyTime: number;
}

export interface LearningTrajectoryPoint {
  date: string;
  averageScore: number;
  studyTime: number;
  questionsAnswered: number;
  knowledgePoints: string[];
}

export interface LearningStatistics {
  totalStudyTime: number;
  totalQuestionsAnswered: number;
  averageScore: number;
  masteredKnowledgePoints: number;
  learningDays: number;
  currentStreak: number;
  longestStreak: number;
  improvementRate: number;
}

export interface LearningRecommendation {
  id: string;
  title: string;
  description: string;
  type: 'knowledge_point' | 'study_plan' | 'review' | 'practice';
  priority: 'high' | 'medium' | 'low';
  isCompleted: boolean;
  targetScore?: number;
  relatedKnowledgePointId?: string;
  estimatedTime?: number;
  createdAt: string;
}

export interface LearningAnalysisReport {
  period: string;
  summary: {
    totalStudyTime: number;
    totalQuestionsAnswered: number;
    averageScore: number;
    masteredKnowledgePoints: number;
    learningDays: number;
    currentStreak: number;
    longestStreak: number;
    improvementRate: number;
  };
  trajectory: LearningTrajectoryPoint[];
  mastery: KnowledgeMastery[];
  recommendations: LearningRecommendation[];
}

export interface ProgressState {
  learningRecords: LearningRecord[];
  knowledgeMastery: Record<string, KnowledgeMastery>;
  learningTrajectory: LearningTrajectoryPoint[];
  statistics: LearningStatistics;
  recommendations: LearningRecommendation[];
  isLoading: boolean;
  error: string | null;
}

export interface ProgressActions {
  addLearningRecord: (record: LearningRecord) => void;
  updateLearningRecord: (id: string, updates: Partial<LearningRecord>) => void;
  getLearningRecords: (filters?: Record<string, unknown>) => LearningRecord[];
  updateKnowledgeMastery: (
    knowledgePointId: string,
    record: LearningRecord
  ) => void;
  getKnowledgeMastery: (
    knowledgePointId?: string
  ) => KnowledgeMastery | Record<string, KnowledgeMastery>;
  calculateStatistics: () => void;
  getLearningTrajectory: (days?: number) => LearningTrajectoryPoint[];
  generateRecommendations: () => void;
  generateAnalysisReport: (days?: number) => LearningAnalysisReport;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  generateMockData: () => void;
  resetProgress: () => void;
}
