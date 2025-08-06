import Flex from 'components/common/Flex';
import { useState } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const getIconClassNames = type => {
  switch (type) {
    case 'youtube':
      return 'text-youtube';
    case 'zip':
      return 'text-warning';
    case 'doc':
      return 'text-primary';
    case 'img':
      return 'text-danger';
    case 'pdf':
      return 'text-danger';
    default:
      return 'text-primary';
  }
};

const EmailAttachment = ({ attachment }) => {
  const { fileName, icon, type, src } = attachment;
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Flex
      inline
      alignItems="center"
      className="border rounded-pill px-3 py-1 me-2 mt-2 inbox-link cursor-pointer"
      onClick={() => setIsOpen(!isOpen)}
    >
      {type === 'img' && (
        <Lightbox
          slides={[{ src }]}
          open={isOpen}
          styles={{ container: {zIndex: 999999} }}
          close={() => setIsOpen(false)}
        />
      )}
      <FontAwesomeIcon
        icon={icon}
        transform="grow-4"
        className={getIconClassNames(type)}
      />
      <span className="ms-2">{fileName}</span>
    </Flex>
  );
};

export default EmailAttachment;
