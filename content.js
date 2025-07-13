// Content script for additional tracking and website interaction
let lastActiveTime = Date.now();
let isPageVisible = !document.hidden;

// Track page visibility changes
document.addEventListener('visibilitychange', () => {
  isPageVisible = !document.hidden;
  
  if (isPageVisible) {
    lastActiveTime = Date.now();
  }
  
  // Send visibility change to background script
  chrome.runtime.sendMessage({
    action: 'visibilityChange',
    visible: isPageVisible,
    domain: window.location.hostname.replace('www.', '')
  });
});

// Track user activity (mouse movement, clicks, scrolling)
let activityTimer = null;

function resetActivityTimer() {
  lastActiveTime = Date.now();
  clearTimeout(activityTimer);
  
  // Consider user idle after 30 seconds of inactivity
  activityTimer = setTimeout(() => {
    chrome.runtime.sendMessage({
      action: 'userIdle',
      domain: window.location.hostname.replace('www.', '')
    });
  }, 30000);
}

// Add activity listeners
['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
  document.addEventListener(event, resetActivityTimer, { passive: true });
});

// Initial activity timer
resetActivityTimer();

// Inject productivity banner for unproductive sites
function injectProductivityBanner() {
  const domain = window.location.hostname.replace('www.', '');
  
  // Check if this is an unproductive site
  chrome.runtime.sendMessage({ action: 'checkCategory', domain }, (response) => {
    if (response && response.category === 'unproductive') {
      showProductivityReminder();
    }
  });
}

function showProductivityReminder() {
  // Only show if banner doesn't already exist
  if (document.getElementById('productivity-banner')) return;
  
  const banner = document.createElement('div');
  banner.id = 'productivity-banner';
  banner.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: linear-gradient(135deg, #EF4444, #DC2626);
    color: white;
    padding: 8px 16px;
    text-align: center;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    font-weight: 500;
    z-index: 10000;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    transform: translateY(-100%);
    transition: transform 0.3s ease;
  `;
  
  banner.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; gap: 12px;">
      <span>⏰ This site is marked as unproductive</span>
      <button id="dismiss-banner" style="
        background: rgba(255,255,255,0.2);
        border: none;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
      ">Dismiss</button>
    </div>
  `;
  
  document.body.appendChild(banner);
  
  // Animate banner in
  setTimeout(() => {
    banner.style.transform = 'translateY(0)';
  }, 100);
  
  // Add dismiss functionality
  document.getElementById('dismiss-banner').addEventListener('click', () => {
    banner.style.transform = 'translateY(-100%)';
    setTimeout(() => {
      banner.remove();
    }, 300);
  });
  
  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    if (banner.parentNode) {
      banner.style.transform = 'translateY(-100%)';
      setTimeout(() => {
        banner.remove();
      }, 300);
    }
  }, 5000);
}

// Initialize banner injection
setTimeout(injectProductivityBanner, 1000);