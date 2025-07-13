import React from 'react';
import { ExternalLink, Clock, TrendingUp, TrendingDown } from 'lucide-react';

interface WebsiteBreakdownProps {
  data: any;
}

const WebsiteBreakdown: React.FC<WebsiteBreakdownProps> = ({ data }) => {
  const getTodayWebsiteData = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayData = data.dailyData[today] || {};
    
    return Object.entries(todayData)
      .map(([website, time]) => {
        const category = getWebsiteCategory(website);
        return {
          website,
          time: time as number,
          category,
          minutes: Math.floor((time as number) / 60)
        };
      })
      .sort((a, b) => b.time - a.time)
      .slice(0, 8); // Show top 8 websites
  };

  const getWebsiteCategory = (website: string) => {
    if (data.settings.categories.productive.some((site: string) => website.includes(site))) {
      return 'productive';
    } else if (data.settings.categories.unproductive.some((site: string) => website.includes(site))) {
      return 'unproductive';
    }
    return 'neutral';
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'productive':
        return <TrendingUp className="w-3 h-3" />;
      case 'unproductive':
        return <TrendingDown className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const websites = getTodayWebsiteData();
  const totalTime = websites.reduce((sum, site) => sum + site.minutes, 0);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Website Breakdown</h3>
        <span className="text-sm text-gray-500">Today</span>
      </div>

      {websites.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No website activity tracked today</p>
        </div>
      ) : (
        <div className="space-y-3">
          {websites.map((site, index) => {
            const percentage = totalTime > 0 ? (site.minutes / totalTime) * 100 : 0;
            
            return (
              <div key={site.website} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600">
                    {index + 1}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {site.website}
                    </p>
                    <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(site.category)}`}>
                      {getCategoryIcon(site.category)}
                      <span className="capitalize">{site.category}</span>
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          site.category === 'productive' ? 'bg-green-500' :
                          site.category === 'unproductive' ? 'bg-red-500' : 'bg-yellow-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 min-w-0">
                      {formatTime(site.minutes)}
                    </span>
                  </div>
                </div>
                
                <button className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {websites.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-gray-900">Total tracked time</span>
            <span className="font-semibold text-gray-900">{formatTime(totalTime)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebsiteBreakdown;