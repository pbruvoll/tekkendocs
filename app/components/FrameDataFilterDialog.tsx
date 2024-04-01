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
}: FrameDataFilterDialogProps) => {
  const filterCount = Object.entries(filter).filter(([, value]) => {
    if (value === undefined) {
      return false
    }
    if (value instanceof Array) {
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

      <Dialog.Content style={{ maxWidth: 450 }}>
        <Dialog.Title>Filter</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          Filter the displayed moves
        </Dialog.Description>

        <FrameDataFilterSelection
          filter={filter}
          stances={stances}
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
      </Dialog.Content>
    </Dialog.Root>
  )
}
