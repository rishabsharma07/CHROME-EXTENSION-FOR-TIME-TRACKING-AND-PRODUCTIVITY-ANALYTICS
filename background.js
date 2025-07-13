// Background script for tracking time and managing data
let activeTabId = null;
let currentWebsite = null;
let startTime = null;
let trackingInterval = null;

// Website categories for productivity classification
const websiteCategories = {
  productive: [
    'github.com', 'stackoverflow.com', 'developer.mozilla.org', 'codepen.io',
    'leetcode.com', 'hackerrank.com', 'coursera.org', 'udemy.com', 'khanacademy.org',
    'linkedin.com/learning', 'docs.google.com', 'notion.so', 'trello.com'
  ],
  unproductive: [
    'facebook.com', 'twitter.com', 'instagram.com', 'tiktok.com', 'snapchat.com',
    'reddit.com', 'youtube.com', 'netflix.com', 'twitch.tv', 'pinterest.com'
  ],
  neutral: [
    'google.com', 'bing.com', 'wikipedia.org', 'amazon.com', 'gmail.com'
  ]
};

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  initializeStorage();
  createAlarms();
});

// Initialize storage with default data
async function initializeStorage() {
  const result = await chrome.storage.local.get(['dailyData', 'weeklyData', 'settings']);
  
  if (!result.dailyData) {
    await chrome.storage.local.set({ dailyData: {} });
  }
  
  if (!result.weeklyData) {
    await chrome.storage.local.set({ weeklyData: {} });
  }
  
  if (!result.settings) {
    await chrome.storage.local.set({
      settings: {
        productiveGoal: 480, // 8 hours in minutes
        trackingEnabled: true,
        categories: websiteCategories
      }
    });
  }
}

// Create alarms for daily reset and reports
function createAlarms() {
  chrome.alarms.create('dailyReset', { when: getNextMidnight() });
  chrome.alarms.create('weeklyReport', { when: getNextSunday() });
}

// Get next midnight timestamp
function getNextMidnight() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime();
}

// Get next Sunday timestamp
function getNextSunday() {
  const now = new Date();
  const sunday = new Date(now);
  const daysUntilSunday = 7 - now.getDay();
  sunday.setDate(now.getDate() + daysUntilSunday);
  sunday.setHours(0, 0, 0, 0);
  return sunday.getTime();
}

// Handle tab activation
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  await stopTracking();
  await startTracking(activeInfo.tabId);
});

// Handle tab updates
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.active) {
    await stopTracking();
    await startTracking(tabId);
  }
});

// Handle window focus changes
chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    await stopTracking();
  } else {
    const tabs = await chrome.tabs.query({ active: true, windowId: windowId });
    if (tabs.length > 0) {
      await startTracking(tabs[0].id);
    }
  }
});

// Start tracking a website
async function startTracking(tabId) {
  try {
    const tab = await chrome.tabs.get(tabId);
    if (!tab.url || tab.url.startsWith('chrome://')) return;
    
    const url = new URL(tab.url);
    const domain = url.hostname.replace('www.', '');
    
    activeTabId = tabId;
    currentWebsite = domain;
    startTime = Date.now();
    
    // Update badge with current tracking status
    const category = getWebsiteCategory(domain);
    chrome.action.setBadgeText({ text: category.charAt(0).toUpperCase() });
    chrome.action.setBadgeBackgroundColor({ 
      color: category === 'productive' ? '#10B981' : 
             category === 'unproductive' ? '#EF4444' : '#F59E0B' 
    });
    
  } catch (error) {
    console.error('Error starting tracking:', error);
  }
}

// Stop tracking current website
async function stopTracking() {
  if (!currentWebsite || !startTime) return;
  
  const timeSpent = Math.floor((Date.now() - startTime) / 1000);
  if (timeSpent < 5) return; // Ignore very short visits
  
  await saveTimeData(currentWebsite, timeSpent);
  
  activeTabId = null;
  currentWebsite = null;
  startTime = null;
  
  chrome.action.setBadgeText({ text: '' });
}

// Save time data to storage
async function saveTimeData(website, timeSpent) {
  const today = new Date().toISOString().split('T')[0];
  const thisWeek = getWeekKey();
  
  // Get current data
  const result = await chrome.storage.local.get(['dailyData', 'weeklyData']);
  const dailyData = result.dailyData || {};
  const weeklyData = result.weeklyData || {};
  
  // Initialize daily data for today
  if (!dailyData[today]) {
    dailyData[today] = {};
  }
  
  // Initialize weekly data for this week
  if (!weeklyData[thisWeek]) {
    weeklyData[thisWeek] = {};
  }
  
  // Add time to daily data
  if (!dailyData[today][website]) {
    dailyData[today][website] = 0;
  }
  dailyData[today][website] += timeSpent;
  
  // Add time to weekly data
  if (!weeklyData[thisWeek][website]) {
    weeklyData[thisWeek][website] = 0;
  }
  weeklyData[thisWeek][website] += timeSpent;
  
  // Save updated data
  await chrome.storage.local.set({ dailyData, weeklyData });
}

// Get website category
function getWebsiteCategory(domain) {
  const settings = websiteCategories;
  
  for (const [category, websites] of Object.entries(settings)) {
    if (websites.some(site => domain.includes(site))) {
      return category;
    }
  }
  
  return 'neutral';
}

// Get week key (YYYY-WW format)
function getWeekKey() {
  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const weekNumber = Math.ceil(((now - yearStart) / 86400000 + yearStart.getDay() + 1) / 7);
  return `${now.getFullYear()}-${weekNumber.toString().padStart(2, '0')}`;
}

// Handle alarms
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'dailyReset') {
    await generateDailySummary();
    chrome.alarms.create('dailyReset', { when: getNextMidnight() });
  } else if (alarm.name === 'weeklyReport') {
    await generateWeeklyReport();
    chrome.alarms.create('weeklyReport', { when: getNextSunday() });
  }
});

// Generate daily summary
async function generateDailySummary() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const dateKey = yesterday.toISOString().split('T')[0];
  
  const result = await chrome.storage.local.get(['dailyData']);
  const dailyData = result.dailyData || {};
  const dayData = dailyData[dateKey] || {};
  
  let totalTime = 0;
  let productiveTime = 0;
  
  for (const [website, time] of Object.entries(dayData)) {
    totalTime += time;
    if (getWebsiteCategory(website) === 'productive') {
      productiveTime += time;
    }
  }
  
  // Store summary
  await chrome.storage.local.set({
    lastDailySummary: {
      date: dateKey,
      totalTime,
      productiveTime,
      productivityScore: totalTime > 0 ? Math.round((productiveTime / totalTime) * 100) : 0
    }
  });
}

// Generate weekly report
async function generateWeeklyReport() {
  const thisWeek = getWeekKey();
  const result = await chrome.storage.local.get(['weeklyData']);
  const weeklyData = result.weeklyData || {};
  const weekData = weeklyData[thisWeek] || {};
  
  let totalTime = 0;
  let productiveTime = 0;
  const categoryBreakdown = { productive: 0, unproductive: 0, neutral: 0 };
  
  for (const [website, time] of Object.entries(weekData)) {
    totalTime += time;
    const category = getWebsiteCategory(website);
    categoryBreakdown[category] += time;
    if (category === 'productive') {
      productiveTime += time;
    }
  }
  
  // Store weekly report
  await chrome.storage.local.set({
    lastWeeklyReport: {
      week: thisWeek,
      totalTime,
      productiveTime,
      categoryBreakdown,
      productivityScore: totalTime > 0 ? Math.round((productiveTime / totalTime) * 100) : 0,
      generatedAt: Date.now()
    }
  });
}

// Message handling
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getCurrentStats') {
    getCurrentStats().then(sendResponse);
    return true;
  } else if (request.action === 'getWeeklyData') {
    getWeeklyData().then(sendResponse);
    return true;
  }
});

// Get current stats
async function getCurrentStats() {
  const today = new Date().toISOString().split('T')[0];
  const result = await chrome.storage.local.get(['dailyData', 'settings']);
  const dailyData = result.dailyData || {};
  const settings = result.settings || {};
  const todayData = dailyData[today] || {};
  
  let totalTime = 0;
  let productiveTime = 0;
  
  for (const [website, time] of Object.entries(todayData)) {
    totalTime += time;
    if (getWebsiteCategory(website) === 'productive') {
      productiveTime += time;
    }
  }
  
  return {
    totalTime: Math.floor(totalTime / 60), // Convert to minutes
    productiveTime: Math.floor(productiveTime / 60),
    productivityScore: totalTime > 0 ? Math.round((productiveTime / totalTime) * 100) : 0,
    currentWebsite,
    goal: settings.productiveGoal || 480
  };
}

// Get weekly data
async function getWeeklyData() {
  const thisWeek = getWeekKey();
  const result = await chrome.storage.local.get(['weeklyData']);
  const weeklyData = result.weeklyData || {};
  const weekData = weeklyData[thisWeek] || {};
  
  const categoryData = { productive: 0, unproductive: 0, neutral: 0 };
  
  for (const [website, time] of Object.entries(weekData)) {
    const category = getWebsiteCategory(website);
    categoryData[category] += time;
  }
  
  return {
    productive: Math.floor(categoryData.productive / 60),
    unproductive: Math.floor(categoryData.unproductive / 60),
    neutral: Math.floor(categoryData.neutral / 60)
  };
}