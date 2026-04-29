# Step Down Draw Speed

## Tujuan

Membuat animasi draw terasa lebih dramatis dengan pergantian data dummy yang cepat di awal lalu melambat menjelang reveal.

## Perilaku Utama

- Saat fase `rolling` dimulai, data dummy berganti sangat cepat.
- Mendekati akhir durasi, kecepatan pergantian menurun bertahap.
- Flash reveal tetap terjadi di akhir seperti desain sebelumnya.

## Tahap Kecepatan

- `0% - 45%`: cepat
- `45% - 75%`: medium
- `75% - 92%`: lambat
- `92% - flash`: sangat lambat

## Teknis

- Ganti loop interval tetap menjadi loop timeout bertahap.
- Setiap refresh dummy menghitung progress dan memilih delay berikutnya dari stage aktif.
- Perilaku final winner dan history tidak berubah.
