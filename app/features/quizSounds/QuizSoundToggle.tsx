import { Volume2, VolumeX } from 'lucide-react';
import { useSyncExternalStore } from 'react';
import { Button } from '~/components/ui/button';
import { quizSoundsEnabledStore } from './quizSoundsEnabledStore';

export const QuizSoundToggle = () => {
  const enabled = useSyncExternalStore(
    quizSoundsEnabledStore.subscribe,
    quizSoundsEnabledStore.getSnapshot,
    quizSoundsEnabledStore.getServerSnapshot,
  );
  const label = enabled ? 'Mute quiz sounds' : 'Unmute quiz sounds';

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={label}
      title={label}
      aria-pressed={!enabled}
      onClick={() => quizSoundsEnabledStore.write(!enabled)}
    >
      {enabled ? <Volume2 /> : <VolumeX />}
    </Button>
  );
};
