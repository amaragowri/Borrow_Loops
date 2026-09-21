import { useEffect, useRef, useState } from 'react';

/**
 * useScrollReveal
 * A lightweight, high-performance IntersectionObserver hook for subtle scroll entrance animations.
 * 
 * @param {Object} options
 * @param {number} options.index - Stagger index in grid/list (0, 1, 2...)
 * @param {number} options.staggerDelay - Milliseconds delay per index (default 45ms, max 300ms)
 * @param {number} options.threshold - Visibility threshold (default 0.08)
 * @param {string} options.rootMargin - Viewport margin (default '0px 0px -30px 0px')
 * @param {boolean} options.disabled - If true, immediately reveals
 * @returns {{ ref: React.RefObject, isRevealed: boolean, style: Object }}
 */
export const useScrollReveal = ({
  index = 0,
  staggerDelay = 45,
  threshold = 0.08,
  rootMargin = '0px 0px -30px 0px',
  disabled = false,
} = {}) => {
  const ref = useRef(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    // If disabled or prefers-reduced-motion is active, reveal immediately
    if (disabled || typeof window === 'undefined') {
      setIsRevealed(true);
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) {
      setIsRevealed(true);
      return;
    }

    const element = ref.current;
    if (!element) return;

    // Check if element is already in viewport
    const rect = element.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setIsRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsRevealed(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
      observer.disconnect();
    };
  }, [disabled, threshold, rootMargin]);

  // Subtle stagger delay capped to avoid long waits for deep grids
  const computedDelay = isRevealed ? Math.min((index % 10) * staggerDelay, 300) : 0;

  const style = {
    transitionDelay: `${computedDelay}ms`,
  };

  return { ref, isRevealed, style };
};

export default useScrollReveal;
