import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router';

const FaqBasicItem = ({ faq, isLast }) => {
  return (
    <>
      <h6>
        <Link to="#!">
          {faq.title}
          <FontAwesomeIcon icon="caret-right" className="ms-2" />
        </Link>
      </h6>
      <p className="fs-10 mb-0">{faq.description}</p>
      {!isLast && <hr className="my-3" />}
    </>
  );
};

export default FaqBasicItem;
