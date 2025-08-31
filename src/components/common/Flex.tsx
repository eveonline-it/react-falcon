import React from 'react';
import classNames from 'classnames';

type FlexDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse';
type JustifyContent = 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
type AlignItems = 'start' | 'end' | 'center' | 'baseline' | 'stretch';
type AlignContent = 'start' | 'end' | 'center' | 'between' | 'around' | 'stretch';
type FlexWrap = 'wrap' | 'nowrap' | 'wrap-reverse';
type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
type FlexTag = keyof React.JSX.IntrinsicElements;

interface FlexProps {
  justifyContent?: JustifyContent;
  alignItems?: AlignItems;
  alignContent?: AlignContent;
  inline?: boolean;
  wrap?: FlexWrap;
  className?: string;
  tag?: FlexTag;
  children?: React.ReactNode;
  breakpoint?: Breakpoint;
  direction?: FlexDirection;
  [key: string]: any; // Allow any additional props for different tag types
}

const Flex: React.FC<FlexProps> = ({
  justifyContent,
  alignItems,
  alignContent,
  inline,
  wrap,
  className,
  tag: Tag = 'div',
  children,
  breakpoint,
  direction,
  ...rest
}) => {
  return (
    <Tag
      className={classNames(
        {
          [`d-${breakpoint ? breakpoint + '-' : ''}flex`]: !inline,
          [`d-${breakpoint ? breakpoint + '-' : ''}inline-flex`]: inline,
          [`flex-${direction}`]: direction,
          [`justify-content-${justifyContent}`]: justifyContent,
          [`align-items-${alignItems}`]: alignItems,
          [`align-content-${alignContent}`]: alignContent,
          [`flex-${wrap}`]: wrap
        },
        className
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
};

export default Flex;
