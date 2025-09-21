/**
 * 个性化学习建议组件 - chengguo1版本
 * 基于用户学习数据提供个性化建议
 */

import React, { useMemo } from 'react';
import {
  Lightbulb,
  Target,
  BookOpen,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Star,
  ArrowRight,
  Calendar,
  Award,
} from 'lucide-react';

interface LearningRecommendation {
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

interface KnowledgeMastery {
  knowledgePointId: string;
  name: string;
  masteryLevel: number;
  totalAttempts: number;
  correctAttempts: number;
  averageScore: number;
  lastStudied: string;
  studyTime: number;
}

interface LearningRecommendationsProps {
  recommendations: LearningRecommendation[];
  knowledgeMastery: Record<string, KnowledgeMastery>;
}

/**
 * 个性化学习建议组件
 */
export const LearningRecommendations: React.FC<
  LearningRecommendationsProps
> = ({ recommendations, knowledgeMastery }) => {
  // 处理建议数据
  const { categorizedRecommendations, priorityStats } = useMemo(() => {
    if (recommendations.length === 0) {
      return {
        categorizedRecommendations: {
          high: [],
          medium: [],
          low: [],
        },
        priorityStats: {
          total: 0,
          high: 0,
          medium: 0,
          low: 0,
          completed: 0,
        },
      };
    }

    // 按优先级分类
    const categorized = {
      high: recommendations.filter(r => r.priority === 'high'),
      medium: recommendations.filter(r => r.priority === 'medium'),
      low: recommendations.filter(r => r.priority === 'low'),
    };

    // 统计信息
    const stats = {
      total: recommendations.length,
      high: categorized.high.length,
      medium: categorized.medium.length,
      low: categorized.low.length,
      completed: recommendations.filter(r => r.isCompleted).length,
    };

    return {
      categorizedRecommendations: categorized,
      priorityStats: stats,
    };
  }, [recommendations]);

  // 获取优先级颜色
  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-100 border-green-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  // 获取优先级图标
  const getPriorityIcon = (priority: string): React.ReactNode => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className='w-4 h-4' />;
      case 'medium':
        return <Target className='w-4 h-4' />;
      case 'low':
        return <CheckCircle className='w-4 h-4' />;
      default:
        return <Lightbulb className='w-4 h-4' />;
    }
  };

  // 获取建议类型图标
  const getTypeIcon = (type: string): React.ReactNode => {
    switch (type) {
      case 'knowledge_point':
        return <BookOpen className='w-5 h-5' />;
      case 'study_plan':
        return <Calendar className='w-5 h-5' />;
      case 'review':
        return <TrendingUp className='w-5 h-5' />;
      default:
        return <Lightbulb className='w-5 h-5' />;
    }
  };

  // 获取建议类型颜色
  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'knowledge_point':
        return 'text-blue-600 bg-blue-100';
      case 'study_plan':
        return 'text-purple-600 bg-purple-100';
      case 'review':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  // 获取相关知识点信息
  const getRelatedKnowledgePoint = (knowledgePointId?: string) => {
    if (!knowledgePointId) return null;
    return knowledgeMastery[knowledgePointId];
  };

  if (recommendations.length === 0) {
    return (
      <div className='bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center'>
        <Lightbulb className='w-16 h-16 text-gray-400 mx-auto mb-4' />
        <h3 className='text-lg font-medium text-gray-900 mb-2'>暂无学习建议</h3>
        <p className='text-gray-600'>继续学习后，系统将为您生成个性化建议</p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* 建议统计概览 */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <div className='bg-white p-4 rounded-lg shadow-sm border border-gray-200'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-600'>总建议数</p>
              <p className='text-2xl font-bold text-blue-600'>
                {priorityStats.total}
              </p>
            </div>
            <Lightbulb className='w-8 h-8 text-blue-500' />
          </div>
        </div>

        <div className='bg-white p-4 rounded-lg shadow-sm border border-gray-200'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-600'>高优先级</p>
              <p className='text-2xl font-bold text-red-600'>
                {priorityStats.high}
              </p>
            </div>
            <AlertTriangle className='w-8 h-8 text-red-500' />
          </div>
        </div>

        <div className='bg-white p-4 rounded-lg shadow-sm border border-gray-200'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-600'>已完成</p>
              <p className='text-2xl font-bold text-green-600'>
                {priorityStats.completed}
              </p>
            </div>
            <CheckCircle className='w-8 h-8 text-green-500' />
          </div>
        </div>

        <div className='bg-white p-4 rounded-lg shadow-sm border border-gray-200'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-600'>完成率</p>
              <p className='text-2xl font-bold text-purple-600'>
                {priorityStats.total > 0
                  ? Math.round(
                      (priorityStats.completed / priorityStats.total) * 100
                    )
                  : 0}
                %
              </p>
            </div>
            <Award className='w-8 h-8 text-purple-500' />
          </div>
        </div>
      </div>

      {/* 高优先级建议 */}
      {categorizedRecommendations.high.length > 0 && (
        <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
          <div className='flex items-center space-x-2 mb-6'>
            <AlertTriangle className='w-5 h-5 text-red-500' />
            <h3 className='text-lg font-semibold text-gray-900'>
              高优先级建议
            </h3>
            <span className='px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full'>
              {categorizedRecommendations.high.length}
            </span>
          </div>

          <div className='space-y-4'>
            {categorizedRecommendations.high.map(recommendation => {
              const relatedKP = getRelatedKnowledgePoint(
                recommendation.relatedKnowledgePointId
              );

              return (
                <div
                  key={recommendation.id}
                  className='p-4 bg-red-50 border border-red-200 rounded-lg'
                >
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <div className='flex items-center space-x-2 mb-2'>
                        <div
                          className={`p-1 rounded ${getTypeColor(recommendation.type)}`}
                        >
                          {getTypeIcon(recommendation.type)}
                        </div>
                        <h4 className='font-medium text-gray-900'>
                          {recommendation.title}
                        </h4>
                        <span
                          className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(recommendation.priority)}`}
                        >
                          {getPriorityIcon(recommendation.priority)}
                          <span className='ml-1'>高优先级</span>
                        </span>
                      </div>

                      <p className='text-sm text-gray-700 mb-3'>
                        {recommendation.description}
                      </p>

                      {relatedKP && (
                        <div className='flex items-center space-x-2 text-sm text-gray-600'>
                          <BookOpen className='w-4 h-4' />
                          <span>相关知识点: {relatedKP.name}</span>
                          <span className='text-gray-400'>|</span>
                          <span>当前掌握度: {relatedKP.masteryLevel}%</span>
                        </div>
                      )}

                      {recommendation.targetScore && (
                        <div className='flex items-center space-x-2 text-sm text-gray-600 mt-2'>
                          <Target className='w-4 h-4' />
                          <span>目标分数: {recommendation.targetScore}分</span>
                        </div>
                      )}
                    </div>

                    <div className='flex items-center space-x-2 ml-4'>
                      {recommendation.isCompleted ? (
                        <CheckCircle className='w-5 h-5 text-green-500' />
                      ) : (
                        <ArrowRight className='w-5 h-5 text-gray-400' />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 中等优先级建议 */}
      {categorizedRecommendations.medium.length > 0 && (
        <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
          <div className='flex items-center space-x-2 mb-6'>
            <Target className='w-5 h-5 text-yellow-500' />
            <h3 className='text-lg font-semibold text-gray-900'>
              中等优先级建议
            </h3>
            <span className='px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full'>
              {categorizedRecommendations.medium.length}
            </span>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {categorizedRecommendations.medium.map(recommendation => {
              const relatedKP = getRelatedKnowledgePoint(
                recommendation.relatedKnowledgePointId
              );

              return (
                <div
                  key={recommendation.id}
                  className='p-4 bg-yellow-50 border border-yellow-200 rounded-lg'
                >
                  <div className='flex items-start space-x-3'>
                    <div
                      className={`p-2 rounded ${getTypeColor(recommendation.type)}`}
                    >
                      {getTypeIcon(recommendation.type)}
                    </div>
                    <div className='flex-1'>
                      <div className='flex items-center space-x-2 mb-2'>
                        <h4 className='font-medium text-gray-900'>
                          {recommendation.title}
                        </h4>
                        {recommendation.isCompleted && (
                          <CheckCircle className='w-4 h-4 text-green-500' />
                        )}
                      </div>

                      <p className='text-sm text-gray-700 mb-2'>
                        {recommendation.description}
                      </p>

                      {relatedKP && (
                        <div className='text-xs text-gray-600'>
                          相关: {relatedKP.name} ({relatedKP.masteryLevel}%)
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 低优先级建议 */}
      {categorizedRecommendations.low.length > 0 && (
        <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
          <div className='flex items-center space-x-2 mb-6'>
            <CheckCircle className='w-5 h-5 text-green-500' />
            <h3 className='text-lg font-semibold text-gray-900'>
              低优先级建议
            </h3>
            <span className='px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full'>
              {categorizedRecommendations.low.length}
            </span>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {categorizedRecommendations.low.map(recommendation => (
              <div
                key={recommendation.id}
                className='p-4 bg-green-50 border border-green-200 rounded-lg'
              >
                <div className='flex items-start space-x-3'>
                  <div
                    className={`p-2 rounded ${getTypeColor(recommendation.type)}`}
                  >
                    {getTypeIcon(recommendation.type)}
                  </div>
                  <div className='flex-1'>
                    <h4 className='font-medium text-gray-900 text-sm mb-1'>
                      {recommendation.title}
                    </h4>
                    <p className='text-xs text-gray-700'>
                      {recommendation.description}
                    </p>
                    {recommendation.isCompleted && (
                      <div className='flex items-center space-x-1 mt-2'>
                        <CheckCircle className='w-3 h-3 text-green-500' />
                        <span className='text-xs text-green-600'>已完成</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 学习建议总结 */}
      <div className='bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200'>
        <div className='flex items-start space-x-3'>
          <Star className='w-6 h-6 text-blue-500 mt-1' />
          <div>
            <h3 className='font-medium text-gray-900 mb-2'>学习建议总结</h3>
            <div className='text-sm text-gray-700 space-y-1'>
              <p>• 优先完成高优先级建议，这些对您的学习进步最为重要</p>
              <p>• 建议每天至少完成1-2个学习建议</p>
              <p>• 定期回顾已完成建议，巩固学习成果</p>
              <p>• 根据建议调整学习计划，提高学习效率</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
