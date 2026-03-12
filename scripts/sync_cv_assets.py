#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
from pathlib import Path
from urllib.parse import unquote


REPO_ROOT = Path(__file__).resolve().parents[1]
DATA_FILE = REPO_ROOT / "_data" / "cv_links.yml"
DEST_ROOT = REPO_ROOT / "assets" / "cv" / "linked"
DEFAULT_SOURCE = Path("/Users/danielaronoff/Documents/GitHub/daronoff-cv-assets")
CV_PDF = REPO_ROOT / "assets" / "cv" / "daniel-joseph-aronoff-cv.pdf"


def run(cmd: list[str]) -> str:
    result = subprocess.run(cmd, check=True, capture_output=True, text=True)
    return result.stdout


def load_yaml(path: Path):
    ruby = (
        "require 'yaml'; require 'json'; "
        "data = YAML.load_file(ARGV[0]); "
        "puts JSON.generate(data)"
    )
    return json.loads(run(["ruby", "-e", ruby, str(path)]))


def extract_pdf_source_files(pdf_path: Path) -> set[str]:
    if not pdf_path.exists():
        return set()
    output = run(["pdfinfo", "-url", str(pdf_path)])
    discovered = set()
    for line in output.splitlines():
        if "raw.githubusercontent.com" not in line:
            continue
        url = line.split()[-1]
        discovered.add(unquote(url.rsplit("/", 1)[-1]))
    return discovered


def flatten_assets(groups: list[dict]) -> list[dict]:
    assets: list[dict] = []
    for group in groups:
        for item in group.get("items", []):
            source_file = item.get("source_file")
            asset_target = item.get("asset_target")
            if not source_file or not asset_target:
                continue
            assets.append(
                {
                    "title": item["title"],
                    "source_file": source_file,
                    "asset_target": asset_target.lstrip("/"),
                }
            )
    return assets


def find_source(source_root: Path, filename: str) -> Path | None:
    direct = source_root / filename
    if direct.exists():
        return direct
    matches = list(source_root.rglob(filename))
    if matches:
        return matches[0]
    return None


def main() -> int:
    parser = argparse.ArgumentParser(description="Sync CV-linked local assets into assets/cv/linked.")
    parser.add_argument("--source", type=Path, default=DEFAULT_SOURCE, help="Source asset repo path.")
    parser.add_argument("--dest", type=Path, default=DEST_ROOT, help="Destination directory.")
    parser.add_argument("--dry-run", action="store_true", help="Log intended actions without copying files.")
    args = parser.parse_args()

    groups = load_yaml(DATA_FILE)
    assets = flatten_assets(groups)
    embedded = extract_pdf_source_files(CV_PDF)

    print(f"Source repo: {args.source}")
    print(f"Destination: {args.dest}")
    print(f"Assets referenced in {DATA_FILE.name}: {len(assets)}")
    print(f"Embedded GitHub PDF filenames found in CV: {len(embedded)}")

    if not args.source.exists():
        print("Source repo not found. Nothing copied.", file=sys.stderr)
        return 1

    args.dest.mkdir(parents=True, exist_ok=True)
    copied = 0
    skipped = 0
    missing: list[str] = []

    for asset in assets:
        source_path = find_source(args.source, asset["source_file"])
        destination_path = REPO_ROOT / asset["asset_target"]

        if source_path is None:
            missing.append(asset["source_file"])
            print(f"MISSING  {asset['source_file']}  ({asset['title']})")
            continue

        destination_path.parent.mkdir(parents=True, exist_ok=True)

        if destination_path.exists() and destination_path.read_bytes() == source_path.read_bytes():
            skipped += 1
            print(f"UNCHANGED  {destination_path.relative_to(REPO_ROOT)}")
            continue

        if args.dry_run:
            copied += 1
            print(f"WOULD COPY  {source_path} -> {destination_path.relative_to(REPO_ROOT)}")
            continue

        shutil.copy2(source_path, destination_path)
        copied += 1
        print(f"COPIED  {source_path} -> {destination_path.relative_to(REPO_ROOT)}")

    if missing:
        print("\nMissing source files:")
        for filename in missing:
            print(f"- {filename}")

    print(f"\nSummary: copied={copied} skipped={skipped} missing={len(missing)}")
    return 0 if not missing else 1


if __name__ == "__main__":
    raise SystemExit(main())
