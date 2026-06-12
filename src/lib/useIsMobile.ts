'use client';
import { useEffect, useState } from 'react';

/**
 * SSR-safe: returns false on the server and first client render, then updates
 * after mount and on resize. Default breakpoint matches Tailwind's `md` (768px).
 */
export function useIsMobile(maxWidth = 768): boolean {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${maxWidth - 1}px)`);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [maxWidth]);
  return isMobile;
}
