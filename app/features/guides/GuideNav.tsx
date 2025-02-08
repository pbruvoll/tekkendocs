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
    !!guideData.heatSystem && 'Heat System',
    !!guideData.keyMoves && 'Top 10 Moves',
    !!guideData.standingPunishers && 'Punishers',
    !!guideData.combos && 'Combos',
    !!guideData.keyMoves && guideData.keyMoves.length > 10 && 'Notable Moves',
    !!guideData.stances && 'Stances',
    !!guideData.panicMoves && 'Panic Moves',
    !!guideData.frameTraps && 'Frame Traps',
    !!guideData.knowledgeChecks && 'Knowledge Checks',
    !!(guideData.defensiveTips || guideData.defensiveMoves) && 'Defensive Tips',
    !!guideData.externalResources && 'External Resources',
  ]
  return (
    <nav className="mt-4">
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
