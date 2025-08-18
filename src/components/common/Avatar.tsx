import React from 'react';
import { isIterableArray } from 'helpers/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import Flex from './Flex';
import classNames from 'classnames';

type AvatarSize = 'xs' | 's' | 'm' | 'l' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
type AvatarRounded = 'circle' | '0' | '1' | '2' | '3' | 'pill' | 'top' | 'end' | 'bottom' | 'start';

interface AvatarProps {
  size?: AvatarSize;
  rounded?: AvatarRounded;
  src?: string | string[];
  name?: string;
  emoji?: string;
  className?: string;
  mediaClass?: string;
  isExact?: boolean;
  icon?: IconProp;
  characterId?: string | number;
}

const Avatar: React.FC<AvatarProps> = ({
  size = 'xl',
  rounded = 'circle',
  src,
  name,
  emoji = '😊',
  className,
  mediaClass,
  isExact = false,
  icon,
  characterId
}) => {
  const avatarClassNames = ['avatar', `avatar-${size}`, className].join(' ');
  const mediaClasses = [
    rounded ? `rounded-${rounded}` : 'rounded',
    mediaClass
  ].join(' ');

  const getAvatar = (): React.ReactElement => {
    if (characterId) {
      const evePortraitUrl = `https://images.evetech.net/characters/${characterId}/portrait`;
      return <img className={mediaClasses} src={evePortraitUrl} alt="" />;
    }

    if (src) {
      if (isIterableArray(src)) {
        const srcArray = Array.isArray(src) ? src : [src];
        return (
          <div className={`${mediaClasses} overflow-hidden h-100 d-flex`}>
            <div className="w-50 border-right">
              <img src={srcArray[0]} alt="" />
            </div>
            <div className="w-50 d-flex flex-column">
              <img src={srcArray[1]} alt="" className="h-50 border-bottom" />
              <img src={srcArray[2]} alt="" className="h-50" />
            </div>
          </div>
        );
      } else {
        return <img className={mediaClasses} src={src as string} alt="" />;
      }
    }

    if (name) {
      const initials = isExact ? name : (name.match(/\b\w/g) || []).join('');
      return (
        <div className={`avatar-name ${mediaClasses}`}>
          <span>{initials}</span>
        </div>
      );
    }

    if (icon) {
      return (
        <Flex className={`avatar-name ${mediaClasses}`}>
          <FontAwesomeIcon icon={icon} />
        </Flex>
      );
    }

    return (
      <div className={`avatar-emoji ${mediaClasses}`}>
        <span role="img" aria-label="Emoji">
          {emoji}
        </span>
      </div>
    );
  };

  return <div className={avatarClassNames}>{getAvatar()}</div>;
};

interface AvatarGroupProps {
  children: React.ReactNode;
  dense?: boolean;
  className?: string;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({ 
  children, 
  dense, 
  className 
}) => {
  return (
    <div
      className={classNames(className, 'avatar-group', {
        'avatar-group-dense': dense
      })}
    >
      {children}
    </div>
  );
};

export default Avatar;
