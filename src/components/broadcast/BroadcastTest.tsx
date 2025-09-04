import React, { useState } from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { useBroadcastStore } from '../../stores/broadcastStore';

const BroadcastTest: React.FC = () => {
  const [testStatus, setTestStatus] = useState<string>('Ready');
  
  const runBasicTest = () => {
    setTestStatus('Running...');
    
    try {
      // Test 1: Store access
      const store = useBroadcastStore.getState();
      console.log('✅ Store access works');
      
      // Test 2: Basic state update
      store.setLoading(true);
      store.setLoading(false);
      console.log('✅ Basic state updates work');
      
      // Test 3: Notification creation
      store.addNotification('info', 'Test notification');
      console.log('✅ Notification creation works');
      
      // Test 4: Backend status simulation
      const testData = {
        type: 'backend_status' as const,
        overall_status: 'healthy' as const,
        system_metrics: {
          memory_usage: 500,
          cpu_usage: 25,
          active_connections: 10,
          uptime_formatted: '1h 30m'
        },
        services: {},
        alerts: []
      };
      
      store.handleBackendStatus(testData);
      console.log('✅ Backend status handling works');
      
      setTestStatus('✅ All tests passed!');
    } catch (error) {
      console.error('❌ Test failed:', error);
      setTestStatus(`❌ Test failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <Card>
      <Card.Header>
        <Card.Title className="mb-0">
          <i className="fas fa-flask me-2"></i>
          Broadcast Store Test
        </Card.Title>
      </Card.Header>
      <Card.Body>
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <p className="mb-2">Test the broadcast store functionality without WebSocket connection.</p>
            <Badge 
              bg={
                testStatus === 'Ready' ? 'secondary' : 
                testStatus === 'Running...' ? 'warning' : 
                testStatus.includes('✅') ? 'success' : 'danger'
              }
            >
              {testStatus}
            </Badge>
          </div>
          <Button 
            variant="primary" 
            onClick={runBasicTest}
            disabled={testStatus === 'Running...'}
          >
            <i className="fas fa-play me-1"></i>
            Run Test
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default BroadcastTest;