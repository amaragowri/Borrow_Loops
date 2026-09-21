import React from 'react';
import { Link } from 'react-router-dom';
import { useScrollReveal } from '../hooks/useScrollReveal';

/**
 * InteractiveCard
 * A unified, accessible card component that integrates:
 * - Subtle hover lift (2-3px) & gentle scale (1.015)
 * - Press-down active feedback
 * - Image zoom coordination (.card-image-zoom)
 * - Viewport entrance scroll reveal with staggered delays (IntersectionObserver)
 * - Accessible focus rings & reduced-motion support
 */
export const InteractiveCard = ({
  as: Component = 'div',
  to,
  href,
  onClick,
  index = 0,
  variant = 'default', // 'default' | 'stat' | 'category' | 'compact' | 'flat'
  interactive = true,
  enableReveal = true,
  className = '',
  style: customStyle = {},
  children,
  ...restProps
}) => {
  const { ref, isRevealed, style: revealStyle } = useScrollReveal({
    index,
    disabled: !enableReveal,
  });

  // Determine actual HTML / React element
  let ElementTag = Component;
  if (to) {
    ElementTag = Link;
  } else if (href) {
    ElementTag = 'a';
  } else if (onClick && Component === 'div') {
    ElementTag = 'div';
  }

  // Variant modifier
  const variantClass = !interactive || variant === 'flat'
    ? ''
    : variant === 'stat'
    ? 'card-interactive card-interactive-stat'
    : variant === 'category'
    ? 'card-interactive card-interactive-category'
    : variant === 'compact'
    ? 'card-interactive card-interactive-compact'
    : 'card-interactive';

  const baseClasses = [
    variantClass,
    enableReveal ? 'scroll-reveal-item' : '',
    enableReveal && isRevealed ? 'is-revealed' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const mergedStyle = {
    ...(enableReveal ? revealStyle : {}),
    ...customStyle,
  };

  const linkProps = to ? { to } : href ? { href } : {};

  return (
    <ElementTag
      ref={ref}
      onClick={onClick}
      className={baseClasses}
      style={mergedStyle}
      {...linkProps}
      {...restProps}
    >
      {children}
    </ElementTag>
  );
};

export default InteractiveCard;
