import { useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { type Move } from '~/types/Move';
import { type MoveFilter } from '~/types/MoveFilter';
import { getMoveFilterTypes } from '~/utils/frameDataUtils';
import * as filterUtils from '~/utils/searchParamsFilterUtils';
import { FrameDataFilterDialog } from './FrameDataFilterDialog';

type MoveFilterDialogProps = {
  moveFilter: MoveFilter;
  triggerVariant?:
    | 'classic'
    | 'solid'
    | 'soft'
    | 'surface'
    | 'outline'
    | 'ghost';
  moves: Move[];
};

export const MoveFilterDialog = ({
  moveFilter,
  triggerVariant,
  moves,
}: MoveFilterDialogProps) => {
  const [, setSearchParams] = useSearchParams();

  const moveFilterTypes = useMemo(() => getMoveFilterTypes(moves), [moves]);

  return (
    <FrameDataFilterDialog
      triggerVariant={triggerVariant}
      filter={moveFilter}
      stances={moveFilterTypes.stances}
      states={moveFilterTypes.states}
      transitions={moveFilterTypes.transitions}
      setFilterValue={(key, value) =>
        filterUtils.setFilterValue(setSearchParams, key, value)
      }
      removeFilterValue={(key) =>
        filterUtils.removeFilterValue(setSearchParams, key)
      }
      updateFilterValues={(changes) =>
        filterUtils.updateFilterValues(setSearchParams, changes)
      }
      addFilterElement={(key, element) =>
        filterUtils.addFilterElement(setSearchParams, key, element)
      }
      removeFilterElement={(key, element) =>
        filterUtils.removeFilterElement(setSearchParams, key, element)
      }
    />
  );
};
