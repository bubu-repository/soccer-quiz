# ⚽ Soccer Math — Adu Penalti Matematika

Game latihan matematika bertema sepak bola. Setiap soal adalah satu tendangan
penalti: jawab benar untuk mencetak gol, jawab salah (atau kehabisan waktu) dan
kiper akan menepis bolamu!

## Cara Main

1. Buka `index.html` di browser (tidak perlu server atau instalasi apa pun).
2. Pilih operasi: penjumlahan, pengurangan, perkalian, pembagian, atau campuran.
3. Pilih level: **Mudah**, **Sedang**, atau **Sulit** (angka lebih besar, waktu lebih singkat).
4. Jawab 10 soal — setiap jawaban benar adalah satu gol.

## Fitur

- **10 tendangan penalti** per pertandingan dengan animasi gol/tepisan.
- **3 level kesulitan** yang mengatur rentang angka dan batas waktu (20/15/10 detik per soal).
- **5 mode operasi** termasuk mode campuran.
- **Streak (gol beruntun)** untuk memotivasi jawaban benar berturut-turut.
- **Rekor tersimpan** per kombinasi mode + level di `localStorage` browser.
- Desain responsif, nyaman dimainkan di HP maupun desktop.

## Menjalankan Secara Lokal

```bash
# cukup buka file-nya, atau jalankan server statis sederhana:
python3 -m http.server 8000
# lalu buka http://localhost:8000
```

## Struktur Proyek

| File | Deskripsi |
| --- | --- |
| `index.html` | Struktur halaman: layar menu, permainan, dan hasil akhir |
| `styles.css` | Seluruh styling termasuk animasi lapangan, bola, dan kiper |
| `game.js` | Logika permainan: pembuatan soal, timer, skor, dan rekor |

Dibuat dengan HTML, CSS, dan JavaScript murni — tanpa dependensi.
