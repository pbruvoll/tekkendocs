import { Heading } from '@radix-ui/themes';

type GuideSectionHeadingProps = {
  title: string;
};
export const GuideSectionHeading = ({ title }: GuideSectionHeadingProps) => {
  return (
    <>
      <Heading as="h2" size="5">
        {title}
      </Heading>
      <div className="mb-4 mt-1 h-0.5 w-[60%] bg-text-primary-subtle" />
    </>
  );
};
