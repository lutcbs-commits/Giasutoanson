# Web Gia Sư Toán — Hệ thống học Toán tiểu học

Hệ thống gồm 2 phần chính:
- **zalo-downloader**: Script tự động tải tài liệu từ nhóm Zalo
- **web**: Website dạy toán tương tác cho học sinh lớp 1–5

## Cấu trúc thư mục

```
Web_gia_su_Toan/
├── content/              # Tài liệu PDF/Word tải về từ Zalo
│   └── metadata.json     # Thông tin file (tên, ngày gửi, người gửi)
├── zalo-downloader/      # Script tải file từ Zalo
│   ├── downloader.js
│   ├── package.json
│   └── README.md
└── web/                  # Website Next.js
    ├── app/
    ├── components/
    └── lib/
```

## Bắt đầu nhanh

### 1. Tải tài liệu từ Zalo

```bash
cd zalo-downloader
npm install
npm start
```

Xem chi tiết: [zalo-downloader/README.md](zalo-downloader/README.md)

### 2. Chạy website

```bash
cd web
npm install
npm run dev
```

Mở trình duyệt: http://localhost:3000

## Yêu cầu hệ thống

- Node.js 18+
- npm 9+
