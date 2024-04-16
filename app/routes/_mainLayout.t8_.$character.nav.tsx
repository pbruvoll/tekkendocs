import React from 'react'
import { NavLink } from '@remix-run/react'
export interface ObjectParams {
  link: String
  value: String
}
interface Props {
  arrayOfObjects: ObjectParams[]
}

function Nav({ arrayOfObjects }: Props) {
  return (
    <nav className="flex gap-3">
      {/* <NavLink to="../">Frame data </NavLink>
      <NavLink to="../meta">Cheat sheet</NavLink>
      <NavLink to="">Anti strats</NavLink> */}
      {arrayOfObjects.map((obj, index) => (
        <NavLink key={index} to={obj.link.toString()}>
          {obj.value}
        </NavLink>
      ))}
    </nav>
  )
}

export default Nav
