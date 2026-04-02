# AI-EduZone

AI-EduZone là webapp tự học an toàn cho học sinh THCS, tích hợp 3 chatbot độc lập:

1. **Gia sư định hướng**: không cho đáp án trực tiếp, chỉ đưa gợi ý theo mức hỗ trợ.
2. **Kiểm tra nghi ngờ AI**: đánh giá dấu hiệu văn phong có can thiệp AI, đối chiếu chuẩn lớp/môn.
3. **Truy vấn điểm nghẽn kiến thức**: đặt câu hỏi ngược để kiểm tra mức hiểu bài.

## Tính năng chính

- Giới thiệu webapp ở đầu trang, làm rõ triết lý "AI chỉ định hướng, không giải hộ".
- Chọn môn/khối lớp (Toán/Ngữ văn lớp 6-9).
- Đối chiếu nội dung theo khung chương trình GDPT 2018 (Thông tư 32).
- Hỗ trợ nhập văn bản, OCR ảnh bài tập.
- Hiển thị công thức Toán bằng LaTeX (KaTeX / react-katex).
- Lưu hội thoại theo từng chatbot bằng localStorage.
- Đồng bộ/tải lại hội thoại từ Firebase Firestore theo `studentId`.
- Nếu câu hỏi không liên quan học tập, chatbot trả lời mặc định và nhắc phạm vi chức năng.
- Riêng Chatbot 1 có nút **"Em chưa làm được"** sau khi đã có hướng dẫn; tối đa 2 lượt gợi ý sâu hơn cho mỗi bài tập.
- Cả 3 chatbot đều ràng buộc theo môn/lớp và từ chối nội dung vượt khung chương trình đã chọn.

## Chạy local

```bash
npm install
npm run dev
```

## Cấu hình Firebase (Frontend Vite)

Tạo file `.env`:

```bash
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

> Lưu ý quan trọng: đoạn Java Admin SDK kiểu `serviceAccountKey.json` chỉ nên chạy ở backend/server tin cậy, không đưa lên frontend.

## Build production

```bash
npm run build
npm run preview
```

## Triển khai

### Vercel

- Framework preset: `Vite`
- Build command: `npm run build`
- Output directory: `dist`

### Netlify

- Build command: `npm run build`
- Publish directory: `dist`
- File cấu hình có sẵn: `netlify.toml`

## Dữ liệu chương trình GDPT 2018

Dữ liệu đối chiếu đã được tóm lược cho:

- Môn **Toán**, lớp 6-9.
- Môn **Ngữ văn**, lớp 6-9.

Tham chiếu theo Chương trình giáo dục phổ thông ban hành kèm Thông tư 32/2018/TT-BGDĐT.
