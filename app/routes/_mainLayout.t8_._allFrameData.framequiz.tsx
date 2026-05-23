import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Link,
  type MetaFunction,
  useRouteLoaderData,
  useSearchParams,
} from 'react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ContentContainer } from '~/components/ContentContainer';
import { MovePropertyIconList } from '~/components/MovePropertyIconList';
import { MovePropertyTagList } from '~/components/MovePropertyTagList';
import { MoveVideo } from '~/components/MoveVideo';
import { ShowNotes } from '~/components/ShowNotes';
import { characterInfoT8List } from '~/constants/characterInfoListT8';
import { hitLevelValue } from '~/constants/filterConstants';
import { MoveTags } from '~/constants/moveTags';
import { useAppState } from '~/hooks/useAppState';
import tekkenDocsLogoIcon from '~/images/logo/tekkendocs-logo-icon.svg';
import { type Move } from '~/types/Move';
import {
  charIdFromMove,
  commandToUrlSegmentEncoded,
  isWavuMove,
} from '~/utils/moveUtils';
import { generateMetaTags } from '~/utils/seoUtils';
import { type LoaderData } from './_mainLayout.t8_._allFrameData';
import { rankGroups } from './_mainLayout.t8_.ranks';

export const meta: MetaFunction = ({ matches }) => {
  return generateMetaTags({
    matches,
    title: 'Tekken 8 Endless Frame Quiz | TekkenDocs',
    description:
      'Endless frame data quiz with. Guess the block frame and see how many you can get right in a row! ',
    image: { url: '/images/tekkendocs-og-image-v2.png' },
    url: '/t8/framequiz',
  });
};

export default function FrameQuiz() {
  const { moves } = useRouteLoaderData<LoaderData>(
    'routes/_mainLayout.t8_._allFrameData',
  ) || { moves: [] };
  console.debug('loaded frame data. length: ', moves.length);
  return 'Welcome to the frame quiz! This is work in progress';
}
