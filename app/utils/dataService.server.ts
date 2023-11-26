import { google } from "googleapis";
import type { SpreadSheetDocName } from "~/types/SpreadSheetDocName";

const spreadSheetToSheetId: Record<SpreadSheetDocName, string> = {
  'T7' : "1p-QCqB_Tb1GNX0KaicHr0tZwKa1taK5XeNvMr1N3D64",
  'T7_MatchVideo' : "12YOwciWgaJnTFHymarmiDcMlAEy_TxHHQKT4uyfP-pg",
  'TT2' : "TODO",
 
}

export type SheetResponse = {
  editUrl: string;
  rows: string[][];
}

export const getSheet = async (sheetName: string, spreadSheet: SpreadSheetDocName): Promise<SheetResponse | null> => {
  const target = ["https://www.googleapis.com/auth/spreadsheets.readonly"];
  const jwt = new google.auth.JWT({
    email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    scopes: target,
    key: (process.env.GOOGLE_SHEETS_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
  });

  const sheets = google.sheets({ version: "v4", auth: jwt });
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadSheetToSheetId[spreadSheet],
      range: sheetName, 
    });

    const rows = response.data.values;
    if(rows) {
      return { editUrl: "https://docs.google.com/spreadsheets/d/" + spreadSheetToSheetId[spreadSheet], rows};
    }
    console.warn("Error getting data: " + response.status + " " + response.statusText)
    return null;
  } catch (e) {
    console.warn("Exception getting data " + e)
    return null;
  }
}