import { MixerHorizontalIcon } from '@radix-ui/react-icons';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { filterKey } from '~/constants/filterConstants';
import { isFilterValueActive } from '~/utils/filterUtils';
import {
  type FrameDataFilterSectionProps,
  FrameDataFilterSelection,
} from './FrameDataFilterSelection';

export type FilterTriggerVariant = 'solid' | 'soft';

type FrameDataFilterDialogProps = FrameDataFilterSectionProps & {
  triggerVariant?: FilterTriggerVariant;
};

const footerButtonClassName = 'h-8 rounded-full px-3 font-semibold';

export const FrameDataFilterDialog = ({
  className,
  filter,
  setFilterValue,
  removeFilterValue,
  updateFilterValues,
  addFilterElement,
  removeFilterElement,
  stances,
  states,
  transitions,
  triggerVariant,
}: FrameDataFilterDialogProps) => {
  const filterDialogCount = Object.entries(filter)
    .filter(([key]) => key !== filterKey.Character && key !== filterKey.Query)
    .filter(([, value]) => isFilterValueActive(value)).length;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className={cn(
            'h-8 gap-2 rounded-[6px] px-3',
            triggerVariant === 'soft' &&
              'bg-[rgb(250_130_0/0.13)] text-primary hover:bg-[rgb(250_130_0/0.2)]',
            className,
          )}
        >
          <MixerHorizontalIcon width="16" height="16" /> Filter
          {filterDialogCount ? ` (${filterDialogCount})` : ''}
        </Button>
      </DialogTrigger>

      <DialogContent
        overlayClassName="bg-black/60"
        className="block w-[calc(100%-2rem)] max-w-[450px] rounded-[18px] border-0 bg-[#191919] shadow-[0_0_0_1px_rgb(255_255_255/0.2),0_12px_60px_rgb(0_0_0/0.2),0_16px_64px_rgb(0_0_0/0.4),0_16px_36px_-20px_rgb(0_0_0/0.9)] sm:rounded-[18px]"
      >
        <DialogTitle className="mb-2 font-bold text-xl leading-[26px]">
          Filter
        </DialogTitle>
        <div className="-mx-4 max-md:no-scrollbar max-h-[70vh] overflow-y-auto px-4">
          <DialogDescription className="mb-4 text-base text-foreground">
            Filter the displayed moves
          </DialogDescription>

          <FrameDataFilterSelection
            filter={filter}
            stances={stances}
            states={states}
            transitions={transitions}
            setFilterValue={setFilterValue}
            removeFilterValue={removeFilterValue}
            updateFilterValues={updateFilterValues}
            addFilterElement={addFilterElement}
            removeFilterElement={removeFilterElement}
          />
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <Button
            variant="ghost"
            className={cn(
              footerButtonClassName,
              'bg-white/[0.07] text-white/70 hover:bg-white/10 hover:text-white/80',
            )}
            onClick={() =>
              updateFilterValues({
                set: [],
                remove: Object.values(filterKey),
              })
            }
          >
            Reset filters
          </Button>
          <DialogClose asChild>
            <Button className={footerButtonClassName}>Close</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};
