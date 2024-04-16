import { NavLink } from '@remix-run/react'
export interface ObjectParams {
  link: String
  value: String
}
interface Props {
  navData: ObjectParams[]
}

function Nav({ navData }: Props) {
  return (
    <nav className="flex gap-3">
      {navData.map((obj, index) => (
        <NavLink key={index} to={obj.link.toString()}>
          {obj.value}
        </NavLink>
      ))}
    </nav>
  )
}

export default Nav
