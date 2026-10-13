import { SlidersHorizontalIcon } from 'lucide-react';
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
      <DialogTrigger
        render={
          <Button
            className={cn(
              'h-8 gap-2 rounded-[6px] px-3',
              triggerVariant === 'soft' &&
                'bg-primary/15 text-primary hover:bg-primary/25',
              className,
            )}
          />
        }
      >
        <SlidersHorizontalIcon /> Filter
        {filterDialogCount ? ` (${filterDialogCount})` : ''}
      </DialogTrigger>

      <DialogContent className="block text-base sm:max-w-[450px]">
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
            variant="secondary"
            className={footerButtonClassName}
            onClick={() =>
              updateFilterValues({
                set: [],
                remove: Object.values(filterKey),
              })
            }
          >
            Reset filters
          </Button>
          <DialogClose render={<Button className={footerButtonClassName} />}>
            Close
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};
