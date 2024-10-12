import { motion } from 'framer-motion'
import { InView } from '@/components/core/InView'
import {
  CharacterCard2,
  type CharacterCard2Props,
} from '~/components/CharacterCard'

export type CharacterGridProps = {
  characterCards: (CharacterCard2Props & { imgSrc: string })[]
}
export const CharacterGrid = ({ characterCards }: CharacterGridProps) => {
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
      <ul className="grid grid-cols-4 gap-x-1 gap-y-3 xs:grid-cols-5 xs:gap-x-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-9">
        {characterCards.map(({ name, url, imgSrc }, index) => {
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
                <CharacterCard2 imgUrl={imgSrc} name={name} url={url} />
              </li>
            </motion.div>
          )
        })}
      </ul>
    </InView>
  )
}
