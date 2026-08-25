import { useEffect, useRef } from 'react';
import { NavLink } from 'react-router';
export type NavLinkInfo = {
  link: string;
  displayName: string;
};
type NavProps = {
  navData: NavLinkInfo[];
};

function Nav({ navData }: NavProps) {
  const navRef = useRef<HTMLElement>(null);

  // The row scrolls horizontally when it overflows on small screens, so the
  // active link can start off-screen when landing directly on a deep link.
  // scrollIntoView is not an option here: on a hash deep link the browser has
  // already scrolled the page down past the nav, so it would also scroll the
  // page back up to reveal the nav. Move the scroll container itself instead,
  // which leaves the vertical scroll position untouched.
  useEffect(() => {
    const nav = navRef.current;
    const activeLink = nav?.querySelector('[aria-current="page"]');
    if (!nav || !activeLink) return;

    const navRect = nav.getBoundingClientRect();
    const linkRect = activeLink.getBoundingClientRect();
    nav.scrollLeft +=
      linkRect.left - navRect.left - (navRect.width - linkRect.width) / 2;
  }, []);

  return (
    <nav
      ref={navRef}
      aria-label="Character sections"
      className="-mx-2 overflow-x-auto sm:-mx-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {/* Padding lives on the scrolled content, not the scroll container, so
          it is honored at both ends of the scroll range. */}
      <ul className="flex w-max min-w-full gap-x-5 px-2 sm:px-4">
        {navData.map((obj) => (
          <li key={obj.link} className="shrink-0">
            <NavLink
              to={obj.link}
              end
              className={({ isActive }) =>
                [
                  'block whitespace-nowrap py-1 font-medium transition-colors',
                  isActive
                    ? 'text-primary underline decoration-2 underline-offset-8'
                    : 'text-foreground hover:text-primary',
                ].join(' ')
              }
            >
              {obj.displayName}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default Nav;
