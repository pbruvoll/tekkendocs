#!/usr/bin/env python3
"""
Recursively convert videos to a target resolution.

Usage examples:
    python utils\convertVideoResolution.py -I input -O output --width 480
    python utils\convertVideoResolution.py -I input -O output --width 480 --height 270
    python utils\convertVideoResolution.py -I input -O output --width 480 --format mp4
    python utils\convertVideoResolution.py -I input -O output --width 480 --format gif --fps 15
"""

import argparse
import os
import shutil
import subprocess
import tempfile
from pathlib import Path
from dataclasses import dataclass


VIDEO_EXTENSIONS = {
    ".mp4",
    ".mov",
    ".mkv",
    ".avi",
    ".webm",
    ".m4v",
    ".mpg",
    ".mpeg",
    ".ts",
}

OUTPUT_FORMATS = {
    "mp4",
    "mov",
    "mkv",
    "avi",
    "webm",
    "m4v",
    "mpg",
    "mpeg",
    "ts",
    "gif",
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Recursively convert videos to a target resolution"
    )
    parser.add_argument(
        "-I", "--input",
        required=True,
        help="Input folder with source videos (recursively scanned)"
    )
    parser.add_argument(
        "-O", "--output",
        required=True,
        help="Output folder for converted videos (mirrors input structure)"
    )
    parser.add_argument(
        "--width",
        type=int,
        required=True,
        help="Target width in pixels"
    )
    parser.add_argument(
        "--height",
        type=int,
        help="Target height in pixels (if omitted, aspect ratio is preserved)"
    )
    parser.add_argument(
        "--postfix",
        type=str,
        help="Optional postfix appended to filename stem (default: -<width>)"
    )
    parser.add_argument(
        "--format",
        type=str,
        help="Optional output format/container (e.g. mp4, mkv, webm, gif). If omitted, source format is preserved"
    )
    parser.add_argument(
        "--fps",
        type=float,
        help="Output frame rate (GIF output only). Defaults to 15 for GIF when omitted"
    )
    parser.add_argument(
        "--overwrite",
        action="store_true",
        help="Overwrite existing output files (default: skip existing files)"
    )
    parser.add_argument(
        "--gif-colors",
        type=int,
        help="GIF palette size (2-256). Defaults to 32 for GIF when omitted"
    )
    parser.add_argument(
        "--gif-dither",
        type=str,
        default=None,
        choices=["none", "bayer", "floyd_steinberg", "sierra2", "sierra2_4a"],
        help="GIF palette dithering algorithm. Defaults to bayer for GIF when omitted"
    )
    parser.add_argument(
        "--gif-bayer-scale",
        type=int,
        help="Bayer dithering scale 0-5 (used only when --gif-dither bayer). Defaults to 1 for GIF"
    )
    parser.add_argument(
        "--gif-palette-stats",
        type=str,
        default=None,
        choices=["full", "diff"],
        help="palettegen stats mode. Defaults to diff for GIF when omitted"
    )
    return parser.parse_args()


def normalize_format(format_value: str | None) -> str | None:
    if not format_value:
        return None
    return format_value.lower().lstrip(".")


def validate_args(args: argparse.Namespace) -> tuple[Path, Path, str | None]:
    input_dir = Path(args.input).resolve()
    output_dir = Path(args.output).resolve()

    if not input_dir.exists() or not input_dir.is_dir():
        raise ValueError(f"Input folder does not exist or is not a directory: {input_dir}")

    if args.width <= 0:
        raise ValueError("--width must be > 0")

    if args.height is not None and args.height <= 0:
        raise ValueError("--height must be > 0 when provided")

    if args.fps is not None and args.fps <= 0:
        raise ValueError("--fps must be > 0 when provided")

    output_format = normalize_format(args.format)
    if output_format and output_format not in OUTPUT_FORMATS:
        allowed = ", ".join(sorted(OUTPUT_FORMATS))
        raise ValueError(f"Unsupported --format '{args.format}'. Allowed values: {allowed}")

    if output_format != "gif":
        if args.fps is not None:
            raise ValueError("--fps is only supported when --format gif is used")
        if args.gif_colors is not None:
            raise ValueError("--gif-colors requires --format gif")
        if args.gif_dither is not None:
            raise ValueError("--gif-dither requires --format gif")
        if args.gif_bayer_scale is not None:
            raise ValueError("--gif-bayer-scale requires --format gif")
        if args.gif_palette_stats is not None:
            raise ValueError("--gif-palette-stats requires --format gif")
    else:
        if args.gif_colors is not None and not 2 <= args.gif_colors <= 256:
            raise ValueError("--gif-colors must be between 2 and 256")
        if args.gif_bayer_scale is not None and not 0 <= args.gif_bayer_scale <= 5:
            raise ValueError("--gif-bayer-scale must be between 0 and 5")

    if shutil.which("ffmpeg") is None:
        raise ValueError("ffmpeg was not found in PATH. Install ffmpeg and try again")

    output_dir.mkdir(parents=True, exist_ok=True)
    return input_dir, output_dir, output_format


def make_scale_filter(width: int, height: int | None) -> str:
    if height is None:
        return f"scale={width}:-2"
    return f"scale={width}:{height}"


def build_output_path(
    src_file: Path,
    input_root: Path,
    output_root: Path,
    postfix: str,
    forced_format: str | None,
) -> Path:
    rel_parent = src_file.parent.relative_to(input_root)
    dest_dir = output_root / rel_parent
    dest_dir.mkdir(parents=True, exist_ok=True)

    source_ext = src_file.suffix.lower().lstrip(".")
    output_ext = forced_format if forced_format else source_ext
    return dest_dir / f"{src_file.stem}{postfix}.{output_ext}"


def run_ffmpeg(command: list[str]) -> bool:
    result = subprocess.run(
        command,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.PIPE,
        text=True,
        check=False,
    )
    if result.returncode != 0:
        error_text = (result.stderr or "").strip()
        if error_text:
            print(f"    ffmpeg error: {error_text}")
        return False
    return True


@dataclass(frozen=True)
class GifOptions:
    colors: int
    dither: str
    bayer_scale: int
    palette_stats: str


def resolve_gif_options(args: argparse.Namespace) -> GifOptions:
    colors = args.gif_colors if args.gif_colors is not None else 32
    dither = args.gif_dither if args.gif_dither is not None else "bayer"
    bayer_scale = args.gif_bayer_scale if args.gif_bayer_scale is not None else 1
    palette_stats = args.gif_palette_stats if args.gif_palette_stats is not None else "diff"
    return GifOptions(
        colors=colors,
        dither=dither,
        bayer_scale=bayer_scale,
        palette_stats=palette_stats,
    )


def resolve_gif_fps(args: argparse.Namespace) -> float:
    return args.fps if args.fps is not None else 15.0


def build_paletteuse_filter(options: GifOptions) -> str:
    paletteuse = f"paletteuse=dither={options.dither}"
    if options.dither == "bayer":
        paletteuse += f":bayer_scale={options.bayer_scale}"
    return paletteuse


def convert_standard_video(
    src_file: Path,
    dest_file: Path,
    scale_filter: str,
    overwrite: bool,
) -> bool:
    command = [
        "ffmpeg",
        "-hide_banner",
        "-loglevel",
        "error",
        "-y" if overwrite else "-n",
        "-i",
        str(src_file),
        "-vf",
        scale_filter,
        str(dest_file),
    ]
    return run_ffmpeg(command)


def convert_gif(
    src_file: Path,
    dest_file: Path,
    scale_filter: str,
    fps: float | None,
    gif_options: GifOptions,
    overwrite: bool,
) -> bool:
    gif_filter = scale_filter + ":flags=lanczos"
    if fps is not None:
        gif_filter = f"fps={fps},{gif_filter}"

    with tempfile.TemporaryDirectory() as temp_dir:
        palette_file = Path(temp_dir) / "palette.png"

        palettegen_command = [
            "ffmpeg",
            "-hide_banner",
            "-loglevel",
            "error",
            "-y",
            "-i",
            str(src_file),
            "-vf",
            f"{gif_filter},palettegen=max_colors={gif_options.colors}:stats_mode={gif_options.palette_stats}",
            str(palette_file),
        ]
        if not run_ffmpeg(palettegen_command):
            return False

        paletteuse_filter = build_paletteuse_filter(gif_options)

        convert_command = [
            "ffmpeg",
            "-hide_banner",
            "-loglevel",
            "error",
            "-y" if overwrite else "-n",
            "-i",
            str(src_file),
            "-i",
            str(palette_file),
            "-lavfi",
            f"{gif_filter} [x]; [x][1:v] {paletteuse_filter}",
            str(dest_file),
        ]
        return run_ffmpeg(convert_command)


def is_supported_video(file_path: Path) -> bool:
    return file_path.suffix.lower() in VIDEO_EXTENSIONS


def main() -> None:
    args = parse_args()

    try:
        input_root, output_root, forced_format = validate_args(args)
    except ValueError as error:
        print(f"Error: {error}")
        return

    postfix = args.postfix if args.postfix is not None else f"-{args.width}"
    scale_filter = make_scale_filter(args.width, args.height)
    default_gif_options = resolve_gif_options(args)
    effective_gif_fps = resolve_gif_fps(args)

    total_files = 0
    converted = 0
    skipped_existing = 0
    skipped_non_video = 0
    failed = 0

    for root, _, files in os.walk(input_root):
        for filename in files:
            total_files += 1
            source_file = Path(root) / filename

            if not is_supported_video(source_file):
                skipped_non_video += 1
                continue

            output_file = build_output_path(
                src_file=source_file,
                input_root=input_root,
                output_root=output_root,
                postfix=postfix,
                forced_format=forced_format,
            )

            if output_file.exists() and not args.overwrite:
                skipped_existing += 1
                continue

            print(f"Converting: {source_file}")
            print(f"       ->  {output_file}")

            output_format = forced_format if forced_format else source_file.suffix.lower().lstrip(".")
            if output_format == "gif":
                ok = convert_gif(
                    source_file,
                    output_file,
                    scale_filter,
                    effective_gif_fps,
                    default_gif_options,
                    args.overwrite,
                )
            else:
                ok = convert_standard_video(source_file, output_file, scale_filter, args.overwrite)

            if ok:
                converted += 1
            else:
                failed += 1

    print("\nDone")
    print(f"  Files scanned:          {total_files}")
    print(f"  Converted:              {converted}")
    print(f"  Skipped (existing):     {skipped_existing}")
    print(f"  Skipped (non-video):    {skipped_non_video}")
    print(f"  Failed:                 {failed}")


if __name__ == "__main__":
    main()