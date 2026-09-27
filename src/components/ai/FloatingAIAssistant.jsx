import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, X, Send, Sparkles, MapPin, Calendar, DollarSign, Hotel, 
  Utensils, Car, ShoppingBag, ShieldCheck, Sun, Compass, Globe, 
  HelpCircle, Mic, MicOff, RefreshCw, ChevronRight, Copy, Check
} from 'lucide-react';
import { AI_KNOWLEDGE_BASE } from '../../data/phase4Data';
import { useLanguage } from '../../context/LanguageContext';

export default function FloatingAIAssistant({ onOpenPlanner, onNavigateFleet }) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();
  const [messages, setMessages] = useState([
    {
      id: 'msg-1',
      sender: 'bot',
      text: "👋 Namaste! I'm **Aira**, your 24/7 AI Travel Assistant powered by Siddhivinayak Tours & Travels. How can I help you plan your dream journey today?",
      time: 'Just now',
      suggestions: [
        '🌴 Best places to visit in Monsoon',
        '💳 Estimated budget for Goa 3-day trip',
        '✈️ Bali Visa & Entry guidelines',
        '🏨 Top hotel recommendations in Lonavala',
        '🍛 Best Veg & Jain food in Mahabaleshwar'
      ]
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = (textToSend = null) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      const botResponse = generateAIAnswer(text);
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 900);
  };

  const generateAIAnswer = (query) => {
    const lower = query.toLowerCase();
    
    // Check Knowledge Base
    const matchedKB = AI_KNOWLEDGE_BASE.find(item => 
      item.keywords.some(kw => lower.includes(kw))
    );

    if (matchedKB) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: matchedKB.answer,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    }

    if (lower.includes('place') || lower.includes('destination') || lower.includes('visit') || lower.includes('where to go')) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: `📍 **Top Recommended Destinations Right Now:**\n\n1. **Lonavala & Khandala:** Misty ghats, tiger leap, and lush waterfalls. Perfect for a 1-day or weekend car road trip.\n2. **Mahabaleshwar:** Cold breeze, strawberry gardens, and scenic valley lookouts.\n3. **Goa:** Beaches, sea shacks, water sports & nightlife.\n4. **Shirdi:** Peaceful spiritual weekend retreat.\n\nWould you like me to generate a personalized itinerary for one of these places?`,
        action: { label: '🚀 Open AI Smart Planner', onClick: onOpenPlanner },
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    }

    if (lower.includes('budget') || lower.includes('cost') || lower.includes('price') || lower.includes('expensive')) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: `💰 **AI Budget Estimator Summary:**\n\n• **Weekend Road Trip (Lonavala/Mahabaleshwar):** Approx ₹3,500 – ₹7,000 per person (Includes luxury cab/self-drive, 3-star hotel & meals).\n• **Goa 3D/2N Beach Package:** Approx ₹8,500 – ₹15,000 per person.\n• **Luxury SUV Road Expedition:** Car rental starting at just ₹3,499/day with unlimited km options!\n\nUse our **AI Budget Calculator** in the Planner section for exact breakdown!`,
        action: { label: '🧮 Calculate Exact Budget', onClick: onOpenPlanner },
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    }

    if (lower.includes('hotel') || lower.includes('stay') || lower.includes('resort')) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: `🏨 **Top AI Ranked Hotels & Resorts:**\n\n• **Lonavala:** The Machan Treehouse (Eco Luxury) & Fariyas Resort (Family favorite).\n• **Mahabaleshwar:** Le Méridien Resort & Spa & Brightland Resort.\n• **Goa:** Taj Fort Aguada & W Goa.\n\nOur chauffeur-driven vehicles provide free door-to-door drop directly at any hotel reception!`,
        action: { label: '🚗 Explore Our Fleet for Hotel Drops', onClick: onNavigateFleet },
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    }

    if (lower.includes('food') || lower.includes('veg') || lower.includes('jain') || lower.includes('restaurant')) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: `🍛 **AI Culinary & Dining Guide:**\n\n• **Pure Veg & Jain Special:** Rama Krishna Restaurant in Lonavala & Mapro Garden Cafe in Mahabaleshwar offer 100% pure vegetarian & Jain customizable items.\n• **Seafood Delights:** Britto's & Fisherman's Wharf in Goa for authentic butter garlic prawns and fish curry.\n• **Local Snacks:** Don't miss Cooper's Chocolate Walnut Fudge in Lonavala!`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    }

    if (lower.includes('car') || lower.includes('cab') || lower.includes('fleet') || lower.includes('drive')) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: `🚗 **Siddhivinayak Fleet Guidance:**\n\n• **Mahindra Thar 4x4:** Best for off-road mountain drives (₹3,499/day).\n• **Toyota Innova Crysta ZX:** Highest rated for 7-seater family comfort (₹3,899/day).\n• **BMW 5 Series:** Executive luxury arrival (₹9,999/day).\n\nBoth Self-Drive and Chauffeur-driven options available with 0 hidden charges!`,
        action: { label: '🔑 View All Cars & Rates', onClick: onNavigateFleet },
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    }

    // Default Fallback Response
    return {
      id: `bot-${Date.now()}`,
      sender: 'bot',
      text: `🤖 That's a great travel query! I have matched it with our travel knowledge base for **"${query}"**.\n\nKey highlights:\n- We provide custom door-to-door itinerary planning.\n- All major routes (Mumbai, Pune, Goa, Mahabaleshwar, Shirdi, Udaipur) are covered with live traffic monitoring.\n- You can use our Smart AI Planner tool to get day-by-day schedules, packing lists, and exact budget calculators.`,
      action: { label: '🗺️ Launch Smart AI Planner', onClick: onOpenPlanner },
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const handleMicClick = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser window. Please type your query!');
      return;
    }

    setIsListening(true);
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
      setIsListening(false);
      handleSendMessage(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleCopyText = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <div className="fixed bottom-20 right-6 z-50 flex items-center gap-2 group">
        {/* Tooltip on hover */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-900/90 text-white px-3.5 py-2 rounded-2xl text-xs font-semibold shadow-2xl backdrop-blur-md border border-slate-700 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0 pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          <span>Aira AI Travel Concierge (24/7)</span>
        </div>

        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-300 text-slate-950 flex items-center justify-center shadow-2xl shadow-amber-500/30 border border-amber-200/50 cursor-pointer"
          aria-label="Open AI Travel Assistant"
        >
          <Bot className="w-5 h-5 text-slate-950" />
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-950" />
        </motion.button>
      </div>

      {/* Assistant Modal Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed bottom-[152px] right-4 sm:right-6 z-50 w-[92vw] sm:w-[420px] h-[540px] bg-slate-900 text-slate-100 rounded-3xl shadow-2xl border border-slate-800 flex flex-col overflow-hidden backdrop-blur-xl"
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950/40 p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 flex items-center gap-2 text-base">
                    Aira AI Assistant
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-semibold border border-emerald-500/30">
                      Online
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">Siddhivinayak Smart Travel Intelligence</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/60 custom-scrollbar">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl p-3.5 text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-medium rounded-br-none shadow-lg shadow-amber-500/10'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none shadow-md'
                    }`}
                  >
                    <div className="whitespace-pre-line font-sans">{msg.text}</div>

                    {/* Action Button inside msg */}
                    {msg.action && (
                      <button
                        onClick={() => {
                          msg.action.onClick();
                          setIsOpen(false);
                        }}
                        className="mt-3 w-full py-2 px-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-amber-500/40 transition-colors"
                      >
                        {msg.action.label}
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <div className="mt-1 flex items-center justify-between gap-2 text-[10px] text-slate-400">
                      <span>{msg.time}</span>
                      {msg.sender === 'bot' && (
                        <button
                          onClick={() => handleCopyText(msg.id, msg.text)}
                          className="hover:text-amber-400 transition-colors flex items-center gap-1"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Suggestion Chips */}
                  {msg.suggestions && (
                    <div className="mt-3 flex flex-wrap gap-1.5 max-w-[95%]">
                      {msg.suggestions.map((chip, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(chip)}
                          className="text-xs bg-slate-900/90 hover:bg-amber-500/20 text-amber-300 hover:text-amber-200 border border-amber-500/30 px-3 py-1.5 rounded-full transition-all text-left flex items-center gap-1.5"
                        >
                          <span>{chip}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3 py-2 rounded-2xl w-fit">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                  <span>Aira is analyzing travel intelligence...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Action Category Chips Bar */}
            <div className="bg-slate-900 px-3 py-2 border-t border-slate-800 flex gap-2 overflow-x-auto no-scrollbar">
              <button
                onClick={() => handleSendMessage('Best places to visit in monsoon')}
                className="flex items-center gap-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700 whitespace-nowrap"
              >
                <Compass className="w-3 h-3 text-amber-400" /> Places
              </button>
              <button
                onClick={() => handleSendMessage('Budget planning for 3 days road trip')}
                className="flex items-center gap-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700 whitespace-nowrap"
              >
                <DollarSign className="w-3 h-3 text-emerald-400" /> Budget
              </button>
              <button
                onClick={() => handleSendMessage('International Visa guidelines for Bali & Dubai')}
                className="flex items-center gap-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700 whitespace-nowrap"
              >
                <Globe className="w-3 h-3 text-sky-400" /> Visa
              </button>
              <button
                onClick={() => handleSendMessage('Food & Jain recommendations')}
                className="flex items-center gap-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700 whitespace-nowrap"
              >
                <Utensils className="w-3 h-3 text-rose-400" /> Food
              </button>
              <button
                onClick={() => handleSendMessage('Travel Safety & emergency guidelines')}
                className="flex items-center gap-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700 whitespace-nowrap"
              >
                <ShieldCheck className="w-3 h-3 text-blue-400" /> Safety
              </button>
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
              <button
                onClick={handleMicClick}
                className={`p-2.5 rounded-xl border transition-colors ${
                  isListening
                    ? 'bg-rose-500 text-white border-rose-400 animate-pulse'
                    : 'bg-slate-800 text-slate-400 hover:text-amber-400 border-slate-700'
                }`}
                title={isListening ? 'Listening...' : 'Voice Input'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask visa, places, budget, food, safety..."
                className="flex-1 bg-slate-950 text-slate-100 text-sm px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500/60 placeholder:text-slate-500"
              />

              <button
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim()}
                className="p-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 text-slate-950 font-bold rounded-xl shadow-md transition-all flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
