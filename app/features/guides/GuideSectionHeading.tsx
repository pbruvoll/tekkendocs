import { Heading } from '@/components/ui/heading';
import { type GuideSectionKey } from '~/features/guideLanguage/texts/guideTexts';
import { useGuideContext } from './GuideContext';

type GuideSectionHeadingProps = {
  section: GuideSectionKey;
};
export const GuideSectionHeading = ({ section }: GuideSectionHeadingProps) => {
  const { texts } = useGuideContext();
  return (
    <>
      <Heading as="h2" size="5" className="border-s-4 border-primary ps-3">
        {texts.sections[section]}
      </Heading>
      <div className="mb-4 mt-2 h-px bg-linear-to-r rtl:bg-linear-to-l from-primary/40 to-transparent" />
    </>
  );
};
