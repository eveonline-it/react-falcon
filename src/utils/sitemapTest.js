// Sitemap diagnostic utility for browser console
// Usage: Copy and paste this entire code into browser console, then call testSitemap()

window.testSitemap = async function() {
  console.log('🔍 Starting sitemap diagnostics...');
  
  try {
    // Test 1: Direct API call
    console.log('1️⃣ Testing direct API call...');
    const response = await fetch('https://go.eveonline.it/sitemap', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }
    
    const apiData = await response.json();
    console.log('✅ Direct API response:', apiData);
    console.log(`📊 Navigation groups found: ${apiData.navigation?.length || 0}`);
    console.log(`📊 Routes found: ${apiData.routes?.length || 0}`);
    
    // Test 2: Check if sitemap service is available
    console.log('2️⃣ Testing sitemap service...');
    
    // Import sitemap service - this will work if running in the React app context
    if (window.React && window.sitemapService) {
      const sitemapService = window.sitemapService;
      
      console.log('3️⃣ Testing sitemapService.fetchSitemap()...');
      const serviceData = await sitemapService.fetchSitemap();
      console.log('✅ Service data:', serviceData);
      
      console.log('4️⃣ Testing sitemapService.generateRouteGroups()...');
      const routeGroups = await sitemapService.generateRouteGroups();
      console.log('✅ Generated route groups:', routeGroups);
      console.log(`📊 Route groups generated: ${routeGroups?.length || 0}`);
      
      // Show first group as example
      if (routeGroups && routeGroups.length > 0) {
        console.log('📋 First route group example:', routeGroups[0]);
      }
      
    } else {
      console.log('⚠️ sitemap service not available in window object');
      
      // Try to access from React context if available
      console.log('5️⃣ Attempting manual navigation processing...');
      
      if (apiData.navigation) {
        const processedNavigation = apiData.navigation.map(group => ({
          label: group.label,
          labelDisable: group.labelDisable,
          children: group.children.map(item => ({
            name: item.name,
            to: item.to,
            icon: item.icon,
            active: item.active !== false
          }))
        }));
        
        console.log('✅ Manually processed navigation:', processedNavigation);
        console.log(`📊 Processed groups: ${processedNavigation.length}`);
      }
    }
    
    return {
      success: true,
      apiData,
      message: 'Diagnostics completed successfully'
    };
    
  } catch (error) {
    console.error('❌ Diagnostic error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Also add the service to window for easy access
if (typeof module !== 'undefined' && module.exports) {
  // Node.js environment, make available
  module.exports = { testSitemap: window.testSitemap };
} else {
  console.log('🚀 Sitemap test utility loaded. Run testSitemap() to diagnose navigation issues.');
}