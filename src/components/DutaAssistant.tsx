import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, User, UserCircle, Bot, Sparkles, History, Info, ExternalLink, HelpCircle } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils'; // Assuming this exists or I'll define a simple one

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const DutaAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Halo! Saya **DUTA**, Asisten Profesional PsikoTest. Ada yang bisa saya bantu terkait aplikasi ini?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("API Key tidak ditemukan.");

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          ...messages.map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', parts: [{ text: m.content }] })),
          { role: 'user', parts: [{ text: input }] }
        ],
        config: {
          systemInstruction: `Anda adalah DUTA, asisten AI profesional dan elegan untuk aplikasi "PsikoTest". 
          Aplikasi ini adalah platform tes psikologi sekolah yang memiliki fitur:
          1. Berbagai Tes Psikologi: Gaya Belajar, Kecerdasan Majemuk (MI), Kepribadian (MBTI-like), Minat Bakat, Penjurusan Sekolah, Karir, Kecemasan, Wartegg (proyektif), Minat Mapel, dan CFIT.
          2. Dashboard Admin/Guru BK: Mengelola data siswa, melihat statistik kelas, dan mencetak laporan PDF.
          3. Catatan Konseling: Guru BK dapat membuat dan mengelola catatan bimbingan konseling siswa.
          4. Laporan Detail: Hasil tes dianalisa secara mendalam, termasuk dengan bantuan AI.
          5. Kustomisasi: Admin bisa membuat tes kustom sendiri.

          Tugas Anda:
          - Menjawab pertanyaan pengguna seputar cara penggunaan aplikasi ini.
          - Gunakan bahasa Indonesia yang sangat formal, ramah, dan profesional.
          - Nama Anda adalah DUTA.
          - Tampilan Anda adalah seorang pria berjas dan berpasi resmi.
          - Jika ditanya hal di luar aplikasi, arahkan kembali dengan sopan ke topik aplikasi.
          - Selalu gunakan format Markdown (bold, list, dll) agar scannable.`
        }
      });

      const assistantMessage: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: response.text || 'Maaf, saya mengalami kendala teknis. Mohon ulangi pertanyaan Anda.'
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Duta Error:", error);
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'assistant', 
        content: 'Mohon maaf, layanan asisten sedang tidak tersedia saat ini. Silakan coba beberapa saat lagi.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[999]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-20 right-0 w-[400px] max-w-[calc(100vw-48px)] h-[600px] max-h-[calc(100vh-140px)] bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-200/50 flex flex-col border border-indigo-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-indigo-600 p-6 text-white flex items-center justify-between shadow-lg relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500 to-indigo-700 opacity-50" />
              <div className="relative flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-inner">
                  {/* Minimized Suit Avatar */}
                  <div className="relative">
                    <UserCircle className="w-8 h-8 text-white" />
                    <Sparkles className="w-3 h-3 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
                  </div>
                </div>
                <div>
                  <h3 className="font-black text-xl tracking-tight leading-none mb-1">DUTA</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-100">Asisten Profesional</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-all border border-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Body */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50"
            >
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex flex-col max-w-[85%]",
                    m.role === 'user' ? "ml-auto items-end" : "items-start"
                  )}
                >
                  <div className={cn(
                    "p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                    m.role === 'user' 
                      ? "bg-indigo-600 text-white rounded-tr-none" 
                      : "bg-white text-slate-800 rounded-tl-none border border-indigo-50"
                  )}>
                    <div className="prose prose-sm prose-slate dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-slate-900 prose-pre:text-slate-100">
                      <ReactMarkdown>
                        {m.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mt-1 opacity-50 px-1">
                    {m.role === 'user' ? 'Anda' : 'Duta'}
                  </span>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-2">
                  <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-indigo-50 shadow-sm flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-75" />
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-150" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-6 bg-white border-t border-indigo-50">
              <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-600 transition-all">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Tanyakan sesuatu pada Duta..."
                  className="flex-1 bg-transparent border-none outline-none text-sm px-3 font-medium placeholder:text-slate-400"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:shadow-none"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{ 
          y: [0, -12, 0],
          transition: { 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }
        }}
        className={cn(
          "relative group flex items-center gap-3 p-1.5 pr-6 rounded-full shadow-2xl transition-all duration-500",
          isOpen ? "bg-red-500 text-white" : "bg-white text-indigo-900 overflow-hidden"
        )}
      >
        {!isOpen && (
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/5 to-transparent group-hover:from-indigo-600/10 transition-all" />
        )}
        
        {/* Character Visual */}
        <div className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center shadow-lg relative z-10 p-0.5",
          isOpen ? "bg-white/20" : "bg-indigo-600"
        )}>
           {/* Animated Fluent Emoji Avatar */}
           <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center border border-white/30 backdrop-blur-sm overflow-hidden relative">
                <img 
                  src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People%20with%20professions/Man%20Office%20Worker%20Light%20Skin%20Tone.png" 
                  alt="Duta Avatar" 
                  className="w-10 h-10 object-contain drop-shadow-md"
                  onError={(e) => {
                    // Fallback just in case URL changes
                    e.currentTarget.src = "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Nerd%20Face.png";
                  }}
                />
           </div>
           
           {!isOpen && <Sparkles className="w-4 h-4 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />}
        </div>

        <div className="flex flex-col items-start relative z-10">
          <span className="font-black text-xs uppercase tracking-[0.2em]">{isOpen ? 'Tutup' : 'Tanya Duta'}</span>
          {!isOpen && <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Asisten Aktif</span>}
        </div>

        {/* Hover state pill */}
        {!isOpen && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            whileHover={{ opacity: 1, x: 0 }}
            className="absolute left-full ml-4 whitespace-nowrap bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl pointer-events-none"
          >
            Butuh bantuan terkait aplikasi?
          </motion.div>
        )}
      </motion.button>
    </div>
  );
};

export default DutaAssistant;
