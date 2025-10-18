import { NavLink } from 'react-router';
export type NavLinkInfo = {
  link: string
  displayName: string
}
type NavProps = {
  navData: NavLinkInfo[]
}

function Nav({ navData }: NavProps) {
  return (
    <nav className="flex gap-3">
      {navData.map((obj, index) => (
        <NavLink
          key={index}
          to={obj.link}
          end
          className={({ isActive }) =>
            isActive ? 'font-bold underline underline-offset-2' : undefined
          }
        >
          {obj.displayName}
        </NavLink>
      ))}
    </nav>
  )
}

export default Nav
