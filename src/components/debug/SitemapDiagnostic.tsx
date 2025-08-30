import React, { useState, useEffect } from 'react';
import { sitemapService } from 'services/sitemapService';

const SitemapDiagnostic = () => {
  const [diagnostics, setDiagnostics] = useState({
    loading: true,
    error: null,
    rawSitemap: null,
    routeGroups: null,
    backendNavigation: null
  });

  useEffect(() => {
    const runDiagnostics = async () => {
      console.log('🔍 Running sitemap diagnostics...');
      
      try {
        // Test 1: Fetch raw sitemap data
        console.log('Test 1: Fetching raw sitemap data...');
        const rawSitemap = await sitemapService.fetchSitemap();
        console.log('Raw sitemap:', rawSitemap);
        
        // Test 2: Check navigation structure
        console.log('Test 2: Checking navigation structure...');
        const navigation = await sitemapService.getNavigationStructure();
        console.log('Navigation structure:', navigation);
        
        // Test 3: Generate route groups
        console.log('Test 3: Generating route groups...');
        const routeGroups = await sitemapService.generateRouteGroups();
        console.log('Generated route groups:', routeGroups);
        
        setDiagnostics({
          loading: false,
          error: null,
          rawSitemap,
          routeGroups,
          backendNavigation: navigation
        });
        
      } catch (error) {
        console.error('Diagnostic error:', error);
        setDiagnostics(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }));
      }
    };

    runDiagnostics();
  }, []);

  if (diagnostics.loading) {
    return <div>Running sitemap diagnostics...</div>;
  }

  if (diagnostics.error) {
    return <div style={{color: 'red'}}>Error: {diagnostics.error}</div>;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h3>Sitemap Diagnostics</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <h4>Raw Sitemap Data:</h4>
        <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', overflow: 'auto', maxHeight: '200px' }}>
          {JSON.stringify(diagnostics.rawSitemap, null, 2)}
        </pre>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h4>Backend Navigation Structure ({diagnostics.backendNavigation?.length || 0} groups):</h4>
        <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', overflow: 'auto', maxHeight: '200px' }}>
          {JSON.stringify(diagnostics.backendNavigation, null, 2)}
        </pre>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h4>Generated Route Groups ({diagnostics.routeGroups?.length || 0} groups):</h4>
        <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', overflow: 'auto', maxHeight: '200px' }}>
          {JSON.stringify(diagnostics.routeGroups, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default SitemapDiagnostic;