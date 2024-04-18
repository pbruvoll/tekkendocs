import { NavLink } from '@remix-run/react'
export interface ObjectParams {
  link: string
  value: String
}
interface Props {
  navData: ObjectParams[]
}

function Nav({ navData }: Props) {
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
          {obj.value}
        </NavLink>
      ))}
    </nav>
  )
}

export default Nav
