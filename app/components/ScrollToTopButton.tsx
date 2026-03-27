import { ChevronUpIcon } from '@radix-ui/react-icons';
import { useEffect, useState } from 'react';

const SHOW_AFTER_SCROLL_Y = 140;

export function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setIsVisible(window.scrollY > SHOW_AFTER_SCROLL_Y);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches;

  const handleClick = () => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  };

  return (
    <button
      type="button"
      aria-label="Scroll to top"
      onClick={handleClick}
      className="fixed right-5 bottom-5 z-60 inline-flex size-11 items-center justify-center rounded-full border border-border/80 bg-linear-to-b from-primary/20 to-card/90 text-foreground shadow-lg shadow-black/10 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:from-primary/30 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 sm:right-6 sm:bottom-6"
    >
      <ChevronUpIcon width="1.15rem" height="1.15rem" />
    </button>
  );
}
