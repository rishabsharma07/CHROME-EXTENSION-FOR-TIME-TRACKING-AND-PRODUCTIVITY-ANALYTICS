import React, { useEffect, useRef } from 'react';

interface TimeChartProps {
  data: any;
  detailed?: boolean;
}

const TimeChart: React.FC<TimeChartProps> = ({ data, detailed = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    drawChart();
  }, [data, detailed]);

  const drawChart = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const canvasWidth = canvas.offsetWidth;
    const canvasHeight = canvas.offsetHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Prepare data for last 7 days
    const chartData = getLast7DaysData();
    
    if (chartData.length === 0) return;

    // Chart dimensions
    const padding = { top: 20, right: 20, bottom: 60, left: 60 };
    const chartWidth = canvasWidth - padding.left - padding.right;
    const chartHeight = canvasHeight - padding.top - padding.bottom;

    // Find max value for scaling
    const maxValue = Math.max(...chartData.map(d => Math.max(d.productive, d.unproductive, d.neutral)));
    const yScale = chartHeight / (maxValue * 1.1); // Add 10% padding

    // Bar width
    const barWidth = chartWidth / (chartData.length * 3 + chartData.length - 1);
    const barSpacing = barWidth * 0.2;

    // Colors
    const colors = {
      productive: '#10B981',
      unproductive: '#EF4444',
      neutral: '#F59E0B'
    };

    // Draw bars
    chartData.forEach((dayData, index) => {
      const x = padding.left + index * (barWidth * 3 + barSpacing * 4);
      
      // Productive bar
      const productiveHeight = dayData.productive * yScale;
      ctx.fillStyle = colors.productive;
      ctx.fillRect(x, padding.top + chartHeight - productiveHeight, barWidth, productiveHeight);

      // Unproductive bar
      const unproductiveHeight = dayData.unproductive * yScale;
      ctx.fillStyle = colors.unproductive;
      ctx.fillRect(x + barWidth + barSpacing, padding.top + chartHeight - unproductiveHeight, barWidth, unproductiveHeight);

      // Neutral bar
      const neutralHeight = dayData.neutral * yScale;
      ctx.fillStyle = colors.neutral;
      ctx.fillRect(x + (barWidth + barSpacing) * 2, padding.top + chartHeight - neutralHeight, barWidth, neutralHeight);

      // Day label
      ctx.fillStyle = '#6B7280';
      ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'center';
      const labelX = x + (barWidth * 3 + barSpacing * 2) / 2;
      ctx.fillText(dayData.label, labelX, padding.top + chartHeight + 20);
    });

    // Draw Y-axis labels
    ctx.fillStyle = '#6B7280';
    ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'right';

    for (let i = 0; i <= 5; i++) {
      const value = (maxValue * i) / 5;
      const y = padding.top + chartHeight - (value * yScale);
      ctx.fillText(`${Math.round(value / 60)}h`, padding.left - 10, y + 4);

      // Draw grid lines
      if (i > 0) {
        ctx.strokeStyle = '#E5E7EB';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(padding.left + chartWidth, y);
        ctx.stroke();
      }
    }

    // Draw legend
    const legendY = canvasHeight - 20;
    const legendItems = [
      { label: 'Productive', color: colors.productive },
      { label: 'Unproductive', color: colors.unproductive },
      { label: 'Neutral', color: colors.neutral }
    ];

    let legendX = padding.left;
    legendItems.forEach(item => {
      ctx.fillStyle = item.color;
      ctx.fillRect(legendX, legendY - 10, 12, 12);
      
      ctx.fillStyle = '#374151';
      ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(item.label, legendX + 18, legendY);
      
      legendX += ctx.measureText(item.label).width + 50;
    });
  };

  const getLast7DaysData = () => {
    const result = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      const dayData = data.dailyData[dateKey] || {};

      let productive = 0;
      let unproductive = 0;
      let neutral = 0;

      for (const [website, time] of Object.entries(dayData)) {
        if (data.settings.categories.productive.some((site: string) => website.includes(site))) {
          productive += time as number;
        } else if (data.settings.categories.unproductive.some((site: string) => website.includes(site))) {
          unproductive += time as number;
        } else {
          neutral += time as number;
        }
      }

      result.push({
        label: date.toLocaleDateString('en', { weekday: 'short' }),
        date: dateKey,
        productive,
        unproductive,
        neutral
      });
    }

    return result;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          {detailed ? 'Detailed Time Tracking' : '7-Day Time Overview'}
        </h3>
        {detailed && (
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">Productive</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-gray-600">Unproductive</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-gray-600">Neutral</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="relative">
        <canvas 
          ref={canvasRef}
          className="w-full"
          style={{ height: detailed ? '400px' : '300px' }}
        />
      </div>
    </div>
  );
};

export default TimeChart;