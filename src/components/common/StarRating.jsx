import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Rating as ReactRating } from 'react-simple-star-rating';

const StarRating = ({ ...options }) => {
  return (
    <ReactRating
      allowFraction
      fillIcon={<FontAwesomeIcon icon="star" className="text-warning" />}
      emptyIcon={<FontAwesomeIcon icon="star" className="text-300" />}
      {...options}
    />
  );
};

export default StarRating;
