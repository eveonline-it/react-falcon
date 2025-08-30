import { useState, ReactNode } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';

interface FalconLightBoxProps {
  image: string;
  children: ReactNode;
}

const FalconLightBox = ({ image, children }: FalconLightBoxProps) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <div className="cursor-pointer" onClick={() => setIsOpen(true)}>
        {children}
      </div>
      {isOpen && (
        <Lightbox
          slides={[{ src: image }]}
          open={isOpen}
          close={() => setIsOpen(false)}
          styles={{ container: { zIndex: 999999 } }}
          on={{
            view: () => {
              window.dispatchEvent(new Event('resize'));
            }
          }}
        />
      )}
    </>
  );
};

export default FalconLightBox;
