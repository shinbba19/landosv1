"use client";
import { useState, useRef, useEffect } from "react";
import { useStore } from "@/lib/store";
import { Bot, X, Send, Loader2, Sparkles, ChevronDown } from "lucide-react";
import clsx from "clsx";

interface Message {
  role: "user" | "ai";
  text: string;
  streaming?: boolean;
}

const QUICK_SUGGESTIONS: Record<number, string[]> = {
  1: ["ไร่ งาน ตร.วา คืออะไร?", "ต้นทุนการถือครองหมายถึงอะไร?", "ราคาประเมินสำคัญอย่างไร?"],
  2: ["ควรหักถนนกี่เปอร์เซ็นต์?", "ขนาดแปลงที่เหมาะสมคือเท่าไหร่?", "พื้นที่ที่เหลือ (leftover) จัดการอย่างไร?"],
  3: ["ควรเลือก Preset ไหน?", "ถนนภายในโครงการยาวประมาณเท่าไหร่?", "ค่าก่อสร้างถนนมาตรฐานคือเท่าไหร่?"],
  4: ["ราคาขายที่เหมาะสมควรเป็นเท่าไหร่?", "ROI เท่าไหร่ถือว่าดี?", "Gross Margin กับ ROI ต่างกันอย่างไร?"],
  5: ["ควรเลือก Option ไหนดี?", "ความเสี่ยงของ Develop & Sell มีอะไรบ้าง?", "เงินทุนขั้นต่ำที่ต้องใช้คือเท่าไหร่?"],
  6: ["วิธีบันทึกรายงานเป็น PDF", "ควรนำรายงานนี้ไปปรึกษาใคร?", "ขั้นตอนถัดไปหลังจากวิเคราะห์แล้วคือ?"],
};

const STEP_LABELS: Record<number, string> = {
  1: "Land Input", 2: "Land Analysis", 3: "Dev Cost",
  4: "Financial", 5: "Comparison", 6: "Summary",
};

export default function AiChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { currentStep, projectName, landInput, landAnalysis, devCost, financial } = useStore();

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      inputRef.current?.focus();
    }
  }, [messages, open]);

  // Reset quick suggestions when step changes
  const suggestions = QUICK_SUGGESTIONS[currentStep] ?? [];

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    setInput("");

    const userMsg: Message = { role: "user", text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setLoading(true);

    const aiMsg: Message = { role: "ai", text: "", streaming: true };
    setMessages([...updatedMessages, aiMsg]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, text: m.text })),
          step: currentStep,
          projectData: { projectName, landInput, landAnalysis, devCost, financial },
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        setMessages([...updatedMessages, { role: "ai", text: `Error: ${errText}` }]);
        return;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setMessages([...updatedMessages, { role: "ai", text: accumulated, streaming: true }]);
      }

      setMessages([...updatedMessages, { role: "ai", text: accumulated, streaming: false }]);
    } catch {
      setMessages([...updatedMessages, { role: "ai", text: "ขออภัย เกิดข้อผิดพลาด กรุณาลองใหม่" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="no-print fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat Panel */}
      {open && (
        <div className="w-[380px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          style={{ maxHeight: "560px" }}>
          {/* Header */}
          <div className="bg-brand-700 text-white px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-brand-300" />
              <div>
                <p className="font-bold text-sm leading-tight">LANDOS AI</p>
                <p className="text-xs text-brand-300 leading-tight">
                  Step {currentStep}: {STEP_LABELS[currentStep]}
                </p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-brand-300 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
            {messages.length === 0 && (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Bot size={24} className="text-brand-600" />
                </div>
                <p className="text-sm font-semibold text-gray-700 mb-1">สวัสดี! ฉันคือ LANDOS AI</p>
                <p className="text-xs text-gray-500">ถามฉันได้เลยเกี่ยวกับที่ดินและการพัฒนาของคุณ</p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={clsx("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                {msg.role === "ai" && (
                  <div className="w-6 h-6 bg-brand-100 rounded-full flex items-center justify-center mr-2 shrink-0 mt-0.5">
                    <Bot size={13} className="text-brand-600" />
                  </div>
                )}
                <div className={clsx(
                  "max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
                  msg.role === "user"
                    ? "bg-brand-600 text-white rounded-br-sm"
                    : "bg-gray-100 text-gray-800 rounded-bl-sm"
                )}>
                  {msg.text || (msg.streaming && (
                    <span className="flex gap-1 items-center py-1">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                    </span>
                  ))}
                  {msg.role === "ai" && msg.streaming && msg.text && (
                    <span className="inline-block w-0.5 h-3.5 bg-brand-500 animate-pulse ml-0.5 align-middle" />
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions */}
          {messages.length === 0 && (
            <div className="px-3 pb-2 flex flex-wrap gap-1.5 shrink-0">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  disabled={loading}
                  className="text-xs bg-brand-50 text-brand-700 border border-brand-200 rounded-full px-3 py-1.5 hover:bg-brand-100 transition-colors disabled:opacity-50 text-left"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="border-t border-gray-100 p-3 shrink-0">
            <div className="flex gap-2 items-center">
              <input
                ref={inputRef}
                className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="ถามอะไรก็ได้..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={loading || !input.trim()}
                className="w-9 h-9 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-colors shrink-0"
              >
                {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          "flex items-center gap-2 px-4 py-3 rounded-2xl shadow-lg font-semibold text-sm transition-all",
          open
            ? "bg-gray-800 text-white"
            : "bg-brand-600 hover:bg-brand-700 text-white"
        )}
      >
        {open ? <ChevronDown size={18} /> : <Sparkles size={18} />}
        {open ? "ปิด" : "AI ช่วยได้"}
      </button>
    </div>
  );
}
