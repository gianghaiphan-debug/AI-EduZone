import { useMemo, useState } from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import Tesseract from 'tesseract.js';
import { curriculumData } from './curriculum';

const bots = [
  { id: 'tutor', title: 'Chatbot 1 · Gia sư định hướng' },
  { id: 'detector', title: 'Chatbot 2 · Kiểm tra nghi ngờ AI' },
  { id: 'probe', title: 'Chatbot 3 · Truy vấn điểm nghẽn kiến thức' }
];

const initialState = {
  subject: 'math',
  grade: '6',
  input: '',
  processingOcr: false,
  history: []
};

const STORAGE_KEY = 'ai-eduzone-conversations-v1';

const loadHistory = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

const saveHistory = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

const inferPrompt = (botId, message, subject, grade) => {
  const curriculum = curriculumData[subject].grades[grade];

  if (botId === 'tutor') {
    return {
      role: 'AI-EduZone Tutor',
      text: `Mình sẽ không đưa đáp án trực tiếp. Với ${subject === 'math' ? 'Toán' : 'Ngữ văn'} lớp ${grade}, bạn hãy thử làm theo 3 bước:\n1) Xác định dữ kiện và yêu cầu đề.\n2) Chọn phương pháp phù hợp chương trình GDPT 2018:\n- ${curriculum.join('\n- ')}\n3) Viết lời giải nháp và tự kiểm tra.\n\nGợi ý hướng đi cho câu hỏi của bạn: “${message.slice(0, 240)}”.\n\nNếu muốn, hãy yêu cầu mức hỗ trợ 2 hoặc 3 để mình tăng độ chi tiết.`
    };
  }

  if (botId === 'detector') {
    return {
      role: 'AI-EduZone AI-check',
      text: `Phân tích nghi ngờ can thiệp AI cho ${subject === 'math' ? 'Toán' : 'Ngữ văn'} lớp ${grade}:\n- Độ đều văn phong bất thường: Trung bình\n- Dấu hiệu thiếu bước tư duy cá nhân: Có thể có\n- Mức phù hợp chuẩn kiến thức lớp ${grade}: cần đối chiếu theo các yêu cầu:\n- ${curriculum.join('\n- ')}\n\nKhuyến nghị: yêu cầu học sinh giải thích lại từng bước bằng ngôn ngữ của mình.`
    };
  }

  return {
    role: 'AI-EduZone Probe',
    text: `Để kiểm tra bạn đã hiểu bài chưa, hãy trả lời nhanh 3 câu truy vấn ngược (${subject === 'math' ? 'Toán' : 'Ngữ văn'} lớp ${grade}):\n1) Em đang vướng nhất ở khâu nào?\n2) Vì sao em chọn cách làm hiện tại?\n3) Nếu thay dữ kiện/chủ đề thì em điều chỉnh thế nào?\n\nĐối chiếu trọng tâm chương trình:\n- ${curriculum.join('\n- ')}`
  };
};

function App() {
  const saved = useMemo(() => loadHistory(), []);
  const [activeBot, setActiveBot] = useState('tutor');
  const [state, setState] = useState(() => ({
    tutor: saved.tutor ?? { ...initialState },
    detector: saved.detector ?? { ...initialState },
    probe: saved.probe ?? { ...initialState }
  }));

  const botState = state[activeBot];

  const updateBotState = (updates) => {
    setState((prev) => {
      const next = {
        ...prev,
        [activeBot]: {
          ...prev[activeBot],
          ...updates
        }
      };
      saveHistory(next);
      return next;
    });
  };

  const onSend = () => {
    if (!botState.input.trim()) return;
    const userMessage = { who: 'Bạn', text: botState.input.trim() };
    const botMessage = inferPrompt(activeBot, botState.input.trim(), botState.subject, botState.grade);

    updateBotState({
      input: '',
      history: [...botState.history, userMessage, botMessage]
    });
  };

  const processImage = async (file) => {
    if (!file) return;
    updateBotState({ processingOcr: true });
    const { data } = await Tesseract.recognize(file, 'vie+eng');
    updateBotState({
      processingOcr: false,
      input: `${botState.input}\n${data.text}`.trim()
    });
  };

  return (
    <div className="layout">
      <header className="hero">
        <h1>AI-EduZone · Không gian tự học an toàn cho học sinh</h1>
        <p>
          Webapp tích hợp 3 chatbot học tập độc lập. Triết lý chung: <strong>AI chỉ định hướng, không giải hộ</strong>,
          giúp học sinh tự phát triển năng lực học tập và tự đánh giá.
        </p>
        <p>
          Hỗ trợ nhập văn bản, OCR từ ảnh, hiển thị công thức bằng LaTeX (ví dụ <InlineMath math="x^2 + y^2 = z^2" />)
          và đối chiếu chuẩn chương trình GDPT 2018 cho Toán/Ngữ văn lớp 6-9.
        </p>
      </header>

      <section className="bot-tabs">
        {bots.map((bot) => (
          <button
            key={bot.id}
            type="button"
            className={activeBot === bot.id ? 'active' : ''}
            onClick={() => setActiveBot(bot.id)}
          >
            {bot.title}
          </button>
        ))}
      </section>

      <section className="panel">
        <div className="controls">
          <label>
            Môn học
            <select value={botState.subject} onChange={(e) => updateBotState({ subject: e.target.value })}>
              <option value="math">Toán</option>
              <option value="literature">Ngữ văn</option>
            </select>
          </label>

          <label>
            Khối lớp
            <select value={botState.grade} onChange={(e) => updateBotState({ grade: e.target.value })}>
              <option value="6">6</option>
              <option value="7">7</option>
              <option value="8">8</option>
              <option value="9">9</option>
            </select>
          </label>
        </div>

        <div className="curriculum">
          <h3>Đối chiếu chuẩn kiến thức (GDPT 2018)</h3>
          <ul>
            {curriculumData[botState.subject].grades[botState.grade].map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <textarea
          rows={5}
          placeholder="Nhập câu hỏi của bạn (hỗ trợ cả LaTeX như: \\frac{a}{b})"
          value={botState.input}
          onChange={(e) => updateBotState({ input: e.target.value })}
        />

        <div className="math-preview">
          <p>Xem trước công thức (LaTeX block):</p>
          <BlockMath math={botState.input.includes('\\') ? botState.input : 'a^2+b^2=c^2'} />
        </div>

        <div className="actions">
          <label className="upload">
            OCR ảnh bài tập
            <input
              type="file"
              accept="image/*"
              onChange={(e) => processImage(e.target.files?.[0])}
            />
          </label>
          <button type="button" onClick={onSend} disabled={botState.processingOcr}>
            {botState.processingOcr ? 'Đang OCR...' : 'Gửi'}
          </button>
          <button
            type="button"
            onClick={() => updateBotState({ history: [] })}
            className="secondary"
          >
            Xoá hội thoại bot hiện tại
          </button>
        </div>

        <div className="history">
          {botState.history.length === 0 && <p>Chưa có hội thoại. Hãy bắt đầu bằng một câu hỏi.</p>}
          {botState.history.map((message, idx) => (
            <article key={`${message.who}-${idx}`}>
              <h4>{message.who}</h4>
              <pre>{message.text}</pre>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default App;
