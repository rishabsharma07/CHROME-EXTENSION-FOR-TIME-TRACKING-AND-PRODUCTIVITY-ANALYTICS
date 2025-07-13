// Options page script
document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  setupEventListeners();
});

async function loadSettings() {
  const result = await chrome.storage.local.get(['settings']);
  const settings = result.settings || {};
  
  // Load basic settings
  document.getElementById('productive-goal').value = settings.productiveGoal || 8;
  document.getElementById('tracking-enabled').checked = settings.trackingEnabled !== false;
  
  // Load categories
  displayCategories(settings.categories || {});
}

function displayCategories(categories) {
  const categoryList = document.getElementById('category-list');
  categoryList.innerHTML = '';
  
  for (const [category, websites] of Object.entries(categories)) {
    websites.forEach(website => {
      const item = document.createElement('div');
      item.className = 'category-item';
      item.innerHTML = `
        <span class="category-badge category-${category}">${category}</span>
        <span style="flex: 1;">${website}</span>
        <button class="btn btn-secondary" style="padding: 4px 8px; font-size: 12px;" 
                onclick="removeWebsite('${category}', '${website}')">Remove</button>
      `;
      categoryList.appendChild(item);
    });
  }
}

function setupEventListeners() {
  document.getElementById('add-website').addEventListener('click', addWebsite);
  document.getElementById('save-settings').addEventListener('click', saveSettings);
  document.getElementById('export-data').addEventListener('click', exportData);
  document.getElementById('clear-data').addEventListener('click', clearData);
}

async function addWebsite() {
  const website = document.getElementById('new-website').value.trim();
  const category = document.getElementById('new-category').value;
  
  if (!website) return;
  
  const result = await chrome.storage.local.get(['settings']);
  const settings = result.settings || {};
  const categories = settings.categories || { productive: [], unproductive: [], neutral: [] };
  
  // Remove from other categories if exists
  for (const cat of Object.keys(categories)) {
    categories[cat] = categories[cat].filter(site => site !== website);
  }
  
  // Add to selected category
  if (!categories[category]) categories[category] = [];
  categories[category].push(website);
  
  // Update settings
  settings.categories = categories;
  await chrome.storage.local.set({ settings });
  
  // Refresh display
  displayCategories(categories);
  document.getElementById('new-website').value = '';
}

async function removeWebsite(category, website) {
  const result = await chrome.storage.local.get(['settings']);
  const settings = result.settings || {};
  const categories = settings.categories || {};
  
  if (categories[category]) {
    categories[category] = categories[category].filter(site => site !== website);
  }
  
  settings.categories = categories;
  await chrome.storage.local.set({ settings });
  
  displayCategories(categories);
}

async function saveSettings() {
  const productiveGoal = parseInt(document.getElementById('productive-goal').value) * 60; // Convert to minutes
  const trackingEnabled = document.getElementById('tracking-enabled').checked;
  
  const result = await chrome.storage.local.get(['settings']);
  const settings = result.settings || {};
  
  settings.productiveGoal = productiveGoal;
  settings.trackingEnabled = trackingEnabled;
  
  await chrome.storage.local.set({ settings });
  
  // Show success message
  const successMessage = document.getElementById('success-message');
  successMessage.style.display = 'block';
  setTimeout(() => {
    successMessage.style.display = 'none';
  }, 3000);
}

async function exportData() {
  const result = await chrome.storage.local.get(['dailyData', 'weeklyData', 'settings']);
  const data = {
    dailyData: result.dailyData || {},
    weeklyData: result.weeklyData || {},
    settings: result.settings || {},
    exportedAt: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `productivity-data-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  
  URL.revokeObjectURL(url);
}

async function clearData() {
  if (confirm('Are you sure you want to clear all tracking data? This cannot be undone.')) {
    await chrome.storage.local.clear();
    alert('All data has been cleared.');
    window.location.reload();
  }
}

// Make removeWebsite function global
window.removeWebsite = removeWebsite;