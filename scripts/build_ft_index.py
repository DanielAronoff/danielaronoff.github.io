#!/usr/bin/env python3
from __future__ import annotations

import argparse
import csv
import hashlib
import json
import re
import shutil
import subprocess
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
OUTPUT_ROOT = REPO_ROOT / "assets" / "ft-letters"
DATA_FILE = REPO_ROOT / "_data" / "ft_letters.yml"
OVERRIDES_FILE = REPO_ROOT / "_data" / "ft_letters_overrides.yml"
SOURCE_CANDIDATES = [
    Path("/Users/danielaronoff/Dropbox/Personal/Users/danielaronoff/Dropbox/Personal/DJA_FT_Letters_Archive"),
    Path("/Users/danielaronoff/Dropbox/Personal/DJA_FT_Letters_Archive"),
    Path("/Users/danielaronoff/Dropbox/Personal/FT letters/DJA_FT_Letters_Archive"),
]


def run(cmd: list[str]) -> str:
    result = subprocess.run(cmd, check=True, capture_output=True, text=True)
    return result.stdout


def load_yaml(path: Path):
    if not path.exists():
        return {}
    ruby = (
        "require 'yaml'; require 'json'; "
        "data = YAML.load_file(ARGV[0]) || {}; "
        "puts JSON.generate(data)"
    )
    return json.loads(run(["ruby", "-e", ruby, str(path)]))


def choose_source(explicit: Path | None) -> Path:
    candidates = [explicit] if explicit else []
    candidates.extend(SOURCE_CANDIDATES)
    for candidate in candidates:
        if candidate and (candidate / "letters").exists():
            return candidate
    raise FileNotFoundError("No FT archive source directory was found.")


def title_from_slug(slug: str) -> str:
    text = slug.replace("-", " ").replace("_", " ").strip()
    text = re.sub(r"\s+", " ", text)
    titled = text.title()
    titled = titled.replace("Us ", "US ").replace(" Us", " US")
    titled = titled.replace("Ft ", "FT ").replace(" Ficc", " FICC")
    titled = titled.replace("PoW", "PoW")
    return titled


def load_manifest(source_root: Path) -> dict[str, dict]:
    manifest_path = source_root / "manifest.json"
    if not manifest_path.exists():
        return {}
    manifest = json.loads(manifest_path.read_text())
    result: dict[str, dict] = {}
    for item in manifest.get("letters", []):
        key = Path(item["rel_dir"]).name
        result[key] = item
    return result


def load_review_reasons(source_root: Path) -> dict[str, list[str]]:
    review_path = source_root / "needs_review.csv"
    reasons: dict[str, list[str]] = {}
    if not review_path.exists():
        return reasons
    with review_path.open(newline="", encoding="utf-8", errors="ignore") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            source_pdf = row.get("source_pdf") or ""
            stem = Path(source_pdf).stem
            if "__" not in stem:
                continue
            key = stem.split("_imported-from", 1)[0]
            reason = row.get("reason") or row.get("context") or "review"
            reasons.setdefault(key, []).append(reason)
    return reasons


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        while True:
            chunk = handle.read(1024 * 1024)
            if not chunk:
                break
            digest.update(chunk)
    return digest.hexdigest()


def yaml_quote(value: str) -> str:
    escaped = value.replace("\\", "\\\\").replace('"', '\\"')
    return f'"{escaped}"'


def dump_yaml(entries: list[dict], destination: Path) -> None:
    lines: list[str] = []
    for entry in entries:
        lines.append("- date: " + yaml_quote(entry["date"]))
        lines.append("  title: " + yaml_quote(entry["title"]))
        lines.append("  year: " + str(entry["year"]))
        lines.append("  slug: " + yaml_quote(entry["slug"]))
        lines.append("  source_filename: " + yaml_quote(entry["source_filename"]))
        lines.append("  pdf: " + yaml_quote(entry["pdf"]))
        lines.append("  rel_dir: " + yaml_quote(entry["rel_dir"]))
        if entry.get("review_flags"):
            lines.append("  review_flags:")
            for flag in entry["review_flags"]:
                lines.append("    - " + yaml_quote(flag))
    destination.write_text("\n".join(lines) + "\n")


def main() -> int:
    parser = argparse.ArgumentParser(description="Build FT letters index and copy PDFs into the site.")
    parser.add_argument("--source", type=Path, help="Optional FT archive root.")
    parser.add_argument("--dest", type=Path, default=OUTPUT_ROOT, help="Output PDF directory.")
    parser.add_argument("--data", type=Path, default=DATA_FILE, help="Output YAML data file.")
    parser.add_argument("--overrides", type=Path, default=OVERRIDES_FILE, help="Override YAML file.")
    parser.add_argument("--report-only", action="store_true", help="Only report archive sizing without copying files.")
    args = parser.parse_args()

    source_root = choose_source(args.source)
    letters_root = source_root / "letters"
    manifest = load_manifest(source_root)
    review_reasons = load_review_reasons(source_root)
    overrides = load_yaml(args.overrides)

    pdf_paths = sorted(letters_root.rglob("letter.pdf"))
    total_size = sum(path.stat().st_size for path in pdf_paths)
    largest = max(pdf_paths, key=lambda path: path.stat().st_size) if pdf_paths else None

    print(f"Source archive: {source_root}")
    print(f"Letter count: {len(pdf_paths)}")
    print(f"Total size: {total_size} bytes")
    if largest:
        print(f"Largest file: {largest.relative_to(source_root)} ({largest.stat().st_size} bytes)")

    if args.report_only:
        return 0

    args.dest.mkdir(parents=True, exist_ok=True)
    entries: list[dict] = []
    copied = 0
    unchanged = 0
    unresolved: list[str] = []

    for pdf_path in pdf_paths:
        rel_dir = pdf_path.parent.relative_to(source_root / "letters")
        year = rel_dir.parts[0]
        folder_name = rel_dir.parts[1]
        date_part, slug = folder_name.split("__", 1)

        manifest_item = manifest.get(folder_name, {})
        override = overrides.get(folder_name, {})

        title = override.get("title") or manifest_item.get("title") or title_from_slug(slug)
        date_value = override.get("date") or manifest_item.get("date") or date_part

        output_pdf = args.dest / year / f"{folder_name}.pdf"
        output_pdf.parent.mkdir(parents=True, exist_ok=True)

        if output_pdf.exists() and sha256(output_pdf) == sha256(pdf_path):
            unchanged += 1
        else:
            shutil.copy2(pdf_path, output_pdf)
            copied += 1

        flags = list(dict.fromkeys(review_reasons.get(folder_name, [])))
        confidence = float(manifest_item.get("title_confidence", 100) or 100)
        if not manifest_item:
            flags.append("missing_from_manifest")
        if confidence < 80 and not override.get("title"):
            flags.append(f"low_title_confidence:{confidence}")
        if "ft-com-eters" in folder_name:
            flags.append("unclear_slug")

        if flags:
            unresolved.append(f"{folder_name}: {', '.join(flags)}")

        source_filename = Path(manifest_item.get("source_pdf", output_pdf.name)).name
        entries.append(
            {
                "date": date_value,
                "title": title,
                "year": int(date_value[:4]),
                "slug": folder_name,
                "source_filename": source_filename,
                "pdf": "/" + str(output_pdf.relative_to(REPO_ROOT)).replace("\\", "/"),
                "rel_dir": f"letters/{rel_dir.as_posix()}",
                "review_flags": flags,
            }
        )

    entries.sort(key=lambda item: (item["date"], item["slug"]), reverse=True)
    dump_yaml(entries, args.data)

    print(f"Copied: {copied}")
    print(f"Unchanged: {unchanged}")
    print(f"Index written to: {args.data}")
    if unresolved:
        print("Unresolved or uncertain entries:")
        for issue in unresolved:
            print(f"- {issue}")
    else:
        print("No unresolved entries.")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
