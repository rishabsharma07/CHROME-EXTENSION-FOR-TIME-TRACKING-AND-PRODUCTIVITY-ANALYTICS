import React from 'react';
import { TrendingUp, Target, Clock, Award } from 'lucide-react';

interface ProductivityScoreProps {
  data: any;
  showGoals?: boolean;
}

const ProductivityScore: React.FC<ProductivityScoreProps> = ({ data, showGoals = false }) => {
  const calculateTodayStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayData = data.dailyData[today] || {};
    
    let totalTime = 0;
    let productiveTime = 0;
    
    for (const [website, time] of Object.entries(todayData)) {
      totalTime += time as number;
      
      // Check if website is productive
      if (data.settings.categories.productive.some((site: string) => website.includes(site))) {
        productiveTime += time as number;
      }
    }
    
    const productivityScore = totalTime > 0 ? Math.round((productiveTime / totalTime) * 100) : 0;
    
    return {
      totalTime: Math.floor(totalTime / 60), // Convert to minutes
      productiveTime: Math.floor(productiveTime / 60),
      productivityScore,
      goal: data.settings.productiveGoal
    };
  };

  const stats = calculateTodayStats();
  const goalProgress = (stats.productiveTime / stats.goal) * 100;

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-600';
    if (score >= 60) return 'from-yellow-500 to-orange-600';
    return 'from-red-500 to-pink-600';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Productivity Score */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${getScoreBackground(stats.productivityScore)} flex items-center justify-center`}>
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-medium text-gray-900">Productivity Score</h3>
          </div>
        </div>
        <div className="space-y-2">
          <div className={`text-3xl font-bold ${getScoreColor(stats.productivityScore)}`}>
            {stats.productivityScore}%
          </div>
          <p className="text-sm text-gray-500">Today's performance</p>
        </div>
      </div>

      {/* Total Time */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-medium text-gray-900">Total Time</h3>
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-3xl font-bold text-gray-900">
            {formatTime(stats.totalTime)}
          </div>
          <p className="text-sm text-gray-500">Time tracked today</p>
        </div>
      </div>

      {/* Productive Time */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-medium text-gray-900">Productive Time</h3>
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-3xl font-bold text-green-600">
            {formatTime(stats.productiveTime)}
          </div>
          <p className="text-sm text-gray-500">Focused work time</p>
        </div>
      </div>

      {/* Goal Progress */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-medium text-gray-900">Daily Goal</h3>
          </div>
        </div>
        <div className="space-y-3">
          <div className="text-3xl font-bold text-gray-900">
            {Math.round(goalProgress)}%
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(goalProgress, 100)}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500">
            {formatTime(stats.productiveTime)} / {formatTime(stats.goal)}
          </p>
        </div>
      </div>

      {showGoals && (
        <div className="md:col-span-2 lg:col-span-4 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Goal Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Daily Productive Time Goal
              </label>
              <div className="flex items-center space-x-2">
                <input 
                  type="range" 
                  min="120" 
                  max="720" 
                  step="30"
                  value={stats.goal}
                  className="flex-1"
                />
                <span className="text-sm font-medium text-gray-900 min-w-0">
                  {formatTime(stats.goal)}
                </span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weekly Target
              </label>
              <div className="text-2xl font-bold text-gray-900">
                {formatTime(stats.goal * 5)} {/* 5 work days */}
              </div>
              <p className="text-sm text-gray-500">Monday - Friday</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductivityScore;