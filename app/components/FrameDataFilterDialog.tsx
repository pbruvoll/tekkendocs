import { MixerHorizontalIcon } from '@radix-ui/react-icons';
import { Button, Dialog } from '@radix-ui/themes';
import { filterKey } from '~/constants/filterConstants';
import { isFilterValueActive } from '~/utils/filterUtils';
import {
  type FrameDataFilterSectionProps,
  FrameDataFilterSelection,
} from './FrameDataFilterSelection';

type FrameDataFilterDialogProps = FrameDataFilterSectionProps & {
  triggerVariant?:
    | 'classic'
    | 'solid'
    | 'soft'
    | 'surface'
    | 'outline'
    | 'ghost';
};

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
    <Dialog.Root>
      <Dialog.Trigger>
        <Button radius="large" className={className} variant={triggerVariant}>
          <MixerHorizontalIcon width="16" height="16" /> Filter
          {filterDialogCount ? ` (${filterDialogCount})` : ''}
        </Button>
      </Dialog.Trigger>

      <Dialog.Content style={{ maxWidth: 450 }} className="relative">
        <Dialog.Title>Filter</Dialog.Title>
        <div className="-mx-4 max-md:no-scrollbar max-h-[70vh] overflow-y-auto px-4">
          <Dialog.Description size="3" mb="4">
            Filter the displayed moves
          </Dialog.Description>

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
            variant="soft"
            color="gray"
            onClick={() =>
              updateFilterValues({
                set: [],
                remove: Object.values(filterKey),
              })
            }
          >
            Reset filters
          </Button>
          <Dialog.Close>
            <Button>Close</Button>
          </Dialog.Close>
        </div>
        <Dialog.Close>
          <button
            type="button"
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-x h-4 w-4"
            >
              <title>Close</title>
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
            <span className="sr-only">Close</span>
          </button>
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Root>
  );
};
