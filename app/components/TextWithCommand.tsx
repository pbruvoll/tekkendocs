import { type Move } from '~/types/Move';
import { Command } from './Command';

export type TextWithCommandProps = {
  text: string;
  charUrl: string;
  compressedCommandMap: Record<string, Move>;
};
export const TextWithCommand = ({
  text,
  charUrl,
  compressedCommandMap,
}: TextWithCommandProps) => {
  const splittedText = text.split(/(".*?")/);
  return (
    <>
      {splittedText.map((value, index) => {
        if (value.startsWith('"') && value.endsWith('"')) {
          const command = value.slice(1, -1);
          return (
            <Command
              key={index}
              charUrl={charUrl}
              command={command}
              compressedCommandMap={compressedCommandMap}
            />
          );
        }
        return value;
      })}
    </>
  );
};
