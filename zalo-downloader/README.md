# Zalo Downloader

Script tự động tải file PDF/Word/PowerPoint từ nhóm Zalo Web.

## Cài đặt

```bash
npm install
npm run install-browsers
```

## Sử dụng

```bash
npm start
```

Script sẽ:
1. Mở trình duyệt Chromium (hiển thị giao diện)
2. Mở web.zalo.me — bạn cần **quét QR code** bằng Zalo trên điện thoại
3. Tự động tìm nhóm có tên chứa "mathexpress" hoặc "toán"
4. Scroll lên để tải tất cả tin nhắn cũ
5. Tải các file PDF, DOCX, PPTX vào thư mục `../content/`
6. Lưu thông tin vào `../content/metadata.json`

## Lưu ý

- **Chạy lại an toàn**: Script bỏ qua file đã tải dựa vào `metadata.json`
- **Nhóm không tìm thấy tự động**: Script sẽ chờ 30 giây để bạn click vào nhóm thủ công
- **File được tải về**: `../content/` (thư mục cha)
- Zalo Web có thể thay đổi cấu trúc HTML — nếu script không tìm thấy file, kiểm tra selector trong `downloader.js`

## Cấu trúc metadata.json

```json
{
  "files": [
    {
      "fileName": "bai-tap-toan-lop1.pdf",
      "sender": "Cô Lan",
      "sentAt": "08:30",
      "downloadedAt": "2024-01-15T08:30:00.000Z",
      "filePath": "D:/.../.../content/bai-tap-toan-lop1.pdf",
      "fileType": "PDF",
      "fileSize": 204800
    }
  ]
}
```
