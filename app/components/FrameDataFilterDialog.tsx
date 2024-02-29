import { MixerHorizontalIcon } from '@radix-ui/react-icons'
import { Button, Dialog, Flex, Separator } from '@radix-ui/themes'
import {
  type FrameDataFilterSectionProps,
  FrameDataFilterSelection,
} from './FrameDataFilterSelection'

type FrameDataFilterDialogProps = FrameDataFilterSectionProps

export const FrameDataFilterDialog = ({
  filter,
  setFilterValue,
  removeFilterValue,
}: FrameDataFilterDialogProps) => {
  const filterCount = Object.entries(filter).filter(
    ([, value]) => value !== undefined,
  ).length
  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <Button radius="large">
          <MixerHorizontalIcon width="16" height="16" /> Filter
          {filterCount ? ' (1)' : ''}
        </Button>
      </Dialog.Trigger>

      <Dialog.Content style={{ maxWidth: 450 }}>
        <Dialog.Title>Filter</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          Filter which moves are
        </Dialog.Description>

        <FrameDataFilterSelection
          filter={filter}
          setFilterValue={setFilterValue}
          removeFilterValue={removeFilterValue}
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
