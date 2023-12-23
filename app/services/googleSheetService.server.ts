import { json } from '@remix-run/node'
import { google, type sheets_v4 } from 'googleapis'
import { type GaxiosResponse } from '~/types/GaxiosResponse'
import { ServerStatusCode } from '~/types/ServerStatusCode'
import type { SpreadSheetDocName } from '~/types/SpreadSheetDocName'
import { createErrorResponse } from '~/utils/errorUtils'

const spreadSheetToSheetId: Record<SpreadSheetDocName, string> = {
  T8: '1IDC11ShZjpo6p5k8kV24T-jumjY27oQZlwvKr_lb4iM',
  T7: '1p-QCqB_Tb1GNX0KaicHr0tZwKa1taK5XeNvMr1N3D64',
  T7_MatchVideo: '12YOwciWgaJnTFHymarmiDcMlAEy_TxHHQKT4uyfP-pg',
  TT2: 'TODO',
}

export type SheetResponse = {
  editUrl: string
  rows: string[][]
}

export const getSheet = async (
  sheetName: string,
  spreadSheet: SpreadSheetDocName,
): Promise<SheetResponse> => {
  const target = ['https://www.googleapis.com/auth/spreadsheets.readonly']
  const jwt = new google.auth.JWT({
    email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    scopes: target,
    key: (process.env.GOOGLE_SHEETS_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  })

  const sheets = google.sheets({ version: 'v4', auth: jwt })
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadSheetToSheetId[spreadSheet],
      range: sheetName,
    })

    const rows = response.data.values
    if (rows) {
      return {
        editUrl:
          'https://docs.google.com/spreadsheets/d/' +
          spreadSheetToSheetId[spreadSheet],
        rows,
      }
    }
    console.warn(
      'Error getting data: ' + response.status + ' ' + response.statusText,
    )
  } catch (e) {
    console.warn('Exception getting data ' + e)
    throw e
  }
  throw json(`There were no rows for sheet ${sheetName}`, {
    status: ServerStatusCode.NotFound,
    statusText: 'Not found',
  })
}

export type SheetObject = {
  editUrl: string
  rows: string[][]
}

export const getSheetObject = async (
  sheetName: string,
  spreadSheetDocumentId: string,
): Promise<SheetObject> => {
  const target = ['https://www.googleapis.com/auth/spreadsheets.readonly']
  const jwt = new google.auth.JWT({
    email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    scopes: target,
    key: (process.env.GOOGLE_SHEETS_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  })

  const sheets = google.sheets({ version: 'v4', auth: jwt })

  let googleResponse: GaxiosResponse<sheets_v4.Schema$ValueRange> | null = null

  try {
    googleResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadSheetDocumentId,
      range: sheetName,
    })
  } catch (e) {
    throw createErrorResponse({
      title: `Not able to fetch data for sheetname ${sheetName} from spreadsheet ${spreadSheetDocumentId}`,
      status: ServerStatusCode.UpstreamError,
      exception: e,
    })
  }

  if (googleResponse.status >= 400) {
    throw createErrorResponse({
      title: `The request for data for sheetname ${sheetName} from spreadsheet ${spreadSheetDocumentId} returned with error code ${googleResponse.status}`,
      status: ServerStatusCode.UpstreamError,
      upstreamErrorResponse: googleResponse,
    })
  }

  const rows = googleResponse.data.values

  if (!rows) {
    throw createErrorResponse({
      title: `Could not find any content for sheetname ${sheetName} from spreadsheet ${spreadSheetDocumentId}`,
      status: ServerStatusCode.NotFound,
    })
  }

  return {
    editUrl: 'https://docs.google.com/spreadsheets/d/' + spreadSheetDocumentId,
    rows,
  }
}
