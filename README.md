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
- Lưu trữ hội thoại dạng danh sách ở sidebar (nằm ngang với khung chat) bằng localStorage.
- Có nút **Gửi** rõ ràng ở khu vực nhập liệu, kèm nút tạo hội thoại mới.
- Nếu câu hỏi không liên quan học tập, chatbot trả lời mặc định và nhắc phạm vi chức năng.
- Riêng Chatbot 1 có nút **"Em chưa làm được"** sau khi đã có hướng dẫn; tối đa 2 lượt gợi ý sâu hơn cho mỗi bài tập.
- Cả 3 chatbot đều ràng buộc theo môn/lớp và từ chối nội dung vượt khung chương trình đã chọn.

## Chạy local

```bash
npm install
npm run dev
```


## Kết nối API chatbot

Thêm biến môi trường vào `.env`:

```bash
VITE_CHAT_API_BASE_URL=https://your-backend-domain
VITE_CHAT_API_KEY=optional_token
```

Frontend sẽ gọi `POST {VITE_CHAT_API_BASE_URL}/chat` với payload:

```json
{
  "botId": "tutor|detector|probe",
  "subject": "math|literature",
  "grade": "6|7|8|9",
  "message": "...",
  "history": [],
  "supportLevel": 0
}
```

Nếu chưa cấu hình API, app sẽ tự động dùng fallback local (rule-based) để demo.

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
