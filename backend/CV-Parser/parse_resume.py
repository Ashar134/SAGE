#!/usr/bin/env python3
import argparse
import json
from pathlib import Path

from resume_parser import parse_resume


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Parse resume PDF into structured JSON."
    )
    parser.add_argument("pdf", help="Path to resume PDF")
    parser.add_argument(
        "-o", "--out", help="Optional output JSON path (defaults to stdout)"
    )
    args = parser.parse_args()

    result = parse_resume(args.pdf)
    if args.out:
        out_path = Path(args.out)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(json.dumps(result, indent=2, ensure_ascii=False))
        print(f"Wrote {out_path}")
    else:
        print(json.dumps(result, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
