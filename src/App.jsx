import { useMemo, useState } from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import Tesseract from 'tesseract.js';
import { curriculumData } from './curriculum';
import { callChatApi } from './chatApi';

const bots = [
  { id: 'tutor', title: 'Chatbot 1 - Gia sư định hướng' },
  { id: 'detector', title: 'Chatbot 2 - Kiểm tra nghi ngờ AI' },
  { id: 'probe', title: 'Chatbot 3 - Truy vấn điểm nghẽn' }
];

const STORAGE_KEY = 'ai-eduzone-sessions-v2';

const isEducationRelated = (message) => {
  const text = message.toLowerCase();
  const keywords = [
    'toán', 'ngữ văn', 'văn', 'lớp', 'bài', 'bài tập', 'đề', 'phương trình', 'hình', 'thơ',
    'đoạn văn', 'giải thích', 'học', 'kiến thức', 'latex', 'phân tích', 'chứng minh', 'hàm số', 'xác suất'
  ];
  return keywords.some((keyword) => text.includes(keyword));
};

const outOfScopeKeywords = {
  math: {
    6: ['đạo hàm', 'tích phân', 'logarit', 'ma trận', 'số phức', 'lượng giác'],
    7: ['đạo hàm', 'tích phân', 'logarit', 'ma trận', 'số phức', 'lượng giác'],
    8: ['đạo hàm', 'tích phân', 'logarit', 'ma trận', 'số phức'],
    9: ['đạo hàm', 'tích phân', 'ma trận', 'số phức']
  },
  literature: {
    6: ['thi pháp học', 'nghị luận văn học chuyên sâu'],
    7: ['thi pháp học', 'nghị luận văn học chuyên sâu'],
    8: ['lí luận văn học đại học'],
    9: ['lí luận văn học đại học']
  }
};

const newSession = () => ({
  id: crypto.randomUUID(),
  title: 'Cuộc trò chuyện mới',
  botId: 'tutor',
  subject: 'math',
  grade: '6',
  history: [
    {
      who: 'AI-EduZone',
      text: 'Chào mừng đến với AI-EduZone. Hãy chọn chatbot, môn học, lớp và nhập nội dung để bắt đầu.'
    }
  ],
  tutorSupportCount: 0,
  lastQuestion: ''
});

const loadSessions = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [newSession()];
    const data = JSON.parse(raw);
    return Array.isArray(data) && data.length ? data : [newSession()];
  } catch {
    return [newSession()];
  }
};

const inferPrompt = (botId, message, subject, grade, supportCount = 0) => {
  if (!isEducationRelated(message)) {
    return {
      who: 'AI-EduZone',
      text: 'Mình chỉ hỗ trợ câu hỏi học tập Toán/Ngữ văn lớp 6-9 và sẽ định hướng thay vì giải hộ. Bạn hãy gửi nội dung học tập nhé.'
    };
  }

  const outTopic = (outOfScopeKeywords[subject]?.[grade] ?? []).find((k) => message.toLowerCase().includes(k));
  const curriculum = curriculumData[subject].grades[grade];

  if (outTopic) {
    return {
      who: 'AI-EduZone',
      text: `Nội dung “${outTopic}” vượt khung lớp ${grade}. Mình chỉ hỗ trợ trong chương trình hiện tại:\n- ${curriculum.join('\n- ')}`
    };
  }

  if (botId === 'tutor') {
    const depthHint = supportCount > 0
      ? `\n\nMức hỗ trợ ${supportCount + 1}:\n- Xác định chính xác dữ kiện đề bài.\n- Chọn 1 bước em làm được trước.\n- Kiểm tra lại từng bước trước khi sang bước tiếp.`
      : '';
    return {
      who: 'Gia sư định hướng',
      text: `Mình không đưa đáp án trực tiếp. Với ${subject === 'math' ? 'Toán' : 'Ngữ văn'} lớp ${grade}, em làm theo:\n1) Tóm tắt đề bằng lời của em.\n2) Chọn hướng làm theo chuẩn GDPT 2018:\n- ${curriculum.join('\n- ')}\n3) Viết nháp và tự kiểm tra.${depthHint}`
    };
  }

  if (botId === 'detector') {
    return {
      who: 'Kiểm tra nghi ngờ AI',
      text: `Đang đối chiếu bài làm theo ${subject === 'math' ? 'Toán' : 'Ngữ văn'} lớp ${grade}:\n- Độ phù hợp chuẩn kiến thức: cần kiểm tra theo mục tiêu lớp.\n- Dấu hiệu can thiệp AI: xem mức tự nhiên của lập luận và lỗi cá nhân.\n- Không đánh giá vượt khung lớp đã chọn.\n\nChuẩn đối chiếu:\n- ${curriculum.join('\n- ')}`
    };
  }

  return {
    who: 'Truy vấn điểm nghẽn',
    text: `Để kiểm tra em hiểu bài chưa (${subject === 'math' ? 'Toán' : 'Ngữ văn'} lớp ${grade}), hãy trả lời:\n1) Em kẹt ở bước nào?\n2) Vì sao chọn cách làm này?\n3) Nếu đổi dữ kiện/chủ đề thì em đổi ra sao?\n\nMốc kiến thức cùng lớp:\n- ${curriculum.join('\n- ')}`
  };
};

function App() {
  const initialSessions = useMemo(() => loadSessions(), []);
  const [sessions, setSessions] = useState(initialSessions);
  const [activeId, setActiveId] = useState(initialSessions[0].id);
  const [composer, setComposer] = useState('');
  const [ocrLoading, setOcrLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const activeSession = sessions.find((s) => s.id === activeId) ?? sessions[0];

  const persist = (next) => {
    setSessions(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const updateActive = (patch) => {
    const next = sessions.map((s) => (s.id === activeSession.id ? { ...s, ...patch } : s));
    persist(next);
  };

  const sendMessage = async () => {
    if (!composer.trim() || sending) return;
    const question = composer.trim();
    const userMessage = { who: 'Bạn', text: question };

    setSending(true);
    try {
      const apiReply = await callChatApi({
        botId: activeSession.botId,
        subject: activeSession.subject,
        grade: activeSession.grade,
        message: question,
        history: activeSession.history,
        supportLevel: 0
      });

      const botReply = apiReply
        ? { who: bots.find((b) => b.id === activeSession.botId)?.title ?? 'AI-EduZone', text: apiReply }
        : inferPrompt(activeSession.botId, question, activeSession.subject, activeSession.grade, 0);

      updateActive({
        history: [...activeSession.history, userMessage, botReply],
        lastQuestion: activeSession.botId === 'tutor' ? question : activeSession.lastQuestion,
        tutorSupportCount: activeSession.botId === 'tutor' ? 0 : activeSession.tutorSupportCount,
        title: activeSession.title === 'Cuộc trò chuyện mới' ? question.slice(0, 28) : activeSession.title
      });
      setComposer('');
    } catch (error) {
      const fallback = inferPrompt(activeSession.botId, question, activeSession.subject, activeSession.grade, 0);
      updateActive({ history: [...activeSession.history, userMessage, fallback] });
    } finally {
      setSending(false);
    }
  };

  const needMoreHelp = async () => {
    if (activeSession.botId !== 'tutor' || !activeSession.lastQuestion || activeSession.tutorSupportCount >= 2 || sending) return;
    const nextCount = activeSession.tutorSupportCount + 1;

    setSending(true);
    try {
      const apiReply = await callChatApi({
        botId: 'tutor',
        subject: activeSession.subject,
        grade: activeSession.grade,
        message: activeSession.lastQuestion,
        history: activeSession.history,
        supportLevel: nextCount
      });

      const extra = apiReply
        ? { who: 'Gia sư định hướng', text: apiReply }
        : inferPrompt('tutor', activeSession.lastQuestion, activeSession.subject, activeSession.grade, nextCount);

      updateActive({ tutorSupportCount: nextCount, history: [...activeSession.history, extra] });
    } finally {
      setSending(false);
    }
  };

  const addSession = () => {
    const created = newSession();
    const next = [created, ...sessions];
    persist(next);
    setActiveId(created.id);
    setComposer('');
  };

  const processImage = async (file) => {
    if (!file) return;
    setOcrLoading(true);
    const { data } = await Tesseract.recognize(file, 'vie+eng');
    setComposer((prev) => `${prev}\n${data.text}`.trim());
    setOcrLoading(false);
  };

  return (
    <div className="page">
      <header className="topbar">
        <div className="brand">
          <div className="logo">AI</div>
          <div>
            <strong>AI-EduZone</strong>
            <p>Không gian tự học an toàn cho học sinh</p>
          </div>
        </div>
        <nav>
          <a href="#">Tính năng</a>
          <a href="#">Dùng thử</a>
          <a href="#">Giới thiệu</a>
        </nav>
      </header>

      <section className="hero">
        <div>
          <div className="chips">
            <span>Không giải hộ</span><span>Định hướng tự học</span><span>Giao diện trực quan</span>
          </div>
          <h1>Web app học tập hiện đại, rõ ràng, dễ dùng</h1>
          <p>
            AI-EduZone hỗ trợ học sinh tự học theo hướng có định hướng, hạn chế phụ thuộc AI và tăng khả năng tự giải quyết vấn đề.
          </p>
          <p>Ví dụ LaTeX: <InlineMath math="x^2 + y^2 = z^2" /></p>
        </div>
        <div className="mock-card">
          <h3>Minh hoạ chatbot</h3>
          <p>Đối chiếu theo môn/lớp để không trả lời vượt khung chương trình.</p>
          <BlockMath math="\nabla (x^2) = 2x" />
        </div>
      </section>

      <section className="workspace">
        <aside className="sidebar">
          <div className="side-head">
            <h3>Hội thoại</h3>
            <button type="button" onClick={addSession}>+ Mới</button>
          </div>
          {sessions.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`session-item ${s.id === activeId ? 'active' : ''}`}
              onClick={() => setActiveId(s.id)}
            >
              {s.title || 'Cuộc trò chuyện'}
            </button>
          ))}
        </aside>

        <div className="chat-panel">
          <div className="selectors">
            <label>
              Chatbot
              <select value={activeSession.botId} onChange={(e) => updateActive({ botId: e.target.value })}>
                {bots.map((b) => <option key={b.id} value={b.id}>{b.title}</option>)}
              </select>
            </label>
            <label>
              Môn học
              <select value={activeSession.subject} onChange={(e) => updateActive({ subject: e.target.value })}>
                <option value="math">Toán</option>
                <option value="literature">Ngữ văn</option>
              </select>
            </label>
            <label>
              Lớp
              <select value={activeSession.grade} onChange={(e) => updateActive({ grade: e.target.value })}>
                <option value="6">Lớp 6</option><option value="7">Lớp 7</option><option value="8">Lớp 8</option><option value="9">Lớp 9</option>
              </select>
            </label>
          </div>

          <div className="messages">
            {activeSession.history.map((m, idx) => (
              <article key={`${m.who}-${idx}`} className={m.who === 'Bạn' ? 'user-msg' : 'bot-msg'}>
                <h4>{m.who}</h4>
                <pre>{m.text}</pre>
              </article>
            ))}
          </div>

          <div className="composer">
            <textarea
              rows={4}
              placeholder="Nhập câu hỏi hoặc nội dung cần hỗ trợ..."
              value={composer}
              onChange={(e) => setComposer(e.target.value)}
            />
            <div className="composer-actions">
              <label className="upload">
                OCR ảnh
                <input type="file" accept="image/*" onChange={(e) => processImage(e.target.files?.[0])} />
              </label>
              <button type="button" className="secondary" onClick={() => setComposer('')}>Xoá ô nhập</button>
              {activeSession.botId === 'tutor' && activeSession.lastQuestion && activeSession.tutorSupportCount < 2 && (
                <button type="button" className="secondary" onClick={needMoreHelp}>
                  Em chưa làm được ({2 - activeSession.tutorSupportCount})
                </button>
              )}
              <button type="button" className="send" onClick={sendMessage} disabled={ocrLoading || sending}>
                {ocrLoading ? 'Đang OCR...' : sending ? 'Đang gửi...' : 'Gửi'}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;
