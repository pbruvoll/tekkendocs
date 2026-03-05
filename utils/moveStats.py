"""Print per-character video coverage stats from movelist JSON files.

For each character file, this script reports:
1) Video coverage among moves that have `num` set.
2) Video coverage among moves that do not have `num` set.
"""

import argparse
import json
import os


def is_set(value):
	return bool(str(value).strip()) if value is not None else False


def format_percent(numerator, denominator):
	if denominator == 0:
		return "N/A"
	return f"{(numerator / denominator) * 100:.2f}%"


def get_character_stats(file_path):
	with open(file_path, "r", encoding="utf-8") as file:
		moves = json.load(file)

	if not isinstance(moves, list):
		raise ValueError("Expected JSON root to be a list of moves")

	with_num_total = 0
	with_num_video = 0
	without_num_total = 0
	without_num_video = 0

	for move in moves:
		if not isinstance(move, dict):
			continue

		has_num = is_set(move.get("num", ""))
		has_video = is_set(move.get("video", ""))

		if has_num:
			with_num_total += 1
			if has_video:
				with_num_video += 1
		else:
			without_num_total += 1
			if has_video:
				without_num_video += 1

	return {
		"with_num_total": with_num_total,
		"with_num_video": with_num_video,
		"without_num_total": without_num_total,
		"without_num_video": without_num_video,
		"with_num_percent": format_percent(with_num_video, with_num_total),
		"without_num_percent": format_percent(without_num_video, without_num_total),
	}


def iter_json_files(input_dir, include_test):
	for file_name in sorted(os.listdir(input_dir)):
		if not file_name.endswith(".json"):
			continue
		if not include_test and file_name == "test.json":
			continue
		yield os.path.join(input_dir, file_name)


def main():
	script_dir = os.path.dirname(__file__)
	default_input_dir = os.path.join(script_dir, "wavu-importer", "src", "json_movelist")

	parser = argparse.ArgumentParser(
		description="Print per-character video coverage stats for json movelist files"
	)
	parser.add_argument(
		"-I",
		"--inputDir",
		default=default_input_dir,
		help="Directory containing character movelist json files",
	)
	parser.add_argument(
		"--include-test",
		action="store_true",
		help="Include test.json in calculations",
	)
	args = parser.parse_args()

	if not os.path.isdir(args.inputDir):
		raise FileNotFoundError(f"Input directory not found: {args.inputDir}")

	results = []
	for file_path in iter_json_files(args.inputDir, args.include_test):
		character_name = os.path.splitext(os.path.basename(file_path))[0]
		try:
			stats = get_character_stats(file_path)
			if stats["with_num_total"] > 0:
				with_num_sort_value = stats["with_num_video"] / stats["with_num_total"]
			else:
				with_num_sort_value = -1

			results.append((with_num_sort_value, character_name, stats))
		except Exception as error:
			print(f"{character_name}: skipped ({error})")


	character_col_width = 16
	value_col_width = 28
	header = (
		f"{'Character':<{character_col_width}} | "
		f"{'Move in movelist':<{value_col_width}} | "
		f"{'Not in movelist':<{value_col_width}}"
	)
	print(header)
	print("-" * len(header))

	for _, character_name, stats in sorted(results, key=lambda result: (result[0], result[1])):
		in_movelist_value = f"{stats['with_num_percent']} ({stats['with_num_video']}/{stats['with_num_total']})"
		not_in_movelist_value = f"{stats['without_num_percent']} ({stats['without_num_video']}/{stats['without_num_total']})"
		print(
			f"{character_name:<{character_col_width}} | "
			f"{in_movelist_value:<{value_col_width}} | "
			f"{not_in_movelist_value:<{value_col_width}}"
		)


if __name__ == "__main__":
	main()
