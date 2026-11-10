# Quick QR Batch

**Satu repository untuk banyak proyek QR permanen, tanpa iklan.**

Owner: **mis-net1** • Repo: **quick-qr-batch** • Status: **starter siap dikonfigurasi**

## Konsep

Alur: **QR tercetak → GitHub Pages → data/links.json → URL tujuan terbaru**.

Contoh URL QR untuk proyek baru:

https://mis-net1.github.io/quick-qr-batch/?p=museum-ar&c=M01

https://mis-net1.github.io/quick-qr-batch/?p=flashcard-anak&c=A1

**Alamat tersebut hanya berfungsi setelah GitHub Pages aktif dan kode tujuan terdaftar.** Parameter p adalah nama proyek (huruf kecil, tanpa spasi); c adalah kode kartu.

## Fitur

- Banyak proyek dan kartu dalam satu Google Sheets (satu baris per QR).
- URL cetak *statis* pada kolom E; URL tujuan boleh diperbarui dari kolom D.
- Apps Script mengumpulkan perubahan dan mengirim satu commit data JSON ke GitHub.
- Checklist Kirim, status, waktu, tautan commit dan tab Riwayat.
- Tab Register untuk mendata URL yang sudah dibuat.
- Generator QR PNG secara **offline** tanpa watermark maupun penyedia QR beriklan.
- SKILL.md dan panduan untuk penggunaan ulang di proyek berikutnya.
- Halaman perantara sendiri tidak memuat iklan, analytics, atau pelacak.

## Mulai dari sini

1. Aktifkan **Settings → Pages → Deploy from branch → main → /(root)**.
2. Verifikasi halaman https://mis-net1.github.io/quick-qr-batch/ tampil (jika tanpa parameter, akan muncul pemberitahuan QR belum terdaftar).
3. Buat Google Sheets master dengan header tepat:
   
   Project | Kode | Judul | URL Tujuan | URL Permanen | Kirim | Status | Update WIB | Commit | Keterangan

4. Di spreadsheet: **Ekstensi → Apps Script**, tempel isi file [apps-script/Code.gs](apps-script/Code.gs).
5. Dari akun GitHub mis-net1, buat Fine-grained PAT **khusus quick-qr-batch** dengan izin **Contents: Read and write**. Simpan hanya pada **Apps Script → Setelan project → Properti skrip** bernama **GITHUB_TOKEN**.
6. Jalankan fungsi **pasangSistem()** satu kali dan izinkan akses yang diperlukan. Refresh Sheets untuk memunculkan menu **Quick QR Batch**.
7. Isi Project, Kode, Judul, URL Tujuan; klik menu **Buat/daftarkan URL QR permanen**. Cek kolom E sebelum memasukkan alamat ke media cetak.
8. Pilih **Sinkronkan semua perubahan sekarang** untuk uji pertama. Selanjutnya edit kolom D akan mengantrikan sinkronisasi otomatis (sekitar ≥1 menit).
9. Periksa status SUKSES DI GITHUB, tunggu GitHub Pages terbit, lalu uji scan QR pada ponsel sebelum cetak massal.

Petunjuk lengkap: [Instalasi](docs/INSTALL.md) • [Operasional](docs/OPERASIONAL.md).

## Menghasilkan gambar QR PNG

Ekspor tab Links sebagai CSV, lalu jalankan di komputer yang terinstal Python 3:

~~~bash
pip install "qrcode[pil]"
python scripts/generate_qr.py --csv Links.csv --output qr-hasil
~~~

QR dibuat secara lokal dari alamat permanen, tanpa mengandalkan layanan pihak ketiga. Contoh data tersedia di folder [contoh](contoh/).

## Catatan penting

- **Jangan ganti owner, nama repo, alamat Pages, project ID, atau kode kartu setelah QR dicetak.** QR cetak tidak akan otomatis mengikuti perubahan alamat dasar.
- Domain github.io gratis tetapi keberlanjutan URL **bergantung pada GitHub dan akun tetap aktif**; untuk jangka sangat panjang pertimbangkan domain sendiri sebelum cetak.
- GitHub Pages bersifat statis, bukan penyedia SLA permanen. Commit berhasil ≠ deploy Pages selesai ≠ filter TikTok masih aktif.
- Jangan menaruh PAT/token pada repo publik, Google Sheets, gambar, atau tangkapan layar.
- URL tujuan di data/links.json bersifat publik: jangan menyimpan data rahasia.
- Apabila URL tujuan di Sheets kosong, sistem tidak akan menimpa tujuan GitHub yang sudah ada.
- Batasi akses Editor spreadsheet karena editor Apps Script terikat mungkin dapat mengakses Project Settings.
- **Tidak ada lisensi yang dipilih saat ini (No license)**. Repository publik bisa dibaca, tetapi hak pakai ulang tidak otomatis diberikan.

Penting: repository ini untuk **proyek QR baru**. QR cetak lama Diamond Sains / Safety Child tetap memakai repositori asalnya.
