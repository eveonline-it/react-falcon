import React, { useState } from 'react';
import { Button, Card, Col, Row } from 'react-bootstrap';
import { Link } from 'react-router';
import editing from 'assets/img/icons/spot-illustrations/21.png';
import paths from 'routes/paths';
import SitemapDebug from 'components/debug/SitemapDebug';

const Starter: React.FC = () => {
  const [showDebug, setShowDebug] = useState(false);

  return (
    <>
      <Card>
        <Card.Body className="overflow-hidden p-lg-6">
          <Row className="align-items-center justify-content-between">
            <Col lg={6}>
              <img src={editing} className="img-fluid" alt="" />
            </Col>
            <Col lg={6} className="ps-lg-4 my-5 text-center text-lg-start">
              <h3 className="text-primary">Edit me!</h3>
              <p className="lead">Create Something Beautiful.</p>
              <div className="d-grid gap-2 d-md-flex justify-content-md-start">
                <Button
                  variant="falcon-primary"
                  as={Link}
                  to={paths.gettingStarted}
                >
                  Getting started
                </Button>
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowDebug(!showDebug)}
                >
                  {showDebug ? '🔧 Hide' : '🧪 Test'} Sitemap
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {showDebug && (
        <div className="mt-4">
          <SitemapDebug />
        </div>
      )}
    </>
  );
};

export default Starter;
