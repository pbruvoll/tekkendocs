import gspread

gc = gspread.oauth()
sh = gc.open_by_url('https://docs.google.com/spreadsheets/d/1p-QCqB_Tb1GNX0KaicHr0tZwKa1taK5XeNvMr1N3D64')
# sh = gc.open("TekkenFrames");
worksheet = sh.worksheet("nina")
val = worksheet.acell('A1').value
print(val);