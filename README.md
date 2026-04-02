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

## Chạy local

```bash
npm install
npm run dev
```

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
