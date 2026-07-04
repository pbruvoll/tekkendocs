import cx from 'classix';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { type GuideData } from './GuideData';
import { getGuideNavItems } from './guideUtils';

type GuideTocProps = {
  guideData: Partial<GuideData>;
};

/** Sticky table of contents for large screens, highlighting the section in view */
export const GuideToc = ({ guideData }: GuideTocProps) => {
  const items = getGuideNavItems(guideData);
  const [activeId, setActiveId] = useState<string>();
  const idsKey = items.map((item) => item.id).join(',');

  useEffect(() => {
    const ids = idsKey.split(',');
    let ticking = false;
    const updateActive = () => {
      ticking = false;
      let current: string | undefined;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 120) {
          current = id;
        }
      }
      setActiveId(current);
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateActive);
      }
    };
    updateActive();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [idsKey]);

  if (!items.length) return null;

  return (
    <nav
      aria-label="On this page"
      className="sticky top-16 max-h-[calc(100vh-5rem)] overflow-y-auto pb-4"
    >
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        On this page
      </p>
      <ul className="border-l border-border text-sm">
        {items.map(({ name, id }) => (
          <li key={id}>
            <Link
              to={`#${id}`}
              className={cx(
                '-ml-px block border-l-2 py-1 pl-3 transition-colors',
                activeId === id
                  ? 'border-primary font-medium text-primary'
                  : 'border-transparent text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground',
              )}
            >
              {name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};
