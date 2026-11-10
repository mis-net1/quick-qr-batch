# Panduan operasional harian

## Perbarui tujuan tanpa ganti QR
1. Temukan baris Project + Kode yang benar di tab Links.
2. Uji URL tujuan baru pada HP. Tempel **hanya di kolom D**.
3. Perubahan otomatis antre untuk satu commit batch setelah sekitar satu menit; atau pilih menu **Quick QR Batch → Sinkronkan semua perubahan sekarang**.
4. Baca G (status), H (waktu), I (commit), J (keterangan).
5. Setelah status SUKSES DI GITHUB, uji URL Permanen di E setelah GitHub Pages deploy.
6. QR cetak tetap memakai alamat E yang sama.

## Banyak proyek
Gunakan Project unik (misalnya museum-ar, produk-umkm, modul-anak) dan Kode berbeda dalam setiap project. **Jangan ulang pasangan Project/Kode untuk materi yang berbeda**.

## Register dan Riwayat
Tab Register menyimpan kode dan URL permanen yang sudah dibuat; tidak untuk diedit bebas. Tab Riwayat menyimpan tujuan sebelumnya, tujuan baru, waktu dan commit. GitHub juga menyimpan versi data/links.json di histori commit.

## Diagnostik
- GAGAL / HTTP 403: token salah izin/expired.
- MENUNGGU URL: isi target HTTPS di D.
- TIDAK BERUBAH: GitHub sudah punya target yang sama.
- QR belum terdaftar: cek nama proyek & kode dan registrasi di data/links.json.
- QR ke link lama: cek Pages deployment dan cache browser.
- Target TikTok mengarah ke beranda: ganti URL TikTok, bukan alamat QR permanen.

## Kebijakan
Jangan simpan data sensitif, rahasia atau token di registry publik. Jika URL tujuan dikosongkan, skrip tidak menghapus data Github; tunggu pengganti valid. Jangan memindahkan QR tercetak dari repository lain ke sini tanpa rencana migrasi.
