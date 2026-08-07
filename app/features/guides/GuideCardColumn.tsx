import { type ReactNode } from 'react';

type GuideCardColumnProps = {
  title: string;
  children: ReactNode;
};

/** A titled card used for the column based sections like punishers and combo enders */
export const GuideCardColumn = ({ title, children }: GuideCardColumnProps) => {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card/50">
      <h3 className="border-b border-border bg-muted/60 px-4 py-2 text-sm font-semibold">
        {title}
      </h3>
      <ul className="space-y-2 p-4">{children}</ul>
    </section>
  );
};
