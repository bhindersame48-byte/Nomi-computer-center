import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, X, Send, Bot, Sparkles, SendHorizontal } from "lucide-react";
import { ChatMessage } from "../types";

export default function AdvisorChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init",
      sender: "advisor",
      text: "As-salamu Alaykum! Welcome to Nomi Computers Dunyapur. I am your Smart AI Advisor. Ask me anything about our laptop collections or computer technical courses!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [userBudget, setUserBudget] = useState("");
  const [userRole, setUserRole] = useState("Prospective Student");
  const [purposeFilter, setPurposeFilter] = useState("Information");

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setLoading(true);

    try {
      const response = await fetch("/api/gemini/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          chatHistory: messages,
          userBudget: userBudget,
          userRole: userRole,
          purposeFilter: purposeFilter,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: "advisor",
            text: data.text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: "advisor",
            text: `Support Note: ${data.error || "Advisor is currently resting. Please contact our front desk at +92-300-7303000."}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "advisor",
          text: "Uh oh! Connections to Nomi servers failed. Make sure your local internet is active or visit us near Kazmi Chowk!",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const suggestionChips = [
    { label: "Best Web Dev Course?", text: "What do you teach in Web Development course and what are the freelancing opportunities?" },
    { label: "Suggest coding laptop under 85k", text: "Recommend a high quality laptop for heavy coding and office work within 85,000 PKR budget." },
    { label: "Which is better: CIT or DIT?", text: "Provide a comparison between the 3-Months CIT and 6-Months DIT courses." },
    { label: "Location & WhatsApp info?", text: "Where exactly is Nomi Computers located near Kazmi Chowk and what is your WhatsApp contact number?" },
  ];

  return (
    <>
      {/* Floating Sparkle Chat Trigger button */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          id="btn-advisor-toggle"
          onClick={() => setIsOpen(!isOpen)}
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 shadow-lg shadow-indigo-500/30 text-white cursor-pointer hover:scale-110 active:scale-95 transition-transform"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex h-4 w-4 rounded-full bg-cyan-500 text-[9px] font-bold text-black items-center justify-center">AI</span>
          </span>
        </motion.button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="advisor-chat-window"
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed bottom-24 right-4 md:right-6 z-50 w-[92vw] sm:w-[420px] h-[550px] overflow-hidden rounded-2xl bg-white border border-slate-205 shadow-2xl flex flex-col font-sans"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-violet-600 via-indigo-650 to-indigo-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/15 rounded-lg border border-white/20 text-white">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-1.5 leading-tight">
                    Nomi Smart Advisor
                    <span className="inline-flex items-center rounded-xl bg-white/20 px-1.5 py-0.5 text-[9px] font-medium text-white border border-white/10">
                      <Sparkles className="mr-0.5 h-2 w-2 text-yellow-300 animate-pulse" /> Live
                    </span>
                  </h3>
                  <p className="text-[11px] text-indigo-100">Academy & Laptop Consultant</p>
                </div>
              </div>
              <button
                id="btn-close-advisor"
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Context Config Drawer (Filters) */}
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 grid grid-cols-3 gap-2 text-[10px] text-left">
              <div>
                <label className="block text-slate-550 font-bold uppercase tracking-wider mb-1">Your Role</label>
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                  className="w-full bg-white text-slate-700 border border-slate-200 rounded px-1.5 py-1 focus:outline-none focus:border-indigo-500 text-xs font-medium"
                >
                  <option value="Prospective Student">Student</option>
                  <option value="Freelancer Developer">Freelancer</option>
                  <option value="Office Professional">Office Worker</option>
                  <option value="Parent">Parent</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-550 font-bold uppercase tracking-wider mb-1">Max Budget</label>
                <select
                  value={userBudget}
                  onChange={(e) => setUserBudget(e.target.value)}
                  className="w-full bg-white text-slate-700 border border-slate-200 rounded px-1.5 py-1 focus:outline-none focus:border-indigo-500 text-xs font-medium"
                >
                  <option value="">No limit</option>
                  <option value="Rs. 35,000">Below 35k</option>
                  <option value="Rs. 60,000">35k - 60k</option>
                  <option value="Rs. 90,000">60k - 90k</option>
                  <option value="Rs. 150,000+">Above 90k</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-550 font-bold uppercase tracking-wider mb-1">Advice Target</label>
                <select
                  value={purposeFilter}
                  onChange={(e) => setPurposeFilter(e.target.value)}
                  className="w-full bg-white text-slate-700 border border-slate-200 rounded px-1.5 py-1 focus:outline-none focus:border-indigo-500 text-xs font-medium"
                >
                  <option value="Laptops Info">Buy Laptop</option>
                  <option value="IT Courses Info">IT Courses</option>
                  <option value="Local Job Forms">Local Jobs</option>
                </select>
              </div>
            </div>

            {/* Messages body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 custom-scrollbar">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-indigo-650 text-white rounded-tr-none shadow-md shadow-indigo-605/10 text-left font-sans font-normal"
                        : "bg-white text-slate-805 rounded-tl-none border border-slate-200 shadow-sm text-left font-sans font-normal"
                    }`}
                  >
                    <div className="whitespace-pre-line">{msg.text}</div>
                    <div className={`text-[9px] mt-1 text-right ${msg.sender === "user" ? "text-indigo-200" : "text-slate-400"}`}>
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-2xl rounded-tl-none px-4 py-3 bg-white text-slate-550 border border-slate-200 shadow-sm flex items-center gap-2">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                    </span>
                    <p className="text-[11px] font-medium text-slate-500 animate-pulse">Smart Advisor building recommendation...</p>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick Suggestion Chips */}
            <div className="p-2 bg-slate-100 border-t border-slate-200 overflow-x-auto whitespace-nowrap flex gap-1.5 scrollbar-none">
              {suggestionChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(chip.text)}
                  className="px-2.5 py-1 bg-white hover:bg-violet-50 text-slate-600 hover:text-violet-750 border border-slate-205 hover:border-violet-300 rounded-full text-[10px] font-medium transition-all cursor-pointer flex-shrink-0 shadow-sm"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputValue);
              }}
              className="p-3 bg-white border-t border-slate-200 flex gap-2 items-center"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your coding/course query..."
                className="flex-1 bg-slate-50 border border-slate-220 text-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white placeholder:text-slate-400"
              />
              <button
                type="submit"
                className="p-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:scale-105 active:scale-95 transition-all text-xs flex items-center justify-center min-w-[36px] min-h-[36px] cursor-pointer shadow-sm"
                disabled={loading}
              >
                <SendHorizontal className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
