# Drum Roll Reveal Animation

## Tujuan

Membuat momen draw terasa lebih dramatis dan panggung-ready dengan animasi yang membangun tensi lalu me-reveal pemenang secara kuat.

## Perilaku Utama

- Saat tombol `Draw` ditekan, area hasil masuk ke mode fokus.
- Panel hasil sedikit membesar, border emas menyala, dan latar sekitar terasa lebih redup.
- Selama fase rolling, isi panel menampilkan data dummy yang berganti cepat untuk menciptakan efek drum roll.
- Menjelang akhir animasi, muncul flash putih-emas singkat.
- Setelah flash, pemenang asli muncul serentak.
- Untuk multi-winner, kartu masuk dengan stagger kecil agar hasil terasa hidup, tetapi tetap terbaca sebagai satu reveal.

## Fase Animasi

- `idle`
  - State normal sebelum draw.
- `rolling`
  - Durasi utama sekitar 2.2 sampai 2.8 detik.
  - Border glow aktif.
  - Panel sedikit zoom-in.
  - Data dummy terus berganti.
- `flash`
  - Durasi sangat singkat sekitar 120 sampai 180 ms.
  - Overlay putih-emas muncul untuk transisi reveal.
- `revealed`
  - Pemenang final tampil.
  - Kartu pemenang boleh masuk dengan stagger kecil 80 sampai 120 ms.

## Visual

- Glow emas di border panel hasil.
- Sedikit shake halus pada container hasil saat rolling.
- Overlay gelap tipis untuk mengarahkan fokus ke area hasil.
- Spark atau star burst kecil di sekitar panel saat reveal final.

## Batasan

- Total animasi harus tetap di bawah 3 detik.
- Jangan memakai confetti besar atau efek berat yang mengganggu keterbacaan.
- Shake harus halus, tidak berlebihan.
- Efek harus tetap nyaman untuk mode 1 pemenang maupun banyak pemenang.

## Teknis

- Tambahkan state fase animasi: `idle`, `rolling`, `flash`, `revealed`.
- Dummy content tetap memakai data acak yang sudah ada selama fase rolling.
- Reveal final memakai pemenang hasil draw yang sesungguhnya.
- Implementasi harus tetap aman untuk participant mode dan numeric fallback mode.

## Testing

- Verifikasi draw tetap menyimpan history dengan benar.
- Verifikasi pemenang final tidak berubah setelah flash.
- Verifikasi mode multi-winner dan single-winner sama-sama tetap berjalan.
