import { useState, useRef, useEffect } from "react";

const API_URL = "https://api-flask-npl.onrender.com/api";
const API_KEY = "AIzaSyCi3DlsbGCaDB7xbe8SneX-NlXc36kpJF8";

const SUGGESTIONS = [
  "O que é Backtracking?",
  "Como o Dijkstra resolve labirintos?",
  "O que é Q-Learning?",
  "Qual a diferença entre os três algoritmos?",
  "O que é a equação de Bellman?",
  "Como funciona a tabela Q?",
];

const HexIcon = ({ size = 20, color = "#888" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="12,2 21,7 21,17 12,22 3,17 3,7" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
    <polygon points="12,7 16.5,9.5 16.5,14.5 12,17 7.5,14.5 7.5,9.5" stroke={color} strokeWidth="1" fill="none" strokeLinejoin="round" />
    <line x1="12" y1="2" x2="12" y2="7" stroke={color} strokeWidth="1" />
    <line x1="21" y1="7" x2="16.5" y2="9.5" stroke={color} strokeWidth="1" />
    <line x1="21" y1="17" x2="16.5" y2="14.5" stroke={color} strokeWidth="1" />
    <line x1="12" y1="22" x2="12" y2="17" stroke={color} strokeWidth="1" />
    <line x1="3" y1="17" x2="7.5" y2="14.5" stroke={color} strokeWidth="1" />
    <line x1="3" y1="7" x2="7.5" y2="9.5" stroke={color} strokeWidth="1" />
  </svg>
);

const MazeBackground = () => (
  <svg style={{ position: "fixed", inset: 0, width: "100%", height: "100%", opacity: 0.04, pointerEvents: "none", zIndex: 0 }} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="maze" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
        <rect width="60" height="60" fill="none" />
        <path d="M0 0h40M0 0v40M60 20h-20v20M20 60v-20h20M0 60h20M60 0v20" stroke="#ffffff" strokeWidth="1.2" fill="none" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#maze)" />
  </svg>
);

const TypingDots = () => (
  <div style={{ display: "flex", gap: 5, alignItems: "center", padding: "13px 16px" }}>
    {[0, 1, 2].map(i => (
      <span key={i} style={{
        width: 6, height: 6, borderRadius: "50%", background: "#666",
        display: "inline-block",
        animation: "bounce 1.2s infinite",
        animationDelay: `${i * 0.2}s`,
      }} />
    ))}
  </div>
);

const parseMarkdown = (text) => {
  return text
    .replace(/^### (.+)$/gm, "<strong style=\"font-size:15px;color:#f0f0f0\">$1</strong>")
    .replace(/^## (.+)$/gm, "<strong style=\"font-size:16px;color:#f0f0f0\">$1</strong>")
    .replace(/^# (.+)$/gm, "<strong style=\"font-size:17px;color:#f0f0f0\">$1</strong>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code style=\"background:#222;padding:1px 5px;border-radius:4px;font-size:13px\">$1</code>");
};

const Message = ({ msg }) => {
  const isBot = msg.role === "bot";
  return (
    <div style={{
      display: "flex",
      justifyContent: isBot ? "flex-start" : "flex-end",
      marginBottom: 14,
      animation: "fadeSlideIn 0.25s ease",
    }}>
      {isBot && (
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: "#1a1a1a", border: "1px solid #2e2e2e",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginRight: 10, flexShrink: 0, marginTop: 2,
        }}>
          <HexIcon size={16} color="#777" />
        </div>
      )}
      <div style={{
        maxWidth: "70%",
        padding: "11px 15px",
        borderRadius: isBot ? "4px 14px 14px 14px" : "14px 4px 14px 14px",
        background: isBot ? "#181818" : "#252525",
        border: isBot ? "1px solid #2a2a2a" : "1px solid #383838",
        color: "#e8e8e8",
        fontSize: 14, lineHeight: 1.7,
        fontFamily: "'Fira Code', monospace",
        boxShadow: "0 1px 6px rgba(0,0,0,0.4)",
        whiteSpace: "pre-wrap",
        textAlign: "left",
      }}>
        <span dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.text) }} />
      </div>
    </div>
  );
};

export default function App() {
  const [messages, setMessages] = useState([{
    role: "bot",
    text: "Olá! Eu sou o MazeBot.\n\nSou seu assistente especializado em algoritmos de busca e IA aplicados a labirintos. Posso te explicar como funcionam o Backtracking, Dijkstra e Q-Learning de forma clara e objetiva.\n\nO que você quer aprender hoje?",
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const consulta = text || input.trim();
    if (!consulta || loading) return;
    setMessages(prev => [...prev, { role: "user", text: consulta }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: API_KEY },
        body: JSON.stringify({ consulta }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, {
        role: "bot",
        text: data.mensagem || "Não consegui obter uma resposta. Tente novamente.",
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: "bot",
        text: "Erro ao conectar com a API. Verifique se o servidor está online.",
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500&family=Space+Mono:wght@400;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #111111; color: #e8e8e8; font-family: 'Fira Code', monospace; height: 100dvh; overflow: hidden; }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.3; }
          40% { transform: translateY(-5px); opacity: 0.9; }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .send-btn:hover:not(:disabled) { background: #2a2a2a !important; border-color: #555 !important; color: #ddd !important; }
        .send-btn:active:not(:disabled) { transform: scale(0.95); }
        .suggestion:hover { background: #222 !important; border-color: #444 !important; color: #ccc !important; }
        .input-wrap:focus-within { border-color: #444 !important; }
        .input-field { outline: none; }
        .input-field::placeholder { color: #444; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 10px; }
      `}</style>

      <MazeBackground />

      <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", height: "100dvh", width: "100%" }}>

        {/* Header */}
    <div style={{ padding: "16px 24px", borderBottom: "1px solid #1e1e1e", display: "flex", alignItems: "flex-start", gap: 12 }}>
  <div style={{
    width: 36, height: 36, borderRadius: 9,
    background: "#1a1a1a", border: "1px solid #2a2a2a",
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  }}>
            <HexIcon size={18} color="#777" />
          </div>
          <div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 16, fontWeight: 700, color: "#f0f0f0", letterSpacing: "0.03em", marginLeft: -130 }}>
              MazeBot
            </div>
            <div style={{ fontSize: 10, color: "#555", letterSpacing: "0.12em", marginTop: 1 }}>
              ALGORITMOS · LABIRINTOS · IA
            </div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22a52d" }} />
            <span style={{ fontSize: 10, color: "#555", fontFamily: "'Space Mono', monospace" }}>online</span>
          </div>
        </div>

        {/* Mensagens */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>

          {/* Sugestões */}
          {messages.length === 1 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 10, color: "#444", marginBottom: 10, letterSpacing: "0.14em" }}>SUGESTÕES</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {SUGGESTIONS.map((s, i) => (
                  <button key={i} className="suggestion" onClick={() => sendMessage(s)} style={{
                    background: "#171717", border: "1px solid #2a2a2a",
                    borderRadius: 20, padding: "6px 13px",
                    color: "#666", fontSize: 12,
                    fontFamily: "'Fira Code', monospace",
                    cursor: "pointer", transition: "all 0.15s",
                  }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => <Message key={i} msg={msg} />)}

          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: "#1a1a1a", border: "1px solid #2e2e2e", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <HexIcon size={16} color="#666" />
              </div>
              <div style={{ background: "#181818", border: "1px solid #2a2a2a", borderRadius: "4px 14px 14px 14px" }}>
                <TypingDots />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ borderTop: "1px solid #1e1e1e", padding: "12px 24px 20px" }}>
          <div className="input-wrap" style={{
            display: "flex", gap: 10, alignItems: "flex-end",
            background: "#171717", border: "1px solid #2a2a2a",
            borderRadius: 12, padding: "10px 12px",
            transition: "border-color 0.2s",
          }}>
            <textarea
              ref={inputRef}
              className="input-field"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Pergunte sobre Backtracking, Dijkstra, Q-Learning..."
              rows={1}
              disabled={loading}
              style={{
                flex: 1, background: "transparent", border: "none",
                color: "#e8e8e8", fontSize: 13.5,
                fontFamily: "'Fira Code', monospace",
                resize: "none", lineHeight: 1.5, maxHeight: 120, overflowY: "auto",
              }}
              onInput={e => {
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
              }}
            />
            <button
              className="send-btn"
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              style={{
                width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                background: "transparent", border: "1px solid #2a2a2a",
                color: input.trim() ? "#aaa" : "#333",
                fontSize: 16, cursor: input.trim() ? "pointer" : "default",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.15s",
              }}
            >
              ↑
            </button>
          </div>
          <div style={{ textAlign: "center", marginTop: 8, fontSize: 10, color: "#333", letterSpacing: "0.06em" }}>
            Enter para enviar · Shift+Enter para nova linha
          </div>
        </div>

      </div>
    </>
  );
}