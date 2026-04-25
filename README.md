# Web Scraper & DOM Tree Searcher

Aplikasi web untuk melakukan scraping HTML dan memvisualisasikan penelusuran DOM Tree menggunakan algoritma Breadth-First Search (BFS) dan Depth-First Search (DFS) dengan dukungan CSS Selector.

---

## 1. Penjelasan Algoritma BFS dan DFS

Aplikasi ini mengimplementasikan pencarian DOM Tree secara iteratif menggunakan fungsi traversal (`runTraversal`). Pencocokan elemen dievaluasi menggunakan matcher yang mendukung CSS Selector dari kanan ke kiri.

- **Breadth-First Search (BFS):** Diimplementasikan menggunakan struktur data Queue. Algoritma akan memeriksa setiap kedalaman (depth) secara berurutan. Saat mengunjungi sebuah node, seluruh anak dari node tersebut akan dimasukkan ke dalam Stack dengan urutan normal (kiri ke kanan).

- **Depth-First Search (DFS):** Diimplementasikan menggunakan struktur data Stack sebagai frontier. Untuk menjaga agar penelusuran turun ke anak pertama (paling kiri) terlebih dahulu, algoritma memasukkan elemen anak ke dalam Stack dengan urutan terbalik. Dengan demikian, anak pertama berada di Stack teratas dan dieksekusi lebih dulu.

Kedua algoritma memiliki mekanisme **early termination** yang akan langsung menghentikan penelusuran dan mencatat sisa elemen sebagai `skipped` apabila jumlah elemen yang cocok (`match`) telah mencapai batas yang ditentukan (`limit`).

---

## 2. Requirement Program

Untuk menjalankan program secara lokal, pastikan perangkat telah memiliki:

- **Node.js**
- **npm**
- **Docker & Docker Compose** (opsional)

---

## 3. Cara Menjalankan Program

Aplikasi ini sudah di-deploy menggunakan Microsoft Azure Virtual Machine. Cukup kunjungi tautan berikut:
🌐 **http://70.153.137.94:5173**
_(Catatan: Tautan ini dinonaktifkan sementara waktu untuk menghemat kuota cloud. Apabila tautan tidak aktif, mohon hubungi Author terlebih dahulu agar server dinyalakan)._

### Menjalankan Secara Lokal (Manual)

Jika tautan Azure sedang mati dan ingin mengujinya secara lokal:

1. Lakukan git clone atau download repository ini

2. Periksa file OutputPanel.jsx pada direktori frontend/src/components/OutputPanel.jsx

3. Pada line 110 dan 130, ubah "http://70.153.137.94:3000/api/scrape" menjadi "http://localhost:3000/api/scrape" (i know, this isn't ideal).

4. Buka terminal dan masuk ke folder proyek utama.

5. Jalankan perintah instalasi dependensi:

   ```bash
   npm install
   ```

6. Nyalakan aplikasi (Frontend & Backend):

   ```bash
   npm run dev
   ```

7. Buka `http://localhost:5173` di web.

### Menjalankan Secara Lokal (Docker)

```bash
sudo docker-compose up --build
```

---

## 4. Author

**Kelompok [Nama Kelompok]**

| Nama                         | NIM      |
| ---------------------------- | -------- |
| Vara Azzara Ramli Pulukadang | 13524091 |
| Keisha Rizka Syofyani        | 13524073 |
| Aziza Dharma Putri           | 13524017 |
