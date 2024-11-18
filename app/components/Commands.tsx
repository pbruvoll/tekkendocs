import { Fragment } from 'react'
import { type Move } from '~/types/Move'
import { Command } from './Command'

export type CommandsProps = {
  command: string
  charUrl: string
  compressedCommandMap: Record<string, Move>
}

/* Shows a command as a link. This component is similary to Command, but is supports multiple commands with the synttax
command1 | command2 */
export const Commands = ({
  command,
  charUrl,
  compressedCommandMap,
}: CommandsProps) => {
  const splitted = command.split(' | ')
  if (!splitted.length) {
    return (
      <Command
        command={command}
        charUrl={charUrl}
        compressedCommandMap={compressedCommandMap}
      />
    )
  }
  return splitted.map((singleCommand, index) => {
    return (
      <Fragment key={index}>
        {index > 0 && <span> | </span>}
        <Command
          command={singleCommand}
          charUrl={charUrl}
          compressedCommandMap={compressedCommandMap}
        />
      </Fragment>
    )
  })
}
