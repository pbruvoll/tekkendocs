import { Languages } from 'lucide-react';
import { useGuideContext } from '~/features/guides/GuideContext';

/** Tells readers that a translated guide is machine translated. Renders nothing for english */
export const GuideTranslationNotice = () => {
  const { texts } = useGuideContext();
  if (!texts.translationNotice) {
    return null;
  }
  return (
    <p className="flex w-fit items-center gap-1.5 text-xs text-muted-foreground">
      <Languages aria-hidden className="size-3.5 shrink-0" />
      {texts.translationNotice}
    </p>
  );
};
