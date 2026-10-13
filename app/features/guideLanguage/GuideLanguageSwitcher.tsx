import { Check, ChevronDown, Globe } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  defaultGuideLanguage,
  type GuideLanguage,
  guideLanguageNames,
  guideLanguageParam,
  guideLanguages,
} from './guideLanguage';

export type GuideLanguageSwitcherProps = {
  current: GuideLanguage;
};

export const GuideLanguageSwitcher = ({
  current,
}: GuideLanguageSwitcherProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger
      render={
        <Button
          variant="ghost"
          size="sm"
          aria-label="Language"
          className="gap-2 border border-primary/40 bg-primary/15 text-primary hover:bg-primary/25 hover:text-primary"
        />
      }
    >
      <Globe aria-hidden className="size-4" />
      <span lang={current}>{guideLanguageNames[current]}</span>
      <ChevronDown aria-hidden className="size-4" />
    </DropdownMenuTrigger>
    <DropdownMenuContent align="start">
      {guideLanguages.map((language) => (
        <DropdownMenuItem
          key={language}
          className="cursor-pointer justify-between gap-6"
          render={
            <Link
              // english uses the plain guide url
              to={{
                search:
                  language === defaultGuideLanguage
                    ? ''
                    : `?${guideLanguageParam}=${language}`,
              }}
              preventScrollReset
              lang={language}
              hrefLang={language}
              aria-current={language === current ? 'page' : undefined}
            />
          }
        >
          {guideLanguageNames[language]}
          {language === current && <Check aria-hidden className="size-4" />}
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
);
