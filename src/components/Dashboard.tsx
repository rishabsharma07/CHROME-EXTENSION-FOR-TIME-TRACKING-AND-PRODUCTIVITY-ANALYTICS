import React, { useState, useEffect } from 'react';
import { BarChart3, Clock, Target, TrendingUp, Calendar, Settings, Download } from 'lucide-react';
import TimeChart from './TimeChart';
import ProductivityScore from './ProductivityScore';
import WebsiteBreakdown from './WebsiteBreakdown';
import WeeklyReport from './WeeklyReport';

interface DashboardData {
  dailyData: Record<string, Record<string, number>>;
  weeklyData: Record<string, Record<string, number>>;
  settings: {
    productiveGoal: number;
    trackingEnabled: boolean;
    categories: Record<string, string[]>;
  };
}

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Simulate loading Chrome extension data
      // In a real implementation, this would communicate with the extension
      const mockData: DashboardData = {
        dailyData: generateMockDailyData(),
        weeklyData: generateMockWeeklyData(),
        settings: {
          productiveGoal: 480, // 8 hours in minutes
          trackingEnabled: true,
          categories: {
            productive: ['github.com', 'stackoverflow.com', 'developer.mozilla.org'],
            unproductive: ['facebook.com', 'twitter.com', 'youtube.com'],
            neutral: ['google.com', 'gmail.com']
          }
        }
      };
      
      setData(mockData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockDailyData = () => {
    const dailyData: Record<string, Record<string, number>> = {};
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      
      dailyData[dateKey] = {
        'github.com': Math.floor(Math.random() * 7200) + 1800, // 30 min to 2 hours
        'stackoverflow.com': Math.floor(Math.random() * 3600) + 900, // 15 min to 1 hour
        'youtube.com': Math.floor(Math.random() * 5400) + 600, // 10 min to 1.5 hours
        'facebook.com': Math.floor(Math.random() * 1800) + 300, // 5 min to 30 min
        'google.com': Math.floor(Math.random() * 1200) + 180, // 3 min to 20 min
      };
    }
    
    return dailyData;
  };

  const generateMockWeeklyData = () => {
    const weeklyData: Record<string, Record<string, number>> = {};
    const thisWeek = getCurrentWeekKey();
    
    weeklyData[thisWeek] = {
      'github.com': 25200, // 7 hours
      'stackoverflow.com': 10800, // 3 hours
      'developer.mozilla.org': 7200, // 2 hours
      'youtube.com': 14400, // 4 hours
      'facebook.com': 5400, // 1.5 hours
      'twitter.com': 3600, // 1 hour
      'google.com': 1800, // 30 minutes
    };
    
    return weeklyData;
  };

  const getCurrentWeekKey = () => {
    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const weekNumber = Math.ceil(((now.getTime() - yearStart.getTime()) / 86400000 + yearStart.getDay() + 1) / 7);
    return `${now.getFullYear()}-${weekNumber.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your productivity data...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Unable to load data. Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'time', label: 'Time Tracking', icon: Clock },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'reports', label: 'Reports', icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Productivity Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <button className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <ProductivityScore data={data} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <TimeChart data={data} />
              <WebsiteBreakdown data={data} />
            </div>
          </div>
        )}
        
        {activeTab === 'time' && (
          <div className="space-y-8">
            <TimeChart data={data} detailed={true} />
          </div>
        )}
        
        {activeTab === 'goals' && (
          <div className="space-y-8">
            <ProductivityScore data={data} showGoals={true} />
          </div>
        )}
        
        {activeTab === 'reports' && (
          <div className="space-y-8">
            <WeeklyReport data={data} />
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;