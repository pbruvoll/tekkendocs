#!/usr/bin/env python3
"""
Download move videos for all Tekken 8 characters from wavu.wiki.

Usage:
    python downloadWavuVids.py -O ./videos
    python downloadWavuVids.py -O ./videos --offset 5  # Start from 6th character
    python downloadWavuVids.py -O ./videos --character kazuya  # Single character
"""

import argparse
import json
import os
import re
import time
import requests

# Wavu wiki API endpoint
WAVU_API = "https://wavu.wiki/w/api.php"

# Path to character list JSON (relative to this script)
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
CHARACTER_LIST_PATH = os.path.join(SCRIPT_DIR, "wavu-importer", "src", "resources", "character_list.json")

# Delay between requests (in seconds)
REQUEST_DELAY = 1.0


def load_characters() -> list[dict]:
    """Load character list from character_list.json."""
    with open(CHARACTER_LIST_PATH, 'r', encoding='utf-8') as f:
        return json.load(f)


def sanitize_filename(filename: str) -> str:
    """Sanitize a filename by removing/replacing invalid characters."""
    invalid_chars = r'[<>:"/\\|?*]'
    sanitized = re.sub(invalid_chars, '_', filename)
    sanitized = sanitized.strip(' .')
    return sanitized


def get_moves_with_videos(character: str) -> list[dict]:
    """Query the wavu.wiki Cargo API to get all moves with videos for a character."""
    moves = []
    offset = 0
    limit = 50

    while True:
        params = {
            "action": "cargoquery",
            "tables": "Move",
            "fields": "id,name,input,video",
            "where": f"id LIKE '{character}-%' AND video IS NOT NULL AND video != ''",
            "limit": limit,
            "offset": offset,
            "format": "json"
        }

        try:
            response = requests.get(WAVU_API, params=params, timeout=30)
            response.raise_for_status()
            data = response.json()
        except requests.RequestException as e:
            print(f"  Error querying moves for {character}: {e}")
            break

        results = data.get("cargoquery", [])
        if not results:
            break

        for item in results:
            move = item.get("title", {})
            if move.get("video"):
                moves.append({
                    "id": move.get("id", ""),
                    "name": move.get("name", ""),
                    "input": move.get("input", ""),
                    "video": move.get("video", "")
                })

        if len(results) < limit:
            break

        offset += limit
        time.sleep(REQUEST_DELAY)

    return moves


def get_video_url(file_title: str) -> str | None:
    """Get the direct download URL for a video file from wavu.wiki."""
    if file_title.startswith("File:"):
        file_title = file_title[5:]

    params = {
        "action": "query",
        "titles": f"File:{file_title}",
        "prop": "imageinfo",
        "iiprop": "url",
        "format": "json"
    }

    try:
        response = requests.get(WAVU_API, params=params, timeout=30)
        response.raise_for_status()
        data = response.json()
    except requests.RequestException as e:
        print(f"    Error getting URL for {file_title}: {e}")
        return None

    pages = data.get("query", {}).get("pages", {})
    for page_id, page_data in pages.items():
        if page_id == "-1":
            return None
        imageinfo = page_data.get("imageinfo", [])
        if imageinfo:
            return imageinfo[0].get("url")

    return None


def download_video(url: str, output_path: str) -> bool:
    """Download a video file from the given URL."""
    try:
        response = requests.get(url, stream=True, timeout=60)
        response.raise_for_status()

        with open(output_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        return True
    except requests.RequestException as e:
        print(f"    Error downloading {url}: {e}")
        return False


def get_video_filename(video_field: str) -> str:
    """Extract the filename from the video field (e.g., 'File:t8-p2-asuka-1,1.mp4' -> 't8-p2-asuka-1,1.mp4')."""
    if video_field.startswith("File:"):
        return video_field[5:]
    return video_field


def download_character_videos(character_name: str, output_dir: str, max_videos: int = 0) -> tuple[int, int]:
    """Download all videos for a character. Returns (downloaded, skipped) counts."""
    print(f"\nProcessing {character_name}...")

    # Create character folder using lowercase name (matching json_movelist format)
    folder_name = character_name.lower().replace(" ", "-").replace("-8", "8")
    char_folder = os.path.join(output_dir, folder_name)
    os.makedirs(char_folder, exist_ok=True)

    # Get moves with videos
    moves = get_moves_with_videos(character_name)
    print(f"  Found {len(moves)} moves with videos")

    # Limit number of videos if specified
    if max_videos > 0:
        moves = moves[:max_videos]
        print(f"  Limiting to {max_videos} videos")

    downloaded = 0
    skipped = 0

    for move in moves:
        video_field = move["video"]
        
        # Use the exact filename from the video field
        video_filename = get_video_filename(video_field)
        output_filename = sanitize_filename(video_filename)
        output_path = os.path.join(char_folder, output_filename)

        # Skip if already downloaded
        if os.path.exists(output_path):
            skipped += 1
            continue

        # Get video URL
        time.sleep(REQUEST_DELAY)
        video_url = get_video_url(video_field)
        if not video_url:
            print(f"    Could not get URL for: {video_field}")
            continue

        # Download video
        print(f"    Downloading: {video_filename}")
        time.sleep(REQUEST_DELAY)
        if download_video(video_url, output_path):
            downloaded += 1
        else:
            # Clean up partial download
            if os.path.exists(output_path):
                os.remove(output_path)

    return downloaded, skipped


def main():
    parser = argparse.ArgumentParser(
        description="Download move videos from wavu.wiki for Tekken 8 characters"
    )
    parser.add_argument(
        "-O", "--output",
        required=True,
        help="Output directory for downloaded videos"
    )
    parser.add_argument(
        "--offset",
        type=int,
        default=0,
        help="Start from character at this index (0-based)"
    )
    parser.add_argument(
        "--character",
        type=str,
        help="Download videos for a single character only"
    )
    parser.add_argument(
        "--delay",
        type=float,
        default=1.0,
        help="Delay between requests in seconds (default: 1.0)"
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=0,
        help="Maximum number of videos to download per character (0 = unlimited)"
    )

    args = parser.parse_args()

    global REQUEST_DELAY
    REQUEST_DELAY = args.delay

    # Load characters from JSON
    try:
        all_characters = load_characters()
    except FileNotFoundError:
        print(f"Error: Character list not found at {CHARACTER_LIST_PATH}")
        return
    except json.JSONDecodeError as e:
        print(f"Error parsing character list: {e}")
        return

    # Create output directory
    os.makedirs(args.output, exist_ok=True)

    # Determine which characters to process
    if args.character:
        # Find matching character (case-insensitive)
        char_lower = args.character.lower()
        matching = [c for c in all_characters if c["name"].lower() == char_lower]
        if not matching:
            print(f"Character '{args.character}' not found. Available characters:")
            for c in all_characters:
                print(f"  - {c['name']}")
            return
        characters = matching
    else:
        characters = all_characters[args.offset:]

    print(f"Will process {len(characters)} character(s)")
    print(f"Output directory: {args.output}")
    print(f"Request delay: {REQUEST_DELAY}s")

    total_downloaded = 0
    total_skipped = 0

    for i, character in enumerate(characters):
        char_name = character["name"]
        print(f"\n[{i + 1 + args.offset}/{len(all_characters)}] {char_name}")
        downloaded, skipped = download_character_videos(char_name, args.output, args.limit)
        total_downloaded += downloaded
        total_skipped += skipped
        print(f"  Downloaded: {downloaded}, Skipped: {skipped}")

    print(f"\n{'=' * 40}")
    print(f"Complete! Downloaded: {total_downloaded}, Skipped: {total_skipped}")


if __name__ == "__main__":
    main()
