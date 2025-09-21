/**
 * 知识点掌握度分析组件 - chengguo1版本
 * 展示用户对各个知识点的掌握情况
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  BookOpen,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Target,
} from 'lucide-react';

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

interface KnowledgeMasteryAnalysisProps {
  knowledgeMastery: Record<string, KnowledgeMastery>;
}

/**
 * 知识点掌握度分析组件
 */
export const KnowledgeMasteryAnalysis: React.FC<
  KnowledgeMasteryAnalysisProps
> = ({ knowledgeMastery }) => {
  // 推迟一个tick再渲染图表，避免 ResponsiveContainer 初始宽度为 0 导致的 NaN 刻度计算
  const [ready, setReady] = useState(false);
  const pieWrapRef = useRef<HTMLDivElement | null>(null);
  const barWrapRef = useRef<HTMLDivElement | null>(null);
  const [pieWidth, setPieWidth] = useState(0);
  const [barWidth, setBarWidth] = useState(0);
  useEffect(() => {
    const id = window.requestAnimationFrame(() => setReady(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const ResizeObs: any = (window as any).ResizeObserver;
    const ro = ResizeObs
      ? new ResizeObs((entries: any[]) => {
          entries.forEach((entry: any) => {
            if (entry.target === pieWrapRef.current)
              setPieWidth(entry.contentRect.width);
            if (entry.target === barWrapRef.current)
              setBarWidth(entry.contentRect.width);
          });
        })
      : null;
    if (ro) {
      if (pieWrapRef.current) ro.observe(pieWrapRef.current);
      if (barWrapRef.current) ro.observe(barWrapRef.current);
    } else {
      // Fallback: single read
      setPieWidth(pieWrapRef.current?.getBoundingClientRect().width || 0);
      setBarWidth(barWrapRef.current?.getBoundingClientRect().width || 0);
    }
    return () => {
      try {
        if (ro) {
          if (pieWrapRef.current) ro.unobserve(pieWrapRef.current);
          if (barWrapRef.current) ro.unobserve(barWrapRef.current);
          ro.disconnect();
        }
      } catch {}
    };
  }, []);
  // 处理数据
  const { masteryData, masteryLevels, masteryStats } = useMemo(() => {
    // 将外部传入的掌握度对象转成数组，并做健壮性清洗，避免 NaN/undefined 导致图表崩溃
    const masteryList = Object.values(knowledgeMastery || {}).map(m => ({
      ...m,
      name: m?.name || m?.knowledgePointId || '未命名知识点',
      masteryLevel: Number.isFinite((m as any)?.masteryLevel)
        ? (m as any).masteryLevel
        : 0,
      totalAttempts: Number.isFinite((m as any)?.totalAttempts)
        ? (m as any).totalAttempts
        : 0,
      correctAttempts: Number.isFinite((m as any)?.correctAttempts)
        ? (m as any).correctAttempts
        : 0,
      averageScore: Number.isFinite((m as any)?.averageScore)
        ? (m as any).averageScore
        : 0,
    }));

    if (masteryList.length === 0) {
      return {
        masteryData: [],
        masteryLevels: [],
        masteryStats: {
          total: 0,
          mastered: 0,
          learning: 0,
          weak: 0,
          averageMastery: 0,
        },
      };
    }

    // 按掌握度分类
    const mastered = masteryList.filter(m => m.masteryLevel >= 80);
    const learning = masteryList.filter(
      m => m.masteryLevel >= 50 && m.masteryLevel < 80
    );
    const weak = masteryList.filter(m => m.masteryLevel < 50);

    // 饼图数据
    const masteryLevels = [
      { name: '已掌握', value: mastered.length, color: '#10b981' },
      { name: '学习中', value: learning.length, color: '#f59e0b' },
      { name: '需加强', value: weak.length, color: '#ef4444' },
    ];

    // 柱状图数据
    const masteryData = masteryList
      .sort((a, b) => b.masteryLevel - a.masteryLevel)
      .slice(0, 10) // 只显示前10个
      .map(mastery => ({
        name: mastery.name,
        mastery: mastery.masteryLevel,
        attempts: mastery.totalAttempts,
        accuracy:
          mastery.totalAttempts > 0
            ? Math.round(
                (mastery.correctAttempts / mastery.totalAttempts) * 100
              )
            : 0,
      }));

    // 统计信息
    const averageMastery = Math.round(
      masteryList.reduce((sum, m) => sum + m.masteryLevel, 0) /
        masteryList.length
    );

    return {
      masteryData,
      masteryLevels,
      masteryStats: {
        total: masteryList.length,
        mastered: mastered.length,
        learning: learning.length,
        weak: weak.length,
        averageMastery,
      },
    };
  }, [knowledgeMastery]);

  // 获取掌握度颜色
  const getMasteryColor = (level: number): string => {
    if (level >= 80) return '#10b981';
    if (level >= 60) return '#f59e0b';
    if (level >= 40) return '#f97316';
    return '#ef4444';
  };

  // 获取掌握度状态
  const getMasteryStatus = (
    level: number
  ): { text: string; icon: React.ReactNode; color: string } => {
    if (level >= 80) {
      return {
        text: '已掌握',
        icon: <CheckCircle className='w-4 h-4' />,
        color: 'text-green-600',
      };
    } else if (level >= 60) {
      return {
        text: '良好',
        icon: <TrendingUp className='w-4 h-4' />,
        color: 'text-yellow-600',
      };
    } else if (level >= 40) {
      return {
        text: '学习中',
        icon: <Target className='w-4 h-4' />,
        color: 'text-orange-600',
      };
    } else {
      return {
        text: '需加强',
        icon: <AlertCircle className='w-4 h-4' />,
        color: 'text-red-600',
      };
    }
  };

  if (masteryStats.total === 0) {
    return (
      <div className='bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center'>
        <BookOpen className='w-16 h-16 text-gray-400 mx-auto mb-4' />
        <h3 className='text-lg font-medium text-gray-900 mb-2'>暂无学习数据</h3>
        <p className='text-gray-600'>
          开始答题后，这里将显示您的知识点掌握情况
        </p>
      </div>
    );
  }

  // 安全数据（过滤掉非有限数值）
  const safeMasteryData = useMemo(() => {
    return (masteryData || [])
      .map(d => ({
        name: String((d as any).name ?? ''),
        mastery: (() => {
          const v = Number((d as any).mastery);
          if (!Number.isFinite(v)) return 0;
          return Math.min(100, Math.max(0, v));
        })(),
        attempts: (() => {
          const v = Number((d as any).attempts);
          return Number.isFinite(v) ? Math.max(0, v) : 0;
        })(),
        accuracy: (() => {
          const v = Number((d as any).accuracy);
          return Number.isFinite(v) ? Math.min(100, Math.max(0, v)) : 0;
        })(),
      }))
      .filter(d => Number.isFinite(d.mastery));
  }, [masteryData]);

  const safeMasteryLevels = useMemo(() => {
    return (masteryLevels || [])
      .map(l => ({
        name: String((l as any).name ?? ''),
        value: (() => {
          const v = Number((l as any).value);
          return Number.isFinite(v) ? Math.max(0, v) : 0;
        })(),
        color: (l as any).color || '#ccc',
      }))
      .filter(l => Number.isFinite(l.value));
  }, [masteryLevels]);
  const hasPieData = useMemo(() => safeMasteryLevels.some(l => (l as any).value > 0), [safeMasteryLevels]);
  const hasBarData = useMemo(() => safeMasteryData.length > 0, [safeMasteryData]);

  return (
    <div className='space-y-6'>
      {/* 统计概览 */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <div className='bg-white p-4 rounded-lg shadow-sm border border-gray-200'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-600'>总知识点</p>
              <p className='text-2xl font-bold text-blue-600'>
                {masteryStats.total}
              </p>
            </div>
            <BookOpen className='w-8 h-8 text-blue-500' />
          </div>
        </div>

        <div className='bg-white p-4 rounded-lg shadow-sm border border-gray-200'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-600'>已掌握</p>
              <p className='text-2xl font-bold text-green-600'>
                {masteryStats.mastered}
              </p>
            </div>
            <CheckCircle className='w-8 h-8 text-green-500' />
          </div>
        </div>

        <div className='bg-white p-4 rounded-lg shadow-sm border border-gray-200'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-600'>学习中</p>
              <p className='text-2xl font-bold text-yellow-600'>
                {masteryStats.learning}
              </p>
            </div>
            <TrendingUp className='w-8 h-8 text-yellow-500' />
          </div>
        </div>

        <div className='bg-white p-4 rounded-lg shadow-sm border border-gray-200'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-600'>平均掌握度</p>
              <p className='text-2xl font-bold text-purple-600'>
                {masteryStats.averageMastery}%
              </p>
            </div>
            <Target className='w-8 h-8 text-purple-500' />
          </div>
        </div>
      </div>

      {/* 掌握度分布饼图 */}
      <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
        <h3 className='text-lg font-semibold text-gray-900 mb-6'>掌握度分布</h3>
        {hasPieData && ready && pieWidth > 10 ? (
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <div className='h-80' ref={pieWrapRef}>
              <ResponsiveContainer width={pieWidth || '100%'} height='100%'>
                <PieChart>
                  <Pie
                    data={safeMasteryLevels}
                    cx='50%'
                    cy='50%'
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey='value'
                  >
                    {safeMasteryLevels.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0];
                        return (
                          <div className='bg-white p-3 border border-gray-200 rounded-lg shadow-lg'>
                            <p className='font-medium text-gray-900'>
                              {data.name}
                            </p>
                            <p
                              className='text-sm'
                              style={{ color: data.payload.color }}
                            >
                              数量: {data.value}个
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className='flex flex-col justify-center space-y-4'>
              {safeMasteryLevels.map((level, index) => (
                <div key={index} className='flex items-center space-x-3'>
                  <div
                    className='w-4 h-4 rounded-full'
                    style={{ backgroundColor: level.color }}
                  />
                  <span className='text-sm text-gray-600'>{level.name}</span>
                  <span className='text-sm font-medium text-gray-900'>
                    {level.value}个
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className='text-center text-gray-500'>暂无可视化数据</div>
        )}
      </div>

      {/* 知识点掌握度排行 */}
      <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
        <h3 className='text-lg font-semibold text-gray-900 mb-6'>
          知识点掌握度排行
        </h3>
        {hasBarData && ready && barWidth > 10 ? (
          <div className='h-80' ref={barWrapRef}>
            <ResponsiveContainer width={barWidth || '100%'} height='100%'>
              <BarChart data={safeMasteryData} layout='horizontal'>
                <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
                <XAxis type='number' domain={[0, 100]} tick={{ fontSize: 12 }} />
                <YAxis
                  type='category'
                  dataKey='name'
                  tick={{ fontSize: 12 }}
                  width={120}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className='bg-white p-3 border border-gray-200 rounded-lg shadow-lg'>
                          <p className='font-medium text-gray-900'>{label}</p>
                          <p className='text-sm text-blue-600'>
                            掌握度: {data.mastery}%
                          </p>
                          <p className='text-sm text-gray-600'>
                            尝试次数: {data.attempts}次
                          </p>
                          <p className='text-sm text-gray-600'>
                            正确率: {data.accuracy}%
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey='mastery' fill='#3b82f6' radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className='text-center text-gray-500'>暂无排行数据</div>
        )}
      </div>

      {/* 详细知识点列表 */}
      <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
        <h3 className='text-lg font-semibold text-gray-900 mb-6'>知识点详情</h3>
        <div className='space-y-4'>
          {Object.values(knowledgeMastery)
            .sort((a, b) => b.masteryLevel - a.masteryLevel)
            .map(mastery => {
              const status = getMasteryStatus(mastery.masteryLevel);
              const accuracy = Math.round(
                (mastery.correctAttempts / mastery.totalAttempts) * 100
              );

              return (
                <div
                  key={mastery.knowledgePointId}
                  className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'
                >
                  <div className='flex-1'>
                    <div className='flex items-center space-x-3 mb-2'>
                      <h4 className='font-medium text-gray-900'>
                        {mastery.name}
                      </h4>
                      <div
                        className={`flex items-center space-x-1 ${status.color}`}
                      >
                        {status.icon}
                        <span className='text-sm'>{status.text}</span>
                      </div>
                    </div>

                    <div className='flex items-center space-x-6 text-sm text-gray-600'>
                      <span>掌握度: {mastery.masteryLevel}%</span>
                      <span>尝试: {mastery.totalAttempts}次</span>
                      <span>正确率: {accuracy}%</span>
                      <span>平均分: {Math.round(mastery.averageScore)}分</span>
                    </div>
                  </div>

                  <div className='w-32'>
                    <div className='w-full bg-gray-200 rounded-full h-2'>
                      <div
                        className='h-2 rounded-full transition-all duration-300'
                        style={{
                          width: `${mastery.masteryLevel}%`,
                          backgroundColor: getMasteryColor(
                            mastery.masteryLevel
                          ),
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};
