#!/usr/bin/env python3
"""Ekspor QR PNG tanpa layanan QR pihak ketiga.

Penggunaan:
  pip install "qrcode[pil]"
  python scripts/generate_qr.py --csv quick-qr-batch.csv --output qr-hasil

File CSV berasal dari Google Sheets tab Links: File -> Download -> CSV.
Kolom yang dipakai: Project, Kode, Judul, URL Permanen.
"""
import argparse
import csv
import re
import sys
from pathlib import Path
from urllib.parse import parse_qs, urlparse

EXPECTED = "https://mis-net1.github.io/quick-qr-batch/"
P_RE = re.compile(r"[a-z0-9][a-z0-9_-]{0,39}\Z")
C_RE = re.compile(r"[A-Za-z0-9][A-Za-z0-9._-]{0,59}\Z")


def main() -> int:
    parser = argparse.ArgumentParser(description="Quick QR Batch - generator QR permanen offline")
    parser.add_argument("--csv", required=True, help="CSV ekspor tab Links")
    parser.add_argument("--output", default="qr-hasil")
    parser.add_argument("--box-size", type=int, default=16, help="Ukuran modul QR dalam piksel")
    args = parser.parse_args()
    try:
        import qrcode
        from qrcode.constants import ERROR_CORRECT_M
    except ImportError:
        print('Modul belum ada. Jalankan: pip install "qrcode[pil]"', file=sys.stderr)
        return 2
    out = Path(args.output)
    out.mkdir(parents=True, exist_ok=True)
    made = 0
    seen = set()
    with open(args.csv, "r", encoding="utf-8-sig", newline="") as fh:
        reader = csv.DictReader(fh)
        required = {"Project", "Kode", "Judul", "URL Permanen"}
        if not required.issubset(reader.fieldnames or []):
            raise ValueError(f"CSV butuh kolom: {', '.join(sorted(required))}")
        for row_num, row in enumerate(reader, 2):
            project = (row.get("Project") or "").strip()
            code = (row.get("Kode") or "").strip()
            qr_url = (row.get("URL Permanen") or "").strip()
            if not (project or code or qr_url):
                continue
            if not P_RE.fullmatch(project) or not C_RE.fullmatch(code):
                raise ValueError(f"Baris {row_num}: Project/Kode tidak valid")
            identifier = f"{project}/{code}"
            if identifier in seen:
                raise ValueError(f"Duplikat: {identifier}")
            seen.add(identifier)
            parsed = urlparse(qr_url)
            if qr_url.split("?", 1)[0] != EXPECTED.rstrip("/") + "/":
                raise ValueError(f"Baris {row_num}: bukan alamat QR permanen Quick QR Batch")
            params = parse_qs(parsed.query)
            if params.get("p") != [project] or params.get("c") != [code]:
                raise ValueError(f"Baris {row_num}: Project/Kode berbeda dari URL permanen")
            qr = qrcode.QRCode(version=None, error_correction=ERROR_CORRECT_M,
                               box_size=args.box_size, border=4)
            qr.add_data(qr_url)
            qr.make(fit=True)
            path = out / project
            path.mkdir(parents=True, exist_ok=True)
            fname = path / f"{code}.png"
            qr.make_image(fill_color="black", back_color="white").save(fname)
            made += 1
    print(f"Selesai: {made} QR PNG dibuat di {out.resolve()}")
    print("Uji scan 2-3 sampel sebelum dicetak massal.")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
