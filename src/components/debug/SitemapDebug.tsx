import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Accordion } from 'react-bootstrap';
import { loadDynamicRouteGroups, getRouteGroups } from 'routes/siteMaps';
import { sitemapService } from 'services/sitemapService';
import type { RouteGroup } from 'routes/siteMaps';

const SitemapDebug: React.FC = () => {
  const [dynamicRoutes, setDynamicRoutes] = useState<RouteGroup[] | null>(null);
  const [staticRoutes, setStaticRoutes] = useState<RouteGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<string | null>(null);

  useEffect(() => {
    // Get current static routes for comparison
    setStaticRoutes(getRouteGroups());
  }, []);

  const handleLoadDynamic = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const routes = await loadDynamicRouteGroups();
      setDynamicRoutes(routes);
      setLastFetch(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleClearCache = () => {
    sitemapService.clearCache();
    setLastFetch(null);
  };

  const countRoutes = (routes: RouteGroup[]): number => {
    return routes.reduce((total, group) => {
      const childrenCount = group.children.reduce((childTotal, child) => {
        return childTotal + 1 + (child.children?.length || 0);
      }, 0);
      return total + childrenCount;
    }, 0);
  };

  const renderRouteGroup = (group: RouteGroup, index: number) => (
    <Accordion.Item eventKey={index.toString()} key={group.label}>
      <Accordion.Header>
        <strong>{group.label}</strong>
        <Badge bg="secondary" className="ms-2">
          {group.children.length} items
        </Badge>
      </Accordion.Header>
      <Accordion.Body>
        {group.children.map((child, childIndex) => (
          <div key={childIndex} className="mb-2">
            <div className="d-flex align-items-center">
              {child.icon && <i className={`fas fa-${child.icon} me-2`}></i>}
              <strong>{child.name}</strong>
              {child.badge && (
                <Badge bg={child.badge.type} className="ms-2">
                  {child.badge.text}
                </Badge>
              )}
            </div>
            {child.to && (
              <small className="text-muted">Path: {child.to}</small>
            )}
            {child.children && (
              <div className="ms-3 mt-1">
                {child.children.map((subChild, subIndex) => (
                  <div key={subIndex} className="small">
                    • {subChild.name} {subChild.to && `(${subChild.to})`}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </Accordion.Body>
    </Accordion.Item>
  );

  return (
    <div className="p-4">
      <h2>🧪 Sitemap Debug Console</h2>
      
      <div className="row mb-4">
        <div className="col-md-6">
          <Card>
            <Card.Header>
              <h5>🔧 Controls</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button 
                  variant="primary" 
                  onClick={handleLoadDynamic}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Load Dynamic Routes'}
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={handleClearCache}
                >
                  Clear Cache
                </Button>
              </div>
              
              {lastFetch && (
                <div className="mt-3">
                  <small className="text-success">
                    Last fetch: {lastFetch}
                  </small>
                </div>
              )}
              
              {error && (
                <div className="mt-3 text-danger">
                  <strong>Error:</strong> {error}
                </div>
              )}
            </Card.Body>
          </Card>
        </div>
        
        <div className="col-md-6">
          <Card>
            <Card.Header>
              <h5>📊 Statistics</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-2">
                <strong>Static Routes:</strong> {staticRoutes.length} groups, {countRoutes(staticRoutes)} total routes
              </div>
              <div className="mb-2">
                <strong>Dynamic Routes:</strong> {dynamicRoutes ? `${dynamicRoutes.length} groups, ${countRoutes(dynamicRoutes)} total routes` : 'Not loaded'}
              </div>
              <div>
                <strong>Backend API:</strong> 
                <Badge bg="success" className="ms-2">https://go.eveonline.it/sitemap</Badge>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Route Comparison */}
      <div className="row">
        <div className="col-md-6">
          <Card>
            <Card.Header>
              <h5>📋 Static Routes (Fallback)</h5>
            </Card.Header>
            <Card.Body style={{ maxHeight: '500px', overflowY: 'auto' }}>
              <Accordion>
                {staticRoutes.map(renderRouteGroup)}
              </Accordion>
            </Card.Body>
          </Card>
        </div>
        
        <div className="col-md-6">
          <Card>
            <Card.Header>
              <h5>🌐 Dynamic Routes (Backend)</h5>
            </Card.Header>
            <Card.Body style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {dynamicRoutes ? (
                <Accordion>
                  {dynamicRoutes.map(renderRouteGroup)}
                </Accordion>
              ) : (
                <div className="text-center text-muted">
                  <p>No dynamic routes loaded</p>
                  <p>Click "Load Dynamic Routes" to fetch from backend</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SitemapDebug;