import { google } from "googleapis";
import type { Game } from "~/types/Game";

const gameToSheetId: Record<Game, string> = {
  'T7' : "1p-QCqB_Tb1GNX0KaicHr0tZwKa1taK5XeNvMr1N3D64",
  'TT2' : "TODO",
}

export type SheetResponse = {
  editUrl: string;
  rows: string[][];
}

export const getSheet = async (sheetName: string, game: Game): Promise<SheetResponse | null> => {
  const target = ["https://www.googleapis.com/auth/spreadsheets.readonly"];
  const jwt = new google.auth.JWT({
    email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    scopes: target,
    key: (process.env.GOOGLE_SHEETS_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
  });

  const sheets = google.sheets({ version: "v4", auth: jwt });
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: gameToSheetId[game],
      range: sheetName, 
    });

    const rows = response.data.values;
    if(rows) {
      return { editUrl: "https://docs.google.com/spreadsheets/d/" + gameToSheetId[game], rows};
    }
    return null;
  } catch {
    return null;
  }
}