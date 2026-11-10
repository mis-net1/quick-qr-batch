# SKILL — Quick QR Batch

## Tujuan
Bantu pemilik mengelola QR permanen untuk banyak proyek melalui GitHub Pages dan Google Sheets, tanpa mengganti QR yang sudah dicetak.

## Sumber dan kontrak
- Repository utama: https://github.com/mis-net1/quick-qr-batch
- GitHub Pages: https://mis-net1.github.io/quick-qr-batch/
- Registry: data/links.json
- Apps Script: apps-script/Code.gs
- Sheet master: tab Links, Register, Riwayat
- URL permanen: https://mis-net1.github.io/quick-qr-batch/?p=PROJECT&c=CODE

## Aturan kerja
1. **JANGAN ubah URL QR yang sudah dicetak** (owner, repo, path, project, code).
2. Satu baris di Links mewakili satu pasangan Project dan Kode yang unik.
3. Kolom E URL Permanen disimpan sebagai *nilai statis*, bukan formula dinamis.
4. Target di D harus HTTPS dan bukan URL internal/rahasia.
5. Jika target rusak, perbarui D; jangan menghapus atau menimpa URL permanen.
6. Perubahan massal sebaiknya satu commit JSON, bukan satu commit per QR.
7. Verifikasi tiga status secara terpisah: commit GitHub, deploy GitHub Pages, dan destinasi berfungsi.
8. Catat riwayat sebelum perubahan yang dapat berdampak pada QR tercetak; uji satu item lebih dulu.
9. Semua kredensial hanya di Project Settings → Script Properties, tidak pernah di file publik.
10. Jangan otomatis memigrasikan QR cetak Diamond Sains / Safety Child ke repository ini.

## Langkah implementasi
- Aktifkan Pages dari main root.
- Buat Google Sheets master; pasang Apps Script dan PAT terbatas.
- Jalankan pasangSistem dan uji sinkronisasi satu baris.
- Gunakan generator offline untuk gambar QR, uji scanner lalu cetak.
- Untuk revisi besar, buat cadangan dan jangan memodifikasi kontrak URL yang tercetak.

## Diagnose
- 403 GitHub: cek resource owner, masa aktif PAT, izin Contents read/write.
- QR belum terdaftar: cek p/c dan data/links.json.
- GitHub commit sukses tetapi redirect belum berubah: cek Actions/Pages dan cache.
- Destinasi TikTok beranda: cari link efek terbaru, jangan mengubah URL QR.
- Duplikat Project/Kode: hentikan; jangan terbitkan dua tujuan ke URL yang sama.

Proyek belum menetapkan lisensi; jangan mengklaim open source berlisensi MIT.
