import React from 'react';
import className from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Card } from 'react-bootstrap';

// Types for Card Service component
interface MediaProps {
  icon: string;
  color?: string;
  className?: string;
}

interface CardServiceProps {
  media: MediaProps;
  title: string;
  description?: string;
  children?: React.ReactNode;
}

const CardService: React.FC<CardServiceProps> = ({ media, title, description, children }) => (
  <Card className="card-span h-100">
    <div className="card-span-img">
      <FontAwesomeIcon
        icon={media.icon}
        className={className(
          { [`text-${media.color}`]: media.color },
          media.className
        )}
      />
    </div>
    <Card.Body className="pt-6 pb-4">
      <h5 className="mb-2">{title}</h5>
      {description && <p>{description}</p>}
      {children}
    </Card.Body>
  </Card>
);

export default CardService;
