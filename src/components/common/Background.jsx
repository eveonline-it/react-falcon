import classNames from 'classnames';

const Background = ({ image, overlay, position, video, className, style }) => {
  const bgStyle = { backgroundImage: `url(${image})`, ...style };
  if (typeof position === 'string') {
    bgStyle.backgroundPosition = position;
  } else if (typeof position === 'object') {
    position.x && (bgStyle.backgroundPositionX = position.x);
    position.y && (bgStyle.backgroundPositionY = position.y);
  }

  return (
    <div
      className={classNames(
        'bg-holder',
        {
          overlay: overlay,
          [`overlay-${overlay}`]: typeof overlay === 'string'
        },
        className
      )}
      style={bgStyle}
    >
      {video && (
        <video className="bg-video" autoPlay loop muted playsInline>
          {video.map((src, index) => (
            <source
              key={index}
              src={src}
              type={`video/${src.split('.').pop()}`}
            />
          ))}
        </video>
      )}
    </div>
  );
};

export default Background;
