import cx from 'classix'
import { motion } from 'framer-motion'
import { InView } from '@/components/core/InView'
import {
  CharacterCard2,
  type CharacterCard2Props,
} from '~/components/CharacterCard'

export type CharacterGridProps = {
  characterCards: (CharacterCard2Props & { imgSrc: string })[]
  size?: 'medium' | 'large'
}
export const CharacterGrid = ({ characterCards, size }: CharacterGridProps) => {
  return (
    <InView
      viewOptions={{ once: true, margin: '0px 0px -250px 0px' }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.02,
          },
        },
      }}
    >
      <ul
        className={cx(
          'grid gap-x-1 gap-y-1',
          size === 'large'
            ? 'grid-cols-3 gap-x-2 gap-y-2 xs:grid-cols-4 xs:gap-x-3 xs:gap-y-4 sm:grid-cols-5 md:grid-cols-6'
            : 'grid-cols-4 xs:grid-cols-5 xs:gap-x-2 xs:gap-y-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-9',
        )}
      >
        {characterCards.map(({ name, url, size, imgSrc, author }, index) => {
          return (
            <motion.div
              variants={{
                hidden: {
                  opacity: 0,
                  scale: 0.7,
                  filter: 'blur(10px)',
                  translateY: '20px',
                },
                visible: {
                  opacity: 1,
                  scale: 1,
                  filter: 'blur(0px)',
                  translateY: '0px',
                },
              }}
              key={index}
              className="mb-4"
            >
              <li className="cursor-pointer" key={name}>
                <CharacterCard2
                  imgUrl={imgSrc}
                  size={size}
                  name={name}
                  url={url}
                  author={author}
                />
              </li>
            </motion.div>
          )
        })}
      </ul>
    </InView>
  )
}
