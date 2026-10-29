/** Splits a command at commas so long strings can wrap nicely */
export const CommandText = ({ command }: { command: string }) =>
  command.split(',').map((part, index, array) => (
    // biome-ignore lint/suspicious/noArrayIndexKey: Static list
    <span key={index} className="inline-block">
      {part}
      {index < array.length - 1 && (
        <>
          ,<wbr />
        </>
      )}
    </span>
  ));
