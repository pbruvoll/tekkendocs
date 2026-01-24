export type TextWithLinksProps = {
  text: string;
};

export const TextWithLinks = ({ text }: TextWithLinksProps) => {
  // Regex to match markdown links: [label](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null = linkRegex.exec(text);

  while (match !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(
        <span key={`text-${lastIndex}`}>
          {text.slice(lastIndex, match.index)}
        </span>,
      );
    }

    // Add the link
    const [, label, url] = match;
    parts.push(
      <a
        key={`link-${match.index}`}
        href={url}
        rel="noopener noreferrer"
        target="_blank"
        className="text-primary underline underline-offset-4"
      >
        {label}
      </a>,
    );

    lastIndex = match.index + match[0].length;
    match = linkRegex.exec(text);
  }

  // Add remaining text after last match
  if (lastIndex < text.length) {
    parts.push(<span key={`text-${lastIndex}`}>{text.slice(lastIndex)}</span>);
  }

  // If no links found, just return the text in a span
  if (parts.length === 0) {
    return <span>{text}</span>;
  }

  return <>{parts}</>;
};
