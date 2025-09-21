/**
 * 学习轨迹可视化组件 - chengguo1版本
 * 展示用户的学习进度和成绩变化趋势
 */

import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  ComposedChart,
  Area,
} from 'recharts';
import { TrendingUp, Clock, Target, Award, Calendar } from 'lucide-react';

interface LearningTrajectoryPoint {
  date: string;
  averageScore: number;
  studyTime: number;
  questionsAnswered: number;
  knowledgePoints: string[];
}

interface LearningTrajectoryChartProps {
  trajectory: LearningTrajectoryPoint[];
  timeRange?: string;
}

/**
 * 学习轨迹概览组件
 */
export const LearningTrajectoryOverview: React.FC<
  LearningTrajectoryChartProps
> = ({ trajectory, timeRange = '30天' }) => {
  // 计算统计数据
  const stats = useMemo(() => {
    if (trajectory.length === 0) {
      return {
        totalStudyTime: 0,
        totalQuestions: 0,
        averageScore: 0,
        studyDays: 0,
        improvement: 0,
      };
    }

    const totalStudyTime = trajectory.reduce(
      (sum, point) => sum + point.studyTime,
      0
    );
    const totalQuestions = trajectory.reduce(
      (sum, point) => sum + point.questionsAnswered,
      0
    );
    const averageScore =
      trajectory.reduce((sum, point) => sum + point.averageScore, 0) /
      trajectory.length;
    const studyDays = trajectory.filter(
      point => point.questionsAnswered > 0
    ).length;

    // 计算进步趋势
    const firstHalf = trajectory.slice(0, Math.floor(trajectory.length / 2));
    const secondHalf = trajectory.slice(Math.floor(trajectory.length / 2));

    const firstHalfAvg =
      firstHalf.reduce((sum, point) => sum + point.averageScore, 0) /
      firstHalf.length;
    const secondHalfAvg =
      secondHalf.reduce((sum, point) => sum + point.averageScore, 0) /
      secondHalf.length;

    const improvement =
      firstHalfAvg > 0
        ? Math.round(((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100)
        : 0;

    return {
      totalStudyTime,
      totalQuestions,
      averageScore: Math.round(averageScore),
      studyDays,
      improvement,
    };
  }, [trajectory]);

  return (
    <div className='space-y-6'>
      {/* 统计卡片 */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <div className='bg-white p-4 rounded-lg shadow-sm border border-gray-200'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-600'>总学习时间</p>
              <p className='text-2xl font-bold text-blue-600'>
                {stats.totalStudyTime}分钟
              </p>
            </div>
            <Clock className='w-8 h-8 text-blue-500' />
          </div>
        </div>

        <div className='bg-white p-4 rounded-lg shadow-sm border border-gray-200'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-600'>总答题数</p>
              <p className='text-2xl font-bold text-green-600'>
                {stats.totalQuestions}题
              </p>
            </div>
            <Target className='w-8 h-8 text-green-500' />
          </div>
        </div>

        <div className='bg-white p-4 rounded-lg shadow-sm border border-gray-200'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-600'>平均分数</p>
              <p className='text-2xl font-bold text-purple-600'>
                {stats.averageScore}分
              </p>
            </div>
            <Award className='w-8 h-8 text-purple-500' />
          </div>
        </div>

        <div className='bg-white p-4 rounded-lg shadow-sm border border-gray-200'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-600'>学习天数</p>
              <p className='text-2xl font-bold text-orange-600'>
                {stats.studyDays}天
              </p>
            </div>
            <Calendar className='w-8 h-8 text-orange-500' />
          </div>
        </div>
      </div>

      {/* 学习轨迹图表 */}
      <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
        <div className='flex items-center justify-between mb-6'>
          <h3 className='text-lg font-semibold text-gray-900'>学习轨迹趋势</h3>
          <div className='flex items-center gap-2 text-sm text-gray-600'>
            <TrendingUp className='w-4 h-4' />
            <span>过去{timeRange}</span>
            {stats.improvement !== 0 && (
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  stats.improvement > 0
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {stats.improvement > 0 ? '+' : ''}
                {stats.improvement}%
              </span>
            )}
          </div>
        </div>

        <div className='h-80'>
          <ResponsiveContainer width='100%' height='100%'>
            <ComposedChart data={trajectory}>
              <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
              <XAxis
                dataKey='date'
                tick={{ fontSize: 12 }}
                tickFormatter={value => {
                  const date = new Date(value);
                  return `${date.getMonth() + 1}/${date.getDate()}`;
                }}
              />
              <YAxis yAxisId='left' tick={{ fontSize: 12 }} />
              <YAxis
                yAxisId='right'
                orientation='right'
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const date = new Date(label);
                    return (
                      <div className='bg-white p-3 border border-gray-200 rounded-lg shadow-lg'>
                        <p className='font-medium text-gray-900'>
                          {date.toLocaleDateString('zh-CN')}
                        </p>
                        {payload.map((entry, index) => (
                          <p
                            key={index}
                            className='text-sm'
                            style={{ color: entry.color }}
                          >
                            {entry.name}: {entry.value}
                            {entry.dataKey === 'averageScore'
                              ? '分'
                              : entry.dataKey === 'studyTime'
                                ? '分钟'
                                : '题'}
                          </p>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                yAxisId='left'
                type='monotone'
                dataKey='averageScore'
                fill='#3b82f6'
                fillOpacity={0.1}
                stroke='#3b82f6'
                strokeWidth={2}
                name='平均分数'
              />
              <Bar
                yAxisId='right'
                dataKey='studyTime'
                fill='#10b981'
                fillOpacity={0.7}
                name='学习时间'
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 答题数量趋势 */}
      <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
        <h3 className='text-lg font-semibold text-gray-900 mb-6'>
          每日答题数量
        </h3>
        <div className='h-64'>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart data={trajectory}>
              <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
              <XAxis
                dataKey='date'
                tick={{ fontSize: 12 }}
                tickFormatter={value => {
                  const date = new Date(value);
                  return `${date.getMonth() + 1}/${date.getDate()}`;
                }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const date = new Date(label);
                    return (
                      <div className='bg-white p-3 border border-gray-200 rounded-lg shadow-lg'>
                        <p className='font-medium text-gray-900'>
                          {date.toLocaleDateString('zh-CN')}
                        </p>
                        <p className='text-sm text-blue-600'>
                          答题数量: {payload[0]?.value}题
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey='questionsAnswered'
                fill='#8b5cf6'
                fillOpacity={0.8}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

/**
 * 学习轨迹图表组件（简化版）
 */
export const LearningTrajectoryChart: React.FC<
  LearningTrajectoryChartProps
> = ({ trajectory }) => {
  return (
    <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
      <h3 className='text-lg font-semibold text-gray-900 mb-6'>学习轨迹</h3>
      <div className='h-80'>
        <ResponsiveContainer width='100%' height='100%'>
          <LineChart data={trajectory}>
            <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
            <XAxis
              dataKey='date'
              tick={{ fontSize: 12 }}
              tickFormatter={value => {
                const date = new Date(value);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const date = new Date(label);
                  return (
                    <div className='bg-white p-3 border border-gray-200 rounded-lg shadow-lg'>
                      <p className='font-medium text-gray-900'>
                        {date.toLocaleDateString('zh-CN')}
                      </p>
                      <p className='text-sm text-blue-600'>
                        平均分数: {payload[0]?.value}分
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line
              type='monotone'
              dataKey='averageScore'
              stroke='#3b82f6'
              strokeWidth={3}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
