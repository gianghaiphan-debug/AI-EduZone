const API_BASE = import.meta.env.VITE_CHAT_API_BASE_URL || '';
const API_KEY = import.meta.env.VITE_CHAT_API_KEY || '';
const CHAT_PROVIDER = import.meta.env.VITE_CHAT_PROVIDER || 'custom';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash';

const formatHistory = (history = []) =>
  history
    .slice(-12)
    .map((msg) => `${msg.who}: ${msg.text}`)
    .join('\n');

const buildGeminiPrompt = ({ botId, subject, grade, message, history, supportLevel }) => `
Bạn là chatbot ${botId} của AI-EduZone.
Ràng buộc:
- Chỉ hỗ trợ môn ${subject === 'math' ? 'Toán' : 'Ngữ văn'} lớp ${grade} theo định hướng GDPT 2018.
- Không đưa đáp án trực tiếp, chỉ định hướng.
- Nếu ngoài phạm vi chương trình, từ chối lịch sự và yêu cầu quay lại nội dung phù hợp.
- supportLevel hiện tại: ${supportLevel}.

Lịch sử gần đây:
${formatHistory(history)}

Câu hỏi hiện tại:
${message}
`;

const callGeminiDirect = async (payload) => {
  if (!GEMINI_API_KEY) return null;

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
  const prompt = buildGeminiPrompt(payload);

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Gemini request failed with status ${response.status}`);
  }

  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
};

const callCustomApi = async ({ botId, subject, grade, message, history, supportLevel = 0 }) => {
  if (!API_BASE) return null;

  const response = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {})
    },
    body: JSON.stringify({ botId, subject, grade, message, history, supportLevel })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `API request failed with status ${response.status}`);
  }

  const data = await response.json();
  return data?.reply ?? null;
};

export const callChatApi = async (payload) => {
  if (CHAT_PROVIDER === 'gemini') {
    return callGeminiDirect(payload);
  }

  return callCustomApi(payload);
};
