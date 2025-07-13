// Popup script for displaying current stats
document.addEventListener('DOMContentLoaded', async () => {
  // Show loading initially
  document.getElementById('loading').classList.remove('hidden');
  document.getElementById('stats').classList.add('hidden');
  
  await loadStats();
  
  // Add event listeners
  document.getElementById('dashboard-btn').addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('dashboard.html') });
  });
  
  document.getElementById('settings-btn').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
});

async function loadStats() {
  try {
    // Get current stats from background script
    const stats = await new Promise((resolve) => {
      chrome.runtime.sendMessage({ action: 'getCurrentStats' }, resolve);
    });
    
    if (stats) {
      displayStats(stats);
    }
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

function displayStats(stats) {
  document.getElementById('loading').classList.add('hidden');
  document.getElementById('stats').classList.remove('hidden');
  
  // Update current site status
  const siteStatus = document.getElementById('site-status');
  if (stats.currentWebsite) {
    siteStatus.textContent = `Tracking: ${stats.currentWebsite}`;
    siteStatus.className = `category-${getCategoryClass(stats.currentWebsite)}`;
  } else {
    siteStatus.textContent = 'Not currently tracking';
    siteStatus.className = '';
  }
  
  // Update time displays
  document.getElementById('total-time').textContent = formatTime(stats.totalTime);
  document.getElementById('productive-time').textContent = formatTime(stats.productiveTime);
  document.getElementById('productivity-score').textContent = `${stats.productivityScore}%`;
  
  // Update progress bar
  const progressFill = document.getElementById('progress-fill');
  const progressPercentage = Math.min((stats.productiveTime / stats.goal) * 100, 100);
  progressFill.style.width = `${progressPercentage}%`;
}

function formatTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

function getCategoryClass(website) {
  // Simple category detection (would normally use background script)
  const productive = ['github', 'stackoverflow', 'developer.mozilla'];
  const unproductive = ['facebook', 'twitter', 'instagram', 'youtube'];
  
  if (productive.some(site => website.includes(site))) return 'productive';
  if (unproductive.some(site => website.includes(site))) return 'unproductive';
  return 'neutral';
}