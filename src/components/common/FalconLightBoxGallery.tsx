import React, { useState } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';

const FalconLightBoxGallery = ({ images, children }) => {
  const [imgIndex, setImgIndex] = useState(null);
  return (
    <div>
      {children(setImgIndex)}
      {imgIndex !== null && (
        <Lightbox
          open={imgIndex !== null}
          close={() => setImgIndex(null)}
          slides={images.map((src) => ({ src }))}
          index={imgIndex ?? 0}
          styles={{ container: { zIndex: 999999 } }}
          on={{
            view: () => {
              window.dispatchEvent(new Event('resize'));
            },
            currentIndex: ({ index }) => {
              setImgIndex(index);
            }
          }}
        />
      )}
    </div>
  );
};

export default FalconLightBoxGallery;
