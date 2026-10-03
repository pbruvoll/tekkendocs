import { Languages } from 'lucide-react';
import { useGuideContext } from '~/features/guides/GuideContext';

/** Tells readers that a translated guide is machine translated. Renders nothing for english */
export const GuideTranslationNotice = () => {
  const { texts } = useGuideContext();
  if (!texts.translationNotice) {
    return null;
  }
  return (
    <p className="mt-4 flex w-fit items-center gap-3 rounded-md border border-primary/40 bg-primary/15 px-4 py-3 text-sm">
      <Languages aria-hidden className="size-5 shrink-0 text-primary" />
      {texts.translationNotice}
    </p>
  );
};
