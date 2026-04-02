const API_BASE = import.meta.env.VITE_CHAT_API_BASE_URL || '';
const API_KEY = import.meta.env.VITE_CHAT_API_KEY || '';

export const callChatApi = async ({
  botId,
  subject,
  grade,
  message,
  history,
  supportLevel = 0
}) => {
  if (!API_BASE) return null;

  const response = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {})
    },
    body: JSON.stringify({
      botId,
      subject,
      grade,
      message,
      history,
      supportLevel
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `API request failed with status ${response.status}`);
  }

  const data = await response.json();
  return data?.reply ?? null;
};
