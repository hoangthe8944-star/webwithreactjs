import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import axios from 'axios';
import { BASE_URL } from '../../api/apiconfig';

interface AIChatboxProps {
  user: any;
}

export default function AIChatbox({ user }: AIChatboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', content: `Chào ${user?.username || 'bạn'}! Tôi là trợ lý AI. Hãy hỏi tôi về âm nhạc.` }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await axios.post(`${BASE_URL}/api/ai/chat`, { 
        message: userMsg,
        username: user?.username 
      });
      setMessages(prev => [...prev, { role: 'ai', content: res.data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: 'AI đang bận, bạn thử lại sau nhé!' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="btb-ultra-chat-wrapper">
      {/* Khung cửa sổ chat */}
      {isOpen && (
        <div className="btb-ultra-window">
          <div className="btb-ultra-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sparkles size={18} color="#fbbf24" />
              <span style={{ fontWeight: 'bold' }}>BeatBox AI</span>
            </div>
            <X size={20} onClick={() => setIsOpen(false)} style={{ cursor: 'pointer' }} />
          </div>

          <div className="btb-ultra-messages-area">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`btb-ultra-msg ${msg.role === 'user' ? 'btb-ultra-msg-user' : 'btb-ultra-msg-ai'}`}
              >
                {msg.content}
              </div>
            ))}
            {isTyping && (
              <div style={{ color: '#94a3b8', fontSize: '12px', fontStyle: 'italic' }}>
                AI đang suy nghĩ...
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          <form className="btb-ultra-input-form" onSubmit={handleSend}>
            <input 
              type="text" 
              placeholder="Nhập tin nhắn..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" className="btb-ultra-send-btn">
              <Send size={18} />
            </button>
          </form>
        </div>
      )}

      {/* Nút bấm tròn */}
      <button className="btb-ultra-trigger-btn" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={30} /> : <Bot size={30} />}
      </button>
    </div>
  );
}