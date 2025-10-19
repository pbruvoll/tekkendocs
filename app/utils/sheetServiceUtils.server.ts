import { environment } from '~/constants/environment.server';
import { SheetServiceMock } from '~/mock/SheetServiceMock';
import { SheetServiceImpl } from '~/services/sheetServiceImpl.server';
import { type SheetService } from '~/types/SheetService';

export const getSheetService = (): SheetService => {
  return environment.useMockData
    ? new SheetServiceMock()
    : new SheetServiceImpl();
};
