document.getElementById('dashboard-btn').addEventListener('click', function(e) {
  e.preventDefault();
  
  // Show loading state
  document.getElementById('loading').style.display = 'block';
  this.style.display = 'none';
  
  // Try to open the Vite dev server dashboard
  const dashboardUrls = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000'
  ];
  
  // Try each URL until one works
  let urlIndex = 0;
  function tryNextUrl() {
    if (urlIndex < dashboardUrls.length) {
      const url = dashboardUrls[urlIndex];
      
      // Test if the URL is accessible
      fetch(url)
        .then(response => {
          if (response.ok) {
            window.open(url, '_blank');
            document.getElementById('loading').style.display = 'none';
            document.getElementById('dashboard-btn').style.display = 'inline-block';
          } else {
            throw new Error('URL not accessible');
          }
        })
        .catch(() => {
          urlIndex++;
          tryNextUrl();
        });
    } else {
      // If no dev server is found, show message
      document.getElementById('loading').innerHTML = `
        <p style="color: rgba(255, 255, 255, 0.8); font-size: 14px;">
          Dashboard server not running.<br>
          Please start the development server with <code style="background: rgba(255,255,255,0.2); padding: 2px 6px; border-radius: 4px;">npm run dev</code>
        </p>
      `;
      document.getElementById('dashboard-btn').style.display = 'inline-block';
    }
  }
  
  tryNextUrl();
});