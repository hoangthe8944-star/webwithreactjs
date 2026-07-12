import React, { useEffect, useRef, useState } from 'react';
import { X, Send, Bot, Loader2, Sparkles } from 'lucide-react';
import axios from 'axios';
import { BASE_URL } from '../../api/apiconfig';

interface AIChatboxProps {
  user: {
    username?: string;
  } | null;
}

interface ChatMessage {
  role: 'ai' | 'user';
  content: string;
}

interface AIChatResponse {
  reply?: string;
  message?: string;
  error?: string;
}

export default function AIChatbox({ user }: AIChatboxProps) {
  const [isOpen, setIsOpen] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'ai',
      content: `Chào ${user?.username || 'bạn'}! Tôi là trợ lý AI. Hãy hỏi tôi về âm nhạc.`
    }
  ]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [messages, isTyping]);

  const getErrorMessage = (error: unknown): string => {
    if (!axios.isAxiosError(error)) {
      return 'Đã xảy ra lỗi không xác định.';
    }

    // Không nhận được response: backend tắt, sai URL, CORS hoặc mất mạng
    if (!error.response) {
      return 'Không thể kết nối tới máy chủ. Hãy kiểm tra backend và BASE_URL.';
    }

    const status = error.response.status;
    const data = error.response.data as
      | AIChatResponse
      | string
      | undefined;

    let backendMessage = '';

    if (typeof data === 'string') {
      backendMessage = data;
    } else {
      backendMessage =
        data?.message ||
        data?.error ||
        '';
    }

    switch (status) {
      case 400:
        return backendMessage || 'Nội dung yêu cầu không hợp lệ.';

      case 401:
        return backendMessage
          ? `Lỗi xác thực AI: ${backendMessage}`
          : 'Lỗi xác thực AI. Hãy kiểm tra GROQ_API_KEY ở backend.';

      case 403:
        return backendMessage || 'Backend không có quyền gọi dịch vụ AI.';

      case 404:
        return 'Không tìm thấy API /api/ai/chat. Hãy kiểm tra controller backend.';

      case 429:
        return 'AI đang quá tải hoặc đã vượt giới hạn sử dụng. Hãy thử lại sau.';

      case 500:
        return backendMessage
          ? `Lỗi máy chủ: ${backendMessage}`
          : 'Backend gặp lỗi khi xử lý yêu cầu AI.';

      case 502:
      case 503:
      case 504:
        return 'Dịch vụ AI hiện không khả dụng. Hãy thử lại sau.';

      default:
        return backendMessage || `Yêu cầu thất bại với mã lỗi ${status}.`;
    }
  };

  const handleSend = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const userMsg = input.trim();

    if (!userMsg || isTyping) {
      return;
    }

    setMessages(prev => [
      ...prev,
      {
        role: 'user',
        content: userMsg
      }
    ]);

    setInput('');
    setIsTyping(true);

    try {
      const response = await axios.post<AIChatResponse | string>(
        `${BASE_URL}/api/ai/chat`,
        {
          message: userMsg,
          username: user?.username || 'guest'
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 60000
        }
      );

      let reply = '';

      if (typeof response.data === 'string') {
        reply = response.data;
      } else {
        reply =
          response.data.reply ||
          response.data.message ||
          '';
      }

      if (!reply.trim()) {
        throw new Error('Backend không trả về trường reply hoặc message.');
      }

      setMessages(prev => [
        ...prev,
        {
          role: 'ai',
          content: reply
        }
      ]);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('AI status:', error.response?.status);
        console.error('AI response:', error.response?.data);
        console.error('AI message:', error.message);

        const responseData = error.response?.data as {
          reply?: string;
          message?: string;
          error?: string;
        };

        const errorMessage =
          responseData?.reply ||
          responseData?.message ||
          responseData?.error ||
          'Không thể kết nối tới hệ thống AI.';

        setMessages(prev => [
          ...prev,
          {
            role: 'ai',
            content: errorMessage
          }
        ]);
      } else {
        console.error('Unknown error:', error);

        setMessages(prev => [
          ...prev,
          {
            role: 'ai',
            content: 'Đã xảy ra lỗi không xác định.'
          }
        ]);
      }
    }
  };

  return (
    <div className="btb-ultra-chat-wrapper">
      {isOpen && (
        <div className="btb-ultra-window">
          <div className="btb-ultra-header">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <Sparkles size={18} color="#fbbf24" />

              <span style={{ fontWeight: 'bold' }}>
                BeatBox AI
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Đóng cửa sổ trò chuyện"
              style={{
                cursor: 'pointer',
                border: 'none',
                background: 'transparent',
                color: 'inherit',
                padding: 0,
                display: 'flex'
              }}
            >
              <X size={20} />
            </button>
          </div>

          <div className="btb-ultra-messages-area">
            {messages.map((msg, index) => (
              <div
                key={`${msg.role}-${index}`}
                className={`btb-ultra-msg ${msg.role === 'user'
                    ? 'btb-ultra-msg-user'
                    : 'btb-ultra-msg-ai'
                  }`}
              >
                {msg.content}
              </div>
            ))}

            {isTyping && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#94a3b8',
                  fontSize: '12px',
                  fontStyle: 'italic'
                }}
              >
                <Loader2
                  size={14}
                  className="animate-spin"
                />

                AI đang suy nghĩ...
              </div>
            )}

            <div ref={scrollRef} />
          </div>

          <form
            className="btb-ultra-input-form"
            onSubmit={handleSend}
          >
            <input
              type="text"
              placeholder="Nhập tin nhắn..."
              value={input}
              disabled={isTyping}
              onChange={e => setInput(e.target.value)}
            />

            <button
              type="submit"
              className="btb-ultra-send-btn"
              disabled={!input.trim() || isTyping}
              aria-label="Gửi tin nhắn"
            >
              {isTyping ? (
                <Loader2
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <Send size={18} />
              )}
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        className="btb-ultra-trigger-btn"
        onClick={() => setIsOpen(prev => !prev)}
        aria-label={isOpen ? 'Đóng trợ lý AI' : 'Mở trợ lý AI'}
      >
        {isOpen ? <X size={30} /> : <Bot size={30} />}
      </button>
    </div>
  );
}