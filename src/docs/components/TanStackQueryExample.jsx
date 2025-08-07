import React, { useState } from 'react';
import { Card, Row, Col, Button, Spinner, Alert, Form } from 'react-bootstrap';
import { useUserProfile, useUpdateUserProfile } from 'hooks/useUserProfile';
import { useAnalyticsOverview, useRevenueData } from 'hooks/useAnalytics';
import { useInfiniteProducts, useFlattenedInfiniteData } from 'hooks/useInfiniteData';

const TanStackQueryExample = () => {
  const [selectedUserId, setSelectedUserId] = useState('1');
  const [timeRange, setTimeRange] = useState('30d');

  // Query Examples
  const {
    data: userProfile,
    isLoading: userLoading,
    error: userError,
    refetch: refetchUser,
  } = useUserProfile(selectedUserId);

  const {
    data: analytics,
    isLoading: analyticsLoading,
    error: analyticsError,
  } = useAnalyticsOverview();

  const {
    data: revenueData,
    isLoading: revenueLoading,
    error: revenueError,
  } = useRevenueData(timeRange);

  // Mutation Example
  const updateUserMutation = useUpdateUserProfile({
    onSuccess: () => {
      alert('User profile updated successfully!');
    },
    onError: (error) => {
      alert(`Failed to update profile: ${error.message}`);
    },
  });

  // Infinite Query Example
  const infiniteProductsQuery = useInfiniteProducts({ category: 'electronics' });
  const { flatData: products, hasNextPage, fetchNextPage, isFetchingNextPage } = 
    useFlattenedInfiniteData(infiniteProductsQuery);

  const handleUpdateUser = () => {
    updateUserMutation.mutate({
      userId: selectedUserId,
      userData: {
        name: 'Updated User Name',
        email: 'updated@example.com',
        lastUpdated: new Date().toISOString(),
      },
    });
  };

  return (
    <div>
      <Card className="mb-3">
        <Card.Header>
          <h4>TanStack Query (React Query) Examples</h4>
          <p className="mb-0 text-muted">
            Demonstrating data fetching, caching, synchronization, and mutations with TanStack Query
          </p>
        </Card.Header>
      </Card>

      <Row>
        {/* User Profile Query Example */}
        <Col lg={6} className="mb-3">
          <Card>
            <Card.Header>
              <h5>User Profile Query</h5>
              <Form.Select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                size="sm"
                className="w-auto"
              >
                <option value="1">User 1</option>
                <option value="2">User 2</option>
                <option value="3">User 3</option>
              </Form.Select>
            </Card.Header>
            <Card.Body>
              {userLoading && (
                <div className="d-flex align-items-center">
                  <Spinner size="sm" className="me-2" />
                  Loading user profile...
                </div>
              )}
              
              {userError && (
                <Alert variant="danger">
                  Error: {userError.message}
                </Alert>
              )}
              
              {userProfile && (
                <div>
                  <h6>{userProfile.name}</h6>
                  <p className="text-muted mb-2">{userProfile.email}</p>
                  <small className="text-muted">
                    Last updated: {new Date(userProfile.lastUpdated).toLocaleString()}
                  </small>
                </div>
              )}
              
              <div className="mt-3">
                <Button 
                  variant="outline-primary" 
                  size="sm" 
                  onClick={refetchUser}
                  disabled={userLoading}
                  className="me-2"
                >
                  Refetch
                </Button>
                <Button 
                  variant="primary" 
                  size="sm" 
                  onClick={handleUpdateUser}
                  disabled={updateUserMutation.isPending}
                >
                  {updateUserMutation.isPending ? 'Updating...' : 'Update Profile'}
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Analytics Query Example */}
        <Col lg={6} className="mb-3">
          <Card>
            <Card.Header>
              <h5>Analytics Overview</h5>
            </Card.Header>
            <Card.Body>
              {analyticsLoading && (
                <div className="d-flex align-items-center">
                  <Spinner size="sm" className="me-2" />
                  Loading analytics...
                </div>
              )}
              
              {analyticsError && (
                <Alert variant="danger">
                  Error: {analyticsError.message}
                </Alert>
              )}
              
              {analytics && (
                <Row>
                  <Col xs={6}>
                    <div className="text-center">
                      <h4 className="text-primary">{analytics.totalUsers}</h4>
                      <small className="text-muted">Total Users</small>
                    </div>
                  </Col>
                  <Col xs={6}>
                    <div className="text-center">
                      <h4 className="text-success">{analytics.totalRevenue}</h4>
                      <small className="text-muted">Revenue</small>
                    </div>
                  </Col>
                </Row>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Revenue Data with Time Range */}
        <Col lg={6} className="mb-3">
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Revenue Data</h5>
              <Form.Select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                size="sm"
                className="w-auto"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </Form.Select>
            </Card.Header>
            <Card.Body>
              {revenueLoading && (
                <div className="d-flex align-items-center">
                  <Spinner size="sm" className="me-2" />
                  Loading revenue data...
                </div>
              )}
              
              {revenueError && (
                <Alert variant="danger">
                  Error: {revenueError.message}
                </Alert>
              )}
              
              {revenueData && (
                <div>
                  <h4 className="text-success">${revenueData.total}</h4>
                  <p className="text-muted mb-0">
                    {revenueData.changePercent > 0 ? '+' : ''}{revenueData.changePercent}% 
                    from previous period
                  </p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Infinite Query Example */}
        <Col lg={6} className="mb-3">
          <Card>
            <Card.Header>
              <h5>Infinite Products List</h5>
              <small className="text-muted">Category: Electronics</small>
            </Card.Header>
            <Card.Body>
              {infiniteProductsQuery.isLoading && (
                <div className="d-flex align-items-center">
                  <Spinner size="sm" className="me-2" />
                  Loading products...
                </div>
              )}
              
              {infiniteProductsQuery.error && (
                <Alert variant="danger">
                  Error: {infiniteProductsQuery.error.message}
                </Alert>
              )}
              
              {products.length > 0 && (
                <div>
                  <div className="mb-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {products.map((product, index) => (
                      <div key={`${product.id}-${index}`} className="border-bottom py-2">
                        <h6 className="mb-1">{product.name}</h6>
                        <p className="text-muted mb-0 small">${product.price}</p>
                      </div>
                    ))}
                  </div>
                  
                  {hasNextPage && (
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                    >
                      {isFetchingNextPage ? 'Loading more...' : 'Load More'}
                    </Button>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Query Information */}
      <Card>
        <Card.Header>
          <h5>Query Information</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <h6>Features Demonstrated:</h6>
              <ul className="mb-0">
                <li>Basic queries with loading and error states</li>
                <li>Query invalidation and refetching</li>
                <li>Mutations with optimistic updates</li>
                <li>Infinite queries with pagination</li>
                <li>Query dependencies and dynamic parameters</li>
                <li>Automatic caching and background updates</li>
              </ul>
            </Col>
            <Col md={6}>
              <h6>Configuration:</h6>
              <ul className="mb-0">
                <li>5 minute stale time for basic queries</li>
                <li>10 minute garbage collection time</li>
                <li>Automatic retry on network errors</li>
                <li>No retry on 4xx client errors</li>
                <li>Background refetch on window focus disabled</li>
                <li>DevTools enabled in development mode</li>
              </ul>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
};

export default TanStackQueryExample;