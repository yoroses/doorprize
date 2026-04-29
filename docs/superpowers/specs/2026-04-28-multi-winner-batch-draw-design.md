# Multi Winner Batch Draw

## Tujuan

Menambah setting admin agar satu kali klik `Draw` bisa langsung menghasilkan beberapa pemenang sekaligus, dengan angka tetap acak.

## Perilaku Utama

- Admin mengatur `jumlah pemenang per draw`.
- Contoh: jika nilainya `5`, maka satu kali klik `Draw` langsung menghasilkan 5 angka pemenang.
- Semua angka dipilih secara acak.
- Jika mode tanpa pengulangan aktif, angka yang sudah pernah menang tidak boleh keluar lagi.
- Semua pemenang tampil serentak pada akhir satu animasi draw.
- Jika jumlah pemenang yang diminta lebih besar dari sisa angka yang tersedia, aplikasi mengeluarkan semua angka yang masih tersedia.

## Validasi Admin

- Jumlah pemenang per draw minimal `1`.
- Jumlah pemenang per draw tidak boleh melebihi total angka dalam range saat disimpan.

## Perubahan Data

- Hapus setting preset angka pemenang.
- Tambah setting `winnersPerDraw: number`.
- Nilai default adalah `1`.

## Perubahan UI

- Admin panel:
  - Ganti field preset angka menjadi field jumlah pemenang per draw.
  - Tambahkan helper text bahwa satu klik draw akan langsung menghasilkan beberapa pemenang acak sekaligus.
- Home page:
  - Jika `winnersPerDraw > 1`, area hasil menampilkan grid beberapa pemenang.
  - Tombol draw menyesuaikan label agar mencerminkan jumlah pemenang.

## History

- Semua pemenang hasil satu draw disimpan ke history pada aksi draw yang sama.
- History tetap menggunakan entri per angka agar kompatibel dengan logika eksklusi.

## Error Handling

- Jika tidak ada angka tersisa, draw diblokir dan user diarahkan untuk reset history.

## Testing

- Test helper pemilihan pemenang acak jamak.
- Test bahwa hasil tidak mengandung angka yang dikecualikan.
- Test bahwa jumlah hasil tidak melebihi pool angka yang tersedia.
