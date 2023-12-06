import { Badge } from "@radix-ui/themes";
import { Link } from "@remix-run/react";

export type CharacterCardProps = {
  url: string;
  name: string;
};

export const CharacterCard = ({ url, name }: CharacterCardProps) => {
  return (
    <Link to={url} className="cursor-pointer">
      <Badge size="2" style={{ cursor: "pointer" }} variant="outline">
        <span className="first-letter:uppercase">{name}</span>
      </Badge>
    </Link>
  );
};
