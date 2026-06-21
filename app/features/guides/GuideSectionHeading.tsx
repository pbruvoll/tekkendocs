import { Heading } from '@radix-ui/themes';

type GuideSectionHeadingProps = {
  title: string;
};
export const GuideSectionHeading = ({ title }: GuideSectionHeadingProps) => {
  return (
    <>
      <Heading as="h2" size="5" className="border-l-4 border-primary pl-3">
        {title}
      </Heading>
      <div className="mb-4 mt-2 h-px bg-linear-to-r from-primary/40 to-transparent" />
    </>
  );
};
