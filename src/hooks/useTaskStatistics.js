import { useQuery } from '@tanstack/react-query';
import { useSchedulerExecutions, useTaskHistory } from './useScheduler';

const API_BASE_URL = import.meta.env.VITE_EVE_BACKEND_URL || 'https://go.eveonline.it';

// Enhanced statistics calculator
export const calculateTaskStatistics = (executions = []) => {
  if (!executions.length) {
    return {
      totalExecutions: 0,
      successCount: 0,
      failureCount: 0,
      runningCount: 0,
      timeoutCount: 0,
      cancelledCount: 0,
      successRate: 0,
      failureRate: 0,
      averageDuration: null,
      medianDuration: null,
      minDuration: null,
      maxDuration: null,
      totalDuration: 0,
      executionsToday: 0,
      executionsThisWeek: 0,
      executionsThisMonth: 0,
      performanceTrend: 'stable',
      recentErrorMessages: [],
      executionsByHour: Array(24).fill(0),
      executionsByDay: Array(7).fill(0),
      durationTrend: []
    };
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Count by status
  const successCount = executions.filter(e => e.status === 'success').length;
  const failureCount = executions.filter(e => e.status === 'failed').length;
  const runningCount = executions.filter(e => e.status === 'running').length;
  const timeoutCount = executions.filter(e => e.status === 'timeout').length;
  const cancelledCount = executions.filter(e => e.status === 'cancelled').length;

  // Rates
  const successRate = executions.length > 0 ? (successCount / executions.length) * 100 : 0;
  const failureRate = executions.length > 0 ? (failureCount / executions.length) * 100 : 0;

  // Duration analysis (only for completed executions)
  const completedExecutions = executions.filter(e => e.duration && e.status !== 'running');
  const durations = completedExecutions.map(e => e.duration).sort((a, b) => a - b);
  
  const averageDuration = durations.length > 0 
    ? durations.reduce((sum, d) => sum + d, 0) / durations.length 
    : null;
  
  const medianDuration = durations.length > 0
    ? durations.length % 2 === 0
      ? (durations[durations.length / 2 - 1] + durations[durations.length / 2]) / 2
      : durations[Math.floor(durations.length / 2)]
    : null;

  const minDuration = durations.length > 0 ? Math.min(...durations) : null;
  const maxDuration = durations.length > 0 ? Math.max(...durations) : null;
  const totalDuration = durations.reduce((sum, d) => sum + d, 0);

  // Time-based counts
  const executionsToday = executions.filter(e => new Date(e.started_at) >= today).length;
  const executionsThisWeek = executions.filter(e => new Date(e.started_at) >= weekAgo).length;
  const executionsThisMonth = executions.filter(e => new Date(e.started_at) >= monthAgo).length;

  // Performance trend analysis
  let performanceTrend = 'stable';
  if (completedExecutions.length >= 10) {
    const recent = completedExecutions.slice(0, 5);
    const older = completedExecutions.slice(-5);
    const recentAvg = recent.reduce((sum, e) => sum + e.duration, 0) / recent.length;
    const olderAvg = older.reduce((sum, e) => sum + e.duration, 0) / older.length;
    
    if (recentAvg < olderAvg * 0.85) performanceTrend = 'improving';
    else if (recentAvg > olderAvg * 1.15) performanceTrend = 'degrading';
  }

  // Recent error messages
  const recentErrorMessages = executions
    .filter(e => e.status === 'failed' && e.error_message)
    .slice(0, 5)
    .map(e => ({
      id: e.id,
      timestamp: e.started_at,
      message: e.error_message
    }));

  // Execution distribution by hour of day
  const executionsByHour = Array(24).fill(0);
  executions.forEach(e => {
    const hour = new Date(e.started_at).getHours();
    executionsByHour[hour]++;
  });

  // Execution distribution by day of week
  const executionsByDay = Array(7).fill(0);
  executions.forEach(e => {
    const day = new Date(e.started_at).getDay();
    executionsByDay[day]++;
  });

  // Duration trend over time (last 20 executions)
  const durationTrend = completedExecutions
    .slice(0, 20)
    .reverse()
    .map((e, index) => ({
      execution: index + 1,
      duration: e.duration,
      timestamp: e.started_at
    }));

  return {
    totalExecutions: executions.length,
    successCount,
    failureCount,
    runningCount,
    timeoutCount,
    cancelledCount,
    successRate,
    failureRate,
    averageDuration,
    medianDuration,
    minDuration,
    maxDuration,
    totalDuration,
    executionsToday,
    executionsThisWeek,
    executionsThisMonth,
    performanceTrend,
    recentErrorMessages,
    executionsByHour,
    executionsByDay,
    durationTrend
  };
};

// Hook for task-specific statistics
export const useTaskStatistics = (taskId, params = {}) => {
  const { data: historyData, isLoading, error } = useTaskHistory(taskId, {
    limit: 100, // Get more data for better statistics
    ...params
  });

  const statistics = calculateTaskStatistics(historyData?.executions || []);

  return {
    statistics,
    isLoading,
    error,
    hasData: historyData?.executions?.length > 0
  };
};

// Hook for global execution statistics
export const useGlobalExecutionStatistics = (params = {}) => {
  const { data: executionsData, isLoading, error } = useSchedulerExecutions({
    limit: 200, // Get more data for comprehensive statistics
    ...params
  });

  const statistics = calculateTaskStatistics(executionsData?.executions || []);

  return {
    statistics,
    isLoading,
    error,
    hasData: executionsData?.executions?.length > 0
  };
};

// Hook for performance metrics by task type
export const useTaskTypePerformanceMetrics = () => {
  return useQuery({
    queryKey: ['scheduler', 'performance', 'by-task-type'],
    queryFn: async () => {
      // Fetch all executions and group by task type
      const response = await fetch(`${API_BASE_URL}/scheduler/executions?limit=500`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const executions = data.executions || [];

      // Group executions by task type (would need task info for this)
      // For now, return overall statistics
      return {
        overall: calculateTaskStatistics(executions),
        byType: {} // Would need to join with task data
      };
    },
    staleTime: 60000, // 1 minute
    refetchInterval: 300000 // 5 minutes
  });
};

// Hook for system performance trends
export const useSystemPerformanceTrends = (timeRange = '7d') => {
  return useQuery({
    queryKey: ['scheduler', 'performance', 'trends', timeRange],
    queryFn: async () => {
      const now = new Date();
      let startDate;
      
      switch (timeRange) {
        case '1d':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      }

      const response = await fetch(
        `${API_BASE_URL}/scheduler/executions?start_date=${startDate.toISOString()}&limit=1000`,
        {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const executions = data.executions || [];

      // Group executions by day for trend analysis
      const dailyStats = {};
      executions.forEach(execution => {
        const date = new Date(execution.started_at).toISOString().split('T')[0];
        if (!dailyStats[date]) {
          dailyStats[date] = [];
        }
        dailyStats[date].push(execution);
      });

      // Calculate statistics for each day
      const trends = Object.entries(dailyStats)
        .map(([date, dayExecutions]) => ({
          date,
          ...calculateTaskStatistics(dayExecutions)
        }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      return {
        trends,
        overall: calculateTaskStatistics(executions),
        timeRange
      };
    },
    staleTime: 60000, // 1 minute
    refetchInterval: 300000 // 5 minutes
  });
};