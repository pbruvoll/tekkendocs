import { MixerHorizontalIcon } from '@radix-ui/react-icons'
import { Button, Dialog } from '@radix-ui/themes'
import {
  type FrameDataFilterSectionProps,
  FrameDataFilterSelection,
} from './FrameDataFilterSelection'

type FrameDataFilterDialogProps = FrameDataFilterSectionProps

export const FrameDataFilterDialog = ({
  filter,
  setFilterValue,
  removeFilterValue,
  addFilterElement,
  removeFilterElement,
  stances,
  states,
  transitions,
}: FrameDataFilterDialogProps) => {
  const filterCount = Object.entries(filter).filter(([, value]) => {
    if (value === undefined) {
      return false
    }
    if (Array.isArray(value)) {
      return value.length > 0
    }
    return true
  }).length

  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <Button radius="large">
          <MixerHorizontalIcon width="16" height="16" /> Filter
          {filterCount ? ` (${filterCount})` : ''}
        </Button>
      </Dialog.Trigger>

      <Dialog.Content style={{ maxWidth: 450 }} className="relative">
        <Dialog.Title>Filter</Dialog.Title>
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
          addFilterElement={addFilterElement}
          removeFilterElement={removeFilterElement}
        />

        <div className="mt-8 flex justify-end gap-3">
          <Dialog.Close>
            <Button>Close</Button>
          </Dialog.Close>
        </div>
        <Dialog.Close>
          <button
            type="button"
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
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
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
            <span className="sr-only">Close</span>
          </button>
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Root>
  )
}
