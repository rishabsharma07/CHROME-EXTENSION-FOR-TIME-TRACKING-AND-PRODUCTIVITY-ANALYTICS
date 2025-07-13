import React from 'react';
import { Calendar, TrendingUp, Award, Clock, Target } from 'lucide-react';

interface WeeklyReportProps {
  data: any;
}

const WeeklyReport: React.FC<WeeklyReportProps> = ({ data }) => {
  const generateWeeklyReport = () => {
    const thisWeek = getCurrentWeekKey();
    const weekData = data.weeklyData[thisWeek] || {};
    
    let totalTime = 0;
    let productiveTime = 0;
    let unproductiveTime = 0;
    let neutralTime = 0;
    
    const websiteStats: Array<{
      website: string;
      time: number;
      category: string;
      percentage: number;
    }> = [];

    for (const [website, time] of Object.entries(weekData)) {
      const timeInSeconds = time as number;
      totalTime += timeInSeconds;
      
      const category = getWebsiteCategory(website);
      if (category === 'productive') {
        productiveTime += timeInSeconds;
      } else if (category === 'unproductive') {
        unproductiveTime += timeInSeconds;
      } else {
        neutralTime += timeInSeconds;
      }
      
      websiteStats.push({
        website,
        time: timeInSeconds,
        category,
        percentage: 0 // Will be calculated after totalTime is known
      });
    }

    // Calculate percentages and sort
    websiteStats.forEach(stat => {
      stat.percentage = totalTime > 0 ? (stat.time / totalTime) * 100 : 0;
    });
    websiteStats.sort((a, b) => b.time - a.time);

    const productivityScore = totalTime > 0 ? Math.round((productiveTime / totalTime) * 100) : 0;
    
    return {
      totalTime: Math.floor(totalTime / 60), // Convert to minutes
      productiveTime: Math.floor(productiveTime / 60),
      unproductiveTime: Math.floor(unproductiveTime / 60),
      neutralTime: Math.floor(neutralTime / 60),
      productivityScore,
      websiteStats: websiteStats.slice(0, 10), // Top 10 websites
      weekKey: thisWeek
    };
  };

  const getCurrentWeekKey = () => {
    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const weekNumber = Math.ceil(((now.getTime() - yearStart.getTime()) / 86400000 + yearStart.getDay() + 1) / 7);
    return `${now.getFullYear()}-${weekNumber.toString().padStart(2, '0')}`;
  };

  const getWebsiteCategory = (website: string) => {
    if (data.settings.categories.productive.some((site: string) => website.includes(site))) {
      return 'productive';
    } else if (data.settings.categories.unproductive.some((site: string) => website.includes(site))) {
      return 'unproductive';
    }
    return 'neutral';
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'productive':
        return 'text-green-600 bg-green-100';
      case 'unproductive':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-yellow-600 bg-yellow-100';
    }
  };

  const report = generateWeeklyReport();
  const weekGoal = data.settings.productiveGoal * 5; // 5 work days
  const goalProgress = (report.productiveTime / weekGoal) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Weekly Productivity Report</h2>
            <p className="text-sm text-gray-500">Week {report.weekKey}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Weekly Score */}
          <div className="text-center">
            <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${getScoreBackground(report.productivityScore)} flex items-center justify-center mb-3`}>
              <Award className="w-8 h-8 text-white" />
            </div>
            <div className={`text-2xl font-bold ${getScoreColor(report.productivityScore)} mb-1`}>
              {report.productivityScore}%
            </div>
            <p className="text-sm text-gray-500">Productivity Score</p>
          </div>

          {/* Total Time */}
          <div className="text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center mb-3">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {formatTime(report.totalTime)}
            </div>
            <p className="text-sm text-gray-500">Total Time</p>
          </div>

          {/* Productive Time */}
          <div className="text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center mb-3">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div className="text-2xl font-bold text-green-600 mb-1">
              {formatTime(report.productiveTime)}
            </div>
            <p className="text-sm text-gray-500">Productive Time</p>
          </div>

          {/* Goal Progress */}
          <div className="text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center mb-3">
              <Target className="w-8 h-8 text-white" />
            </div>
            <div className="text-2xl font-bold text-indigo-600 mb-1">
              {Math.round(goalProgress)}%
            </div>
            <p className="text-sm text-gray-500">Goal Progress</p>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Time Distribution</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Productive</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {formatTime(report.productiveTime)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${(report.productiveTime / report.totalTime) * 100}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Unproductive</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {formatTime(report.unproductiveTime)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-red-500 h-2 rounded-full"
                style={{ width: `${(report.unproductiveTime / report.totalTime) * 100}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Neutral</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {formatTime(report.neutralTime)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-yellow-500 h-2 rounded-full"
                style={{ width: `${(report.neutralTime / report.totalTime) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Top Websites */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Websites This Week</h3>
          <div className="space-y-3">
            {report.websiteStats.map((site, index) => (
              <div key={site.website} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600">
                    {index + 1}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {site.website}
                    </p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${getCategoryColor(site.category)}`}>
                      {site.category}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          site.category === 'productive' ? 'bg-green-500' :
                          site.category === 'unproductive' ? 'bg-red-500' : 'bg-yellow-500'
                        }`}
                        style={{ width: `${site.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 min-w-0">
                      {formatTime(Math.floor(site.time / 60))}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Achievements</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              {report.productivityScore >= 70 && (
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Great productivity score this week!</span>
                </li>
              )}
              {goalProgress >= 80 && (
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Weekly goal almost achieved</span>
                </li>
              )}
              {report.productiveTime > report.unproductiveTime && (
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>More productive than unproductive time</span>
                </li>
              )}
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Recommendations</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              {report.productivityScore < 50 && (
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>Try to reduce time on unproductive websites</span>
                </li>
              )}
              {goalProgress < 70 && (
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>Increase daily productive time to meet weekly goals</span>
                </li>
              )}
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Consider using website blocking during focus time</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyReport;