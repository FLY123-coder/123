import React, { useMemo } from 'react';

interface TrajectoryPoint {
  date: string; // ISO string or any date parseable by Date
  questionsAnswered?: number;
}

interface StreakStats {
  currentStreak?: number;
  longestStreak?: number;
}

interface StreakTrackerProps {
  trajectory: TrajectoryPoint[];
  statistics?: StreakStats;
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function computeStreaks(trajectory: TrajectoryPoint[]): { current: number; longest: number; lastStudyDate: string | null } {
  if (!trajectory || trajectory.length === 0) {
    return { current: 0, longest: 0, lastStudyDate: null };
  }

  // Build a sorted list of distinct dates with activity
  const activeDates = Array.from(
    new Set(
      trajectory
        .filter(p => (p.questionsAnswered ?? 0) > 0 || 'questionsAnswered' in p)
        .map(p => formatDate(new Date(p.date)))
    )
  ).sort();

  if (activeDates.length === 0) {
    return { current: 0, longest: 0, lastStudyDate: null };
  }

  let longest = 1;
  let current = 1;
  for (let i = 1; i < activeDates.length; i++) {
    const prev = new Date(activeDates[i - 1]);
    const expected = formatDate(addDays(prev, 1));
    if (activeDates[i] === expected) {
      current += 1;
      if (current > longest) longest = current;
    } else {
      current = 1;
    }
  }

  // Current streak should end at the latest active date
  const lastDateStr = activeDates[activeDates.length - 1];
  const lastDate = new Date(lastDateStr);
  // Recompute current streak backwards from last date
  let cur = 1;
  for (let i = activeDates.length - 2; i >= 0; i--) {
    const expected = formatDate(addDays(new Date(activeDates[i + 1]), -1));
    if (activeDates[i] === expected) cur += 1; else break;
  }

  return { current: cur, longest, lastStudyDate: lastDateStr };
}

export const StreakTracker: React.FC<StreakTrackerProps> = ({ trajectory, statistics }) => {
  const { current, longest, lastStudyDate } = useMemo(() => computeStreaks(trajectory), [trajectory]);

  const currentStreak = statistics?.currentStreak ?? current;
  const longestStreak = statistics?.longestStreak ?? longest;

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
          <p className='text-sm text-gray-600'>当前连续学习</p>
          <p className='text-3xl font-bold text-blue-600'>{currentStreak} 天</p>
        </div>
        <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
          <p className='text-sm text-gray-600'>历史最长连续</p>
          <p className='text-3xl font-bold text-green-600'>{longestStreak} 天</p>
        </div>
        <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
          <p className='text-sm text-gray-600'>最近学习日期</p>
          <p className='text-2xl font-semibold text-gray-900'>{lastStudyDate ?? '—'}</p>
        </div>
      </div>

      <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4'>连续学习说明</h3>
        <ul className='list-disc pl-5 space-y-2 text-sm text-gray-700'>
          <li>有学习记录的日期计算为连续天数；无记录则中断连续。</li>
          <li>“当前连续”基于最新学习日期向前连续累计。</li>
          <li>以上统计根据当前页面传入的学习轨迹动态计算。</li>
        </ul>
      </div>
    </div>
  );
};


