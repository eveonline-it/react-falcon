import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export interface FolderFormData {
  name: string;
  parent_id: string | null;
  icon?: string;
}

interface FolderCreateModalProps {
  show: boolean;
  onHide: () => void;
  onSave: (data: FolderFormData) => void;
  parentId?: string | null;
  parentName?: string;
  isLoading?: boolean;
}

const FOLDER_ICON_OPTIONS = [
  'folder',
  'folder-open', 
  'archive',
  'box',
  'layer-group',
  'sitemap',
  'project-diagram',
  'network-wired',
  'cubes',
  'boxes',
  'briefcase',
  'clipboard-list',
  'tasks',
  'list-alt',
  'th-list'
];

const FolderCreateModal: React.FC<FolderCreateModalProps> = ({
  show,
  onHide,
  onSave,
  parentId = null,
  parentName,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<FolderFormData>({
    name: '',
    parent_id: parentId,
    icon: 'folder'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (show) {
      setFormData({
        name: '',
        parent_id: parentId,
        icon: 'folder'
      });
      setErrors({});
    }
  }, [show, parentId]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Folder name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Folder name must be at least 2 characters';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Folder name must be less than 50 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave({
        ...formData,
        name: formData.name.trim()
      });
    }
  };

  const handleNameChange = (value: string) => {
    setFormData({ ...formData, name: value });
    // Clear name error when user starts typing
    if (errors.name) {
      setErrors({ ...errors, name: '' });
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <FontAwesomeIcon icon="folder-plus" className="me-2 text-primary" />
          Create New Folder
        </Modal.Title>
      </Modal.Header>
      
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {parentName && (
            <Alert variant="info" className="mb-3">
              <FontAwesomeIcon icon="info-circle" className="me-2" />
              This folder will be created inside: <strong>{parentName}</strong>
            </Alert>
          )}

          <Form.Group className="mb-3">
            <Form.Label>
              Folder Name *
              <small className="text-muted ms-2">(2-50 characters)</small>
            </Form.Label>
            <Form.Control
              type="text"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Enter folder name..."
              isInvalid={!!errors.name}
              autoFocus
            />
            <Form.Control.Feedback type="invalid">
              {errors.name}
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
              Use a descriptive name like "User Management" or "Reports"
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Folder Icon</Form.Label>
            <div className="d-flex flex-wrap gap-2">
              {FOLDER_ICON_OPTIONS.map((iconName) => (
                <Button
                  key={iconName}
                  type="button"
                  variant={formData.icon === iconName ? 'primary' : 'outline-secondary'}
                  size="sm"
                  onClick={() => setFormData({ ...formData, icon: iconName })}
                  className="d-flex align-items-center"
                  style={{ minWidth: '45px', height: '35px' }}
                  title={iconName}
                >
                  <FontAwesomeIcon icon={iconName as any} />
                </Button>
              ))}
            </div>
            <Form.Text className="text-muted">
              Selected icon: <FontAwesomeIcon icon={formData.icon as any} className="me-1" />
              {formData.icon}
            </Form.Text>
          </Form.Group>

          {parentId && (
            <Form.Group className="mb-0">
              <Form.Label>Parent Information</Form.Label>
              <div className="p-2 bg-light rounded">
                <small className="text-muted">
                  <FontAwesomeIcon icon="folder" className="me-2" />
                  Parent ID: {parentId}
                  {parentName && (
                    <>
                      <br />
                      <FontAwesomeIcon icon="tag" className="me-2" />
                      Parent Name: {parentName}
                    </>
                  )}
                </small>
              </div>
            </Form.Group>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            type="submit" 
            disabled={isLoading || !formData.name.trim()}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" />
                Creating...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon="folder-plus" className="me-2" />
                Create Folder
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default FolderCreateModal;