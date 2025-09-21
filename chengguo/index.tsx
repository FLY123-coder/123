/**
 * 学习成果页面 (chengguo)
 * 展示用户的学习进度追踪和分析结果
 */

import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  BookOpen,
  Target,
  RefreshCw,
  Calendar,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useLocalProgressStore } from '@/stores/progressStore';
import {
  LearningTrajectoryOverview,
  KnowledgeMasteryAnalysis,
  StreakTracker,
  LearningRecommendations,
} from '@/components/ProgressTracking';

type TabType =
  | 'overview'
  | 'trajectory'
  | 'mastery'
  | 'streak'
  | 'recommendations';

export const ChengguoPage: React.FC = () => {
  const statistics = useLocalProgressStore(s => s.statistics);
  const knowledgeMastery = useLocalProgressStore(s => s.knowledgeMastery);
  const learningRecords = useLocalProgressStore(s => s.learningRecords);
  const recommendations = useLocalProgressStore(s => s.recommendations);
  const isLoading = useLocalProgressStore(s => s.isLoading);
  const error = useLocalProgressStore(s => s.error);
  const getLearningTrajectory = useLocalProgressStore(s => s.getLearningTrajectory);
  const calculateStatistics = useLocalProgressStore(s => s.calculateStatistics);
  const generateMockData = useLocalProgressStore(s => s.generateMockData);
  const resetProgress = useLocalProgressStore(s => s.resetProgress);

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>(
    '30d'
  );
  const [showMockData, setShowMockData] = useState(false);
  const [loading, setLoading] = useState(false);

  // 若已有学习记录但掌握度对象为空，补一次统计（避免首次进入空白）
  useEffect(() => {
    if (learningRecords && learningRecords.length > 0 && Object.keys(knowledgeMastery || {}).length === 0) {
      calculateStatistics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 获取学习轨迹数据
  const learningTrajectory = getLearningTrajectory(
    timeRange === 'all' ? 365 : parseInt(timeRange.replace('d', ''))
  );

  // 标签页配置
  const tabs = [
    {
      id: 'overview' as TabType,
      label: '总览',
      icon: <BarChart3 className='w-5 h-5' />,
      description: '学习数据概览',
    },
    {
      id: 'trajectory' as TabType,
      label: '学习轨迹',
      icon: <TrendingUp className='w-5 h-5' />,
      description: '学习进度可视化',
    },
    {
      id: 'mastery' as TabType,
      label: '知识点掌握',
      icon: <BookOpen className='w-5 h-5' />,
      description: '知识点掌握度分析',
    },
    {
      id: 'streak' as TabType,
      label: '连续学习',
      icon: <Target className='w-5 h-5' />,
      description: '学习连续性和习惯',
    },
    {
      id: 'recommendations' as TabType,
      label: '学习建议',
      icon: <Target className='w-5 h-5' />,
      description: '个性化学习建议',
    },
  ];

  // 生成模拟数据
  const handleGenerateMockData = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟加载
      generateMockData();
      setShowMockData(true);
    } catch (error) {
      console.error('生成模拟数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 重置数据
  const handleResetData = () => {
    if (window.confirm('确定要重置所有学习数据吗？此操作不可撤销。')) {
      resetProgress();
      setShowMockData(false);
    }
  };

  // 处理时间范围变化
  const handleTimeRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTimeRange(e.target.value as '7d' | '30d' | '90d' | 'all');
  };

  // 渲染标签页内容
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className='space-y-6'>
            {/* 学习统计概览 */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
              <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm text-gray-600'>总学习时间</p>
                    <p className='text-2xl font-bold text-blue-600'>
                      {statistics.totalStudyTime}分钟
                    </p>
                  </div>
                  <div className='p-3 bg-blue-100 rounded-full'>
                    <TrendingUp className='w-6 h-6 text-blue-600' />
                  </div>
                </div>
              </div>

              <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm text-gray-600'>总答题数</p>
                    <p className='text-2xl font-bold text-green-600'>
                      {statistics.totalQuestionsAnswered}题
                    </p>
                  </div>
                  <div className='p-3 bg-green-100 rounded-full'>
                    <BookOpen className='w-6 h-6 text-green-600' />
                  </div>
                </div>
              </div>

              <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm text-gray-600'>平均分数</p>
                    <p className='text-2xl font-bold text-purple-600'>
                      {statistics.averageScore}分
                    </p>
                  </div>
                  <div className='p-3 bg-purple-100 rounded-full'>
                    <Target className='w-6 h-6 text-purple-600' />
                  </div>
                </div>
              </div>

              <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm text-gray-600'>掌握知识点</p>
                    <p className='text-2xl font-bold text-orange-600'>
                      {statistics.masteredKnowledgePoints}个
                    </p>
                  </div>
                  <div className='p-3 bg-orange-100 rounded-full'>
                    <BarChart3 className='w-6 h-6 text-orange-600' />
                  </div>
                </div>
              </div>
            </div>

            {/* 学习轨迹概览 */}
            <LearningTrajectoryOverview
              trajectory={learningTrajectory}
              timeRange={timeRange}
            />
          </div>
        );

      case 'trajectory':
        return (
          <LearningTrajectoryOverview
            trajectory={learningTrajectory}
            timeRange={timeRange}
          />
        );

      case 'mastery':
        return <KnowledgeMasteryAnalysis knowledgeMastery={knowledgeMastery} />;

      case 'streak':
        return (
          <StreakTracker
            trajectory={learningTrajectory}
            statistics={statistics}
          />
        );

      case 'recommendations':
        return (
          <LearningRecommendations
            recommendations={recommendations}
            knowledgeMastery={knowledgeMastery}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* 页面头部 */}
      <div className='bg-white shadow-sm border-b border-gray-200'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-16'>
            <div className='flex items-center space-x-3'>
              <div className='p-2 bg-blue-100 rounded-lg'>
                <BarChart3 className='w-6 h-6 text-blue-600' />
              </div>
              <div>
                <h1 className='text-xl font-semibold text-gray-900'>
                  学习成果
                </h1>
                <p className='text-sm text-gray-600'>学习进度追踪与分析</p>
              </div>
            </div>

            <div className='flex items-center space-x-4'>
              {/* 时间范围选择 */}
              <div className='flex items-center space-x-2'>
                <Calendar className='w-4 h-4 text-gray-500' />
                <select
                  value={timeRange}
                  onChange={handleTimeRangeChange}
                  className='text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500'
                >
                  <option value='7d'>过去7天</option>
                  <option value='30d'>过去30天</option>
                  <option value='90d'>过去90天</option>
                  <option value='all'>全部时间</option>
                </select>
              </div>

              {/* 数据管理按钮 */}
              <div className='flex items-center space-x-2'>
                {!showMockData ? (
                  <button
                    onClick={handleGenerateMockData}
                    disabled={loading}
                    className='flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                  >
                    {loading ? (
                      <RefreshCw className='w-4 h-4 animate-spin' />
                    ) : (
                      <Eye className='w-4 h-4' />
                    )}
                    <span className='text-sm'>生成演示数据</span>
                  </button>
                ) : (
                  <button
                    onClick={handleResetData}
                    className='flex items-center space-x-2 px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors'
                  >
                    <EyeOff className='w-4 h-4' />
                    <span className='text-sm'>重置数据</span>
                  </button>
                )}
                {/* 永久显示重置按钮 */}
                <button
                  onClick={handleResetData}
                  className='flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors'
                >
                  <RefreshCw className='w-4 h-4' />
                  <span className='text-sm'>清空学习成果</span>
                </button>
                {/* 返回主页 */}
                <button
                  onClick={() => {
                    window.location.hash = '';
                    window.dispatchEvent(new HashChangeEvent('hashchange'));
                  }}
                  className='flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors'
                >
                  <span className='text-sm'>返回主页</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 标签页导航 */}
      <div className='bg-white border-b border-gray-200'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <nav className='flex space-x-8'>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* 页面内容 */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {isLoading ? (
          <div className='flex items-center justify-center h-64'>
            <div className='flex items-center space-x-2'>
              <RefreshCw className='w-5 h-5 animate-spin text-blue-600' />
              <span className='text-gray-600'>加载中...</span>
            </div>
          </div>
        ) : error ? (
          <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
            <div className='flex items-center space-x-2'>
              <div className='w-4 h-4 bg-red-500 rounded-full'></div>
              <span className='text-red-800'>加载失败: {error}</span>
            </div>
          </div>
        ) : (
          renderTabContent()
        )}
      </div>

      {/* 演示数据提示 */}
      {showMockData && (
        <div className='fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg'>
          <div className='flex items-center space-x-2'>
            <Eye className='w-4 h-4' />
            <span className='text-sm'>正在显示演示数据</span>
          </div>
        </div>
      )}
    </div>
  );
};
