# Instalasi Quick QR Batch

## A. GitHub Pages
Buka repository https://github.com/mis-net1/quick-qr-batch.
Di **Settings → Pages** pilih **Deploy from a branch**, branch **main**, folder **/(root)**, lalu **Save**. Uji https://mis-net1.github.io/quick-qr-batch/.

## B. Spreadsheet master
Buat Google Sheets baru milik admin dengan tab bernama **Links**. Gunakan header A1:J1 persis:

Project | Kode | Judul | URL Tujuan | URL Permanen | Kirim | Status | Update WIB | Commit | Keterangan

Alternatif: gunakan template XLSX yang dapat diunduh dari paket pendamping Quick QR Batch. Baris baru adalah QR baru; Project format lowercase seperti museum-ar, Kode misalnya M01.

## C. Apps Script dan token
Buka spreadsheet → **Ekstensi → Apps Script**. Ganti Kode.gs dengan isi [Code.gs](../apps-script/Code.gs) dan simpan.

Login GitHub **mis-net1** → Settings → Developer settings → Personal access tokens → Fine-grained → New token. Pilih resource owner mis-net1, hanya repository quick-qr-batch, Contents: **Read and write**, Metadata: read. Gunakan masa berlaku terbatas.

Di Apps Script Project Settings → Script Properties isi **GITHUB_TOKEN** dengan nilai token (rahasia, jangan diunggah).

Jalankan **pasangSistem()** dan izinkan otorisasi Google. Jika log SETUP BERHASIL, refresh spreadsheet. Menu Quick QR Batch akan muncul.

## D. Uji satu kode
Di baris 2 isi: Project=uji-contoh, Kode=A1, Judul=Uji QR, URL Tujuan=https://example.com.
Pilih menu **Quick QR Batch → Buat/daftarkan URL QR permanen**, lalu **Sinkronkan semua perubahan sekarang**. Periksa status kolom G dan commit I. Tunggu Pages terbit lalu buka URL kolom E di browser. Pastikan diarahkan ke example.com.

**Jangan cetak kode uji.** Setelah uji, Anda bisa menambahkan proyek sesungguhnya.

## E. Cetak QR massal
Ekspor tab Links sebagai CSV. Di PC yang terpasang Python:

~~~bash
pip install "qrcode[pil]"
python scripts/generate_qr.py --csv Links.csv --output qr-hasil
~~~

QR PNG yang dibuat adalah gambar QR statis tanpa iklan/watermark.

## Catatan pengamanan
Jangan mengubah project/code, URL Permanen, nama user/repo setelah cetak. Simpan token di Apps Script, jangan di Sheets/GitHub. Jika gagal 403, periksa token. Commit sukses belum menjamin Pages terbit dan tujuan TikTok aktif.
