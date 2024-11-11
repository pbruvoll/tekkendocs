import { Fragment } from 'react'
import { Link } from '@remix-run/react'
import { type GuideData } from './GuideData'

type GuideNavPros = {
  guideData: Partial<GuideData>
}
export const GuideNav = ({ guideData }: GuideNavPros) => {
  const navItems = [
    !!guideData.introduction && 'Introduction',
    !!guideData.strengths && 'Strengths',
    !!guideData.weaknesses && 'Weaknesses',
    !!guideData.keyMoves && 'Top 10 Moves',
    !!guideData.externalResources && 'External Resources',
  ]
  return (
    <nav>
      {navItems.map((name, index) => {
        if (!name) return undefined
        return (
          <Fragment key={index}>
            <Link
              className="text-text-primary"
              to={`#${name.toLowerCase().replace(/ /g, '-')}`}
            >
              {name}
            </Link>
            {index < navItems.length - 1 && <span> | </span>}
          </Fragment>
        )
      })}
    </nav>
  )
}
