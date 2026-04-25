# Web Scraper & DOM Tree Searcher

Aplikasi web untuk melakukan scraping HTML dan memvisualisasikan penelusuran DOM Tree menggunakan algoritma Breadth-First Search (BFS) dan Depth-First Search (DFS) dengan dukungan CSS Selector yang kompleks.

---

## 1. Penjelasan Singkat Algoritma BFS dan DFS

Aplikasi ini mengimplementasikan pencarian DOM Tree secara iteratif menggunakan satu fungsi traversal inti (`runTraversal`). Pencocokan elemen dievaluasi menggunakan matcher yang mendukung CSS Selector secara parsial dari kanan ke kiri (right-to-left evaluation).

- **Breadth-First Search (BFS):** Diimplementasikan menggunakan struktur data Queue. Algoritma akan memeriksa setiap tingkatan kedalaman (depth) secara berurutan. Saat mengunjungi sebuah node, seluruh elemen anak dari node tersebut akan dimasukkan ke dalam Stack dengan urutan normal (kiri ke kanan).

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

> **Penting: Akses Cepat via Cloud (Azure)**
>
> Aplikasi ini sudah di-deploy menggunakan Microsoft Azure Virtual Machine. Cukup kunjungi tautan berikut:
>
> 🌐 **http://70.153.137.94:5173**
>
> _(Catatan: Tautan ini dinonaktifkan sementara waktu untuk menghemat kuota cloud. Apabila tautan tidak aktif, mohon hubungi Author terlebih dahulu agar server dinyalakan)._

### Menjalankan Secara Lokal (Manual)

Jika tautan Azure sedang mati dan ingin mengujinya di laptop lokal:

1. Buka terminal dan masuk ke folder proyek utama.

2. Jalankan perintah instalasi dependensi:

   ```bash
   npm install
   ```

3. Nyalakan aplikasi (Frontend & Backend):

   ```bash
   npm run dev
   ```

4. Buka `http://localhost:5173` di peramban web.

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
