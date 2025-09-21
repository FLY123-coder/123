/**
 * 学习成果页面 - chengguo1版本
 * 整合学习进度追踪系统的图表UI组件
 */

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  BookOpen,
  Lightbulb,
  Download,
  RefreshCw,
  Calendar,
  ChevronDown,
} from 'lucide-react';
import { useChengguo1ProgressStore } from './progressStore';
import {
  LearningTrajectoryOverview,
  KnowledgeMasteryAnalysis,
  LearningRecommendations,
} from './components';

type TabType = 'trajectory' | 'mastery' | 'recommendations';
type TimeRange = '7d' | '30d' | '90d' | 'all';

export const Chengguo1Page: React.FC = () => {
  const {
    learningTrajectory,
    knowledgeMastery,
    recommendations,
    statistics,
    isLoading,
    error,
    getLearningTrajectory,
    generateMockData,
    resetProgress,
  } = useChengguo1ProgressStore();

  const [activeTab, setActiveTab] = useState<TabType>('trajectory');
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [showReportMenu, setShowReportMenu] = useState(false);

  // 初始化数据
  useEffect(() => {
    const days = timeRange === 'all' ? 365 : parseInt(timeRange);
    getLearningTrajectory(days);
  }, [timeRange, getLearningTrajectory]);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = () => setShowReportMenu(false);
    if (showReportMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showReportMenu]);

  const tabs = [
    {
      id: 'trajectory' as TabType,
      label: '学习轨迹',
      icon: <BarChart3 className='w-5 h-5' />,
      description: '学习进度和成绩趋势',
    },
    {
      id: 'mastery' as TabType,
      label: '知识掌握',
      icon: <BookOpen className='w-5 h-5' />,
      description: '各知识点掌握情况',
    },
    {
      id: 'recommendations' as TabType,
      label: '学习建议',
      icon: <Lightbulb className='w-5 h-5' />,
      description: '个性化学习建议',
    },
  ];

  const timeRangeOptions = [
    { value: '7d' as TimeRange, label: '最近7天' },
    { value: '30d' as TimeRange, label: '最近30天' },
    { value: '90d' as TimeRange, label: '最近90天' },
    { value: 'all' as TimeRange, label: '全部时间' },
  ];

  const handleGenerateReport = (format: string) => {
    console.log(`生成${format}格式报告`);
    // 这里可以添加实际的报告生成逻辑
    setShowReportMenu(false);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'trajectory':
        return (
          <LearningTrajectoryOverview
            trajectory={learningTrajectory}
            timeRange={
              timeRangeOptions.find(opt => opt.value === timeRange)?.label
            }
          />
        );
      case 'mastery':
        return <KnowledgeMasteryAnalysis knowledgeMastery={knowledgeMastery} />;
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

  if (error) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='bg-white p-8 rounded-lg shadow-sm border border-red-200 text-center max-w-md'>
          <div className='text-red-500 mb-4'>
            <BarChart3 className='w-16 h-16 mx-auto' />
          </div>
          <h3 className='text-lg font-semibold text-gray-900 mb-2'>加载失败</h3>
          <p className='text-gray-600 mb-4'>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className='px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors'
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* 页面头部 */}
      <div className='bg-white shadow-sm border-b border-gray-200'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-16'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-blue-100 rounded-lg'>
                <BarChart3 className='w-6 h-6 text-blue-600' />
              </div>
              <div>
                <h1 className='text-xl font-semibold text-gray-900'>
                  学习成果 - Chengguo1
                </h1>
                <p className='text-sm text-gray-600'>图表UI组件展示版本</p>
              </div>
            </div>

            <div className='flex items-center gap-3'>
              {/* 时间范围选择器 */}
              <div className='flex items-center gap-2'>
                <Calendar className='w-4 h-4 text-gray-500' />
                <select
                  value={timeRange}
                  onChange={e => setTimeRange(e.target.value as TimeRange)}
                  className='text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500'
                >
                  {timeRangeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 报告生成按钮 */}
              <div className='relative'>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setShowReportMenu(!showReportMenu);
                  }}
                  className='flex items-center gap-2 px-3 py-1 text-sm bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors'
                >
                  <Download className='w-4 h-4' />
                  生成报告
                  <ChevronDown className='w-4 h-4' />
                </button>

                {showReportMenu && (
                  <div className='absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10'>
                    <div className='py-1'>
                      <button
                        onClick={() => handleGenerateReport('PDF')}
                        className='block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                      >
                        下载 PDF 报告
                      </button>
                      <button
                        onClick={() => handleGenerateReport('Excel')}
                        className='block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                      >
                        下载 Excel 报告
                      </button>
                      <button
                        onClick={() => handleGenerateReport('JSON')}
                        className='block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                      >
                        下载 JSON 数据
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 操作按钮 */}
              <button
                onClick={generateMockData}
                className='flex items-center gap-2 px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors'
              >
                <RefreshCw className='w-4 h-4' />
                生成模拟数据
              </button>

              <button
                onClick={resetProgress}
                className='flex items-center gap-2 px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors'
              >
                重置数据
              </button>
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
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                <span className='text-xs text-gray-400 hidden sm:block'>
                  {tab.description}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* 统计概览 */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-600'>总学习时间</p>
                <p className='text-2xl font-bold text-blue-600'>
                  {Math.floor(statistics.totalStudyTime / 60)}小时
                </p>
              </div>
              <div className='p-3 bg-blue-100 rounded-full'>
                <BarChart3 className='w-6 h-6 text-blue-600' />
              </div>
            </div>
          </div>

          <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-600'>答题总数</p>
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
                <Lightbulb className='w-6 h-6 text-purple-600' />
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
                <BookOpen className='w-6 h-6 text-orange-600' />
              </div>
            </div>
          </div>
        </div>

        {/* 标签页内容 */}
        {isLoading ? (
          <div className='bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center'>
            <RefreshCw className='w-8 h-8 text-gray-400 mx-auto mb-4 animate-spin' />
            <p className='text-gray-600'>加载中...</p>
          </div>
        ) : (
          renderTabContent()
        )}
      </div>
    </div>
  );
};
