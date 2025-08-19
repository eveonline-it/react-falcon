import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

const TaskModal = ({ 
  show, 
  onHide, 
  task = null, 
  onSave,
  isLoading = false 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '',
    schedule: '',
    parameters: {},
    enabled: true,
    max_retries: 3,
    timeout: 300,
    priority: 5
  });
  const [errors, setErrors] = useState({});
  const [parametersText, setParametersText] = useState('');

  useEffect(() => {
    if (task) {
      setFormData({
        name: task.name || '',
        description: task.description || '',
        type: task.type || '',
        schedule: task.schedule || '',
        parameters: task.parameters || {},
        enabled: task.enabled ?? true,
        max_retries: task.max_retries || 3,
        timeout: task.timeout || 300,
        priority: task.priority || 5
      });
      setParametersText(JSON.stringify(task.parameters || {}, null, 2));
    } else {
      setFormData({
        name: '',
        description: '',
        type: '',
        schedule: '',
        parameters: {},
        enabled: true,
        max_retries: 3,
        timeout: 300,
        priority: 5
      });
      setParametersText('{}');
    }
    setErrors({});
  }, [task, show]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleParametersChange = (value) => {
    setParametersText(value);
    try {
      const parsed = JSON.parse(value);
      setFormData(prev => ({
        ...prev,
        parameters: parsed
      }));
      if (errors.parameters) {
        setErrors(prev => ({
          ...prev,
          parameters: null
        }));
      }
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        parameters: 'Invalid JSON format'
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Task name is required';
    }

    if (!formData.type.trim()) {
      newErrors.type = 'Task type is required';
    }

    if (!formData.schedule.trim()) {
      newErrors.schedule = 'Schedule is required';
    }

    // Validate cron expression (basic validation)
    const cronRegex = /^(\*|([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])|\*\/([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])) (\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|1[0-9]|2[0-9]|3[0-1])|\*\/([1-9]|1[0-9]|2[0-9]|3[0-1])) (\*|([1-9]|1[0-2])|\*\/([1-9]|1[0-2])) (\*|([0-6])|\*\/([0-6]))$/;
    if (formData.schedule && !cronRegex.test(formData.schedule) && !['@hourly', '@daily', '@weekly', '@monthly', '@yearly'].includes(formData.schedule)) {
      newErrors.schedule = 'Invalid cron expression or shorthand';
    }

    if (formData.max_retries < 0 || formData.max_retries > 10) {
      newErrors.max_retries = 'Max retries must be between 0 and 10';
    }

    if (formData.timeout < 1 || formData.timeout > 3600) {
      newErrors.timeout = 'Timeout must be between 1 and 3600 seconds';
    }

    if (formData.priority < 1 || formData.priority > 10) {
      newErrors.priority = 'Priority must be between 1 and 10';
    }

    try {
      JSON.parse(parametersText);
    } catch (error) {
      newErrors.parameters = 'Invalid JSON format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    try {
      await onSave(formData);
      onHide();
      toast.success(task ? 'Task updated successfully' : 'Task created successfully');
    } catch (error) {
      toast.error(`Failed to save task: ${error.message}`);
    }
  };

  const taskTypes = [
    { value: 'data_sync', label: 'Data Synchronization' },
    { value: 'cleanup', label: 'Data Cleanup' },
    { value: 'backup', label: 'Backup' },
    { value: 'report', label: 'Report Generation' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'notification', label: 'Notification' },
    { value: 'custom', label: 'Custom Script' }
  ];

  const scheduleExamples = [
    { value: '0 0 * * *', label: 'Daily at midnight' },
    { value: '0 */6 * * *', label: 'Every 6 hours' },
    { value: '0 9 * * 1-5', label: 'Weekdays at 9 AM' },
    { value: '0 0 1 * *', label: 'Monthly on 1st' },
    { value: '@hourly', label: 'Every hour' },
    { value: '@daily', label: 'Every day' },
    { value: '@weekly', label: 'Every week' }
  ];

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {task ? 'Edit Task' : 'Create New Task'}
        </Modal.Title>
      </Modal.Header>
      
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Task Name *</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  isInvalid={!!errors.name}
                  placeholder="Enter task name"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.name}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Task Type *</Form.Label>
                <Form.Select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  isInvalid={!!errors.type}
                >
                  <option value="">Select task type</option>
                  {taskTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.type}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Optional description of what this task does"
            />
          </Form.Group>

          <Row>
            <Col md={8}>
              <Form.Group className="mb-3">
                <Form.Label>Schedule (Cron Expression) *</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.schedule}
                  onChange={(e) => handleInputChange('schedule', e.target.value)}
                  isInvalid={!!errors.schedule}
                  placeholder="0 0 * * * or @daily"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.schedule}
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  Format: minute hour day month weekday (e.g., "0 9 * * 1-5" for weekdays at 9 AM)
                </Form.Text>
              </Form.Group>
            </Col>
            
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Quick Examples</Form.Label>
                <Form.Select
                  value=""
                  onChange={(e) => handleInputChange('schedule', e.target.value)}
                >
                  <option value="">Select example</option>
                  {scheduleExamples.map((example, index) => (
                    <option key={index} value={example.value}>
                      {example.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Max Retries</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  max="10"
                  value={formData.max_retries}
                  onChange={(e) => handleInputChange('max_retries', parseInt(e.target.value))}
                  isInvalid={!!errors.max_retries}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.max_retries}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Timeout (seconds)</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  max="3600"
                  value={formData.timeout}
                  onChange={(e) => handleInputChange('timeout', parseInt(e.target.value))}
                  isInvalid={!!errors.timeout}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.timeout}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Priority (1-10)</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  max="10"
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', parseInt(e.target.value))}
                  isInvalid={!!errors.priority}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.priority}
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  Higher numbers = higher priority
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Parameters (JSON)</Form.Label>
            <Form.Control
              as="textarea"
              rows={6}
              value={parametersText}
              onChange={(e) => handleParametersChange(e.target.value)}
              isInvalid={!!errors.parameters}
              placeholder='{"key": "value", "option": true}'
              style={{ fontFamily: 'monospace' }}
            />
            <Form.Control.Feedback type="invalid">
              {errors.parameters}
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
              Task-specific configuration parameters in JSON format
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              label="Enable task immediately"
              checked={formData.enabled}
              onChange={(e) => handleInputChange('enabled', e.target.checked)}
            />
          </Form.Group>

          {Object.keys(errors).length > 0 && (
            <Alert variant="danger">
              Please fix the following errors:
              <ul className="mb-0 mt-2">
                {Object.entries(errors).map(([field, error]) => (
                  <li key={field}>{error}</li>
                ))}
              </ul>
            </Alert>
          )}
        </Modal.Body>
        
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            <FontAwesomeIcon icon={faTimes} className="me-2" />
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={isLoading}>
            {isLoading ? (
              <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
            ) : (
              <FontAwesomeIcon icon={faSave} className="me-2" />
            )}
            {task ? 'Update Task' : 'Create Task'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default TaskModal;