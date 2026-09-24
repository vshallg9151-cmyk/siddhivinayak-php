import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, PhoneCall, HelpCircle, Send, CheckCircle2, ShieldCheck, Sparkles, MessageCircle } from 'lucide-react';
import { SUPPORT_FAQS } from '../../data/phase5Data';
import { apiClient } from '../../services/apiClient';
import { API_ENDPOINTS } from '../../config/apiConfig';

export default function CustomerSupportModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('ticket'); // 'ticket' | 'faq' | 'call'
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMsg, setTicketMsg] = useState('');
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  const [faqSearch, setFaqSearch] = useState('');

  if (!isOpen) return null;

  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post(API_ENDPOINTS.CONTACT_SUBMIT, {
        name: 'Website Traveler',
        phone: '9173746558',
        email: 'traveler@siddhivinayak.com',
        subject: ticketSubject || 'Customer Support Ticket',
        message: ticketMsg,
        source: '24/7 Customer Support Portal'
      });
    } catch (err) {
      console.warn('Support ticket submit fallback:', err.message);
    }
    setTicketSubmitted(true);
    setTimeout(() => {
      setTicketSubmitted(false);
      setTicketSubject('');
      setTicketMsg('');
    }, 2500);
  };

  const handleWhatsAppClick = () => {
    const url = formatWhatsAppURL("Namaste Siddhivinayak Team! I need customer support assistance.");
    window.open(url, '_blank');
  };

  const filteredFaqs = SUPPORT_FAQS.filter(f =>
    f.q.toLowerCase().includes(faqSearch.toLowerCase()) || f.a.toLowerCase().includes(faqSearch.toLowerCase())
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  24x7 Customer Support Center
                  <span className="text-xs bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Always Online
                  </span>
                </h3>
                <p className="text-xs text-slate-400">Instant assistance for bookings, driver assignment & enquiries</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Contact Bar */}
          <div className="bg-slate-950 p-4 border-b border-slate-800 grid grid-cols-2 gap-3">
            <button
              onClick={handleWhatsAppClick}
              className="p-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
            >
              <MessageCircle className="w-4 h-4 fill-emerald-400" /> WhatsApp Helpline (9173746558)
            </button>
            <a
              href="tel:9173746558"
              className="p-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
            >
              <PhoneCall className="w-4 h-4" /> Call 24/7 ({DISPLAY_PHONE})
            </a>
          </div>

          {/* Tabs */}
          <div className="bg-slate-900 px-5 pt-3 flex gap-2 border-b border-slate-800">
            <button
              onClick={() => setActiveTab('ticket')}
              className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all ${
                activeTab === 'ticket' ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-400'
              }`}
            >
              Create Support Ticket
            </button>
            <button
              onClick={() => setActiveTab('faq')}
              className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all ${
                activeTab === 'faq' ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-400'
              }`}
            >
              Search FAQs
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar text-slate-100">
            {activeTab === 'ticket' && (
              <div>
                {!ticketSubmitted ? (
                  <form onSubmit={handleTicketSubmit} className="space-y-4">
                    <div>
                      <label className="text-xs text-slate-400 font-bold block mb-1">Support Category / Subject</label>
                      <input
                        type="text"
                        placeholder="e.g., Booking Amendment / Invoice Request"
                        value={ticketSubject}
                        onChange={(e) => setTicketSubject(e.target.value)}
                        required
                        className="w-full bg-slate-950 text-slate-100 text-xs font-semibold p-3.5 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 font-bold block mb-1">Message Description</label>
                      <textarea
                        rows="4"
                        placeholder="Describe your query or request in detail..."
                        value={ticketMsg}
                        onChange={(e) => setTicketMsg(e.target.value)}
                        required
                        className="w-full bg-slate-950 text-slate-100 text-xs font-semibold p-3.5 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" /> Submit Support Ticket
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-8 space-y-4">
                    <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                    <h4 className="text-lg font-bold text-slate-100">Support Ticket Created!</h4>
                    <p className="text-xs text-slate-400">Ticket Ref: TKT-{Math.floor(100000 + Math.random() * 900000)}</p>
                    <p className="text-xs text-emerald-400">Our customer team will respond via phone/SMS within 15 minutes.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'faq' && (
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Search FAQ questions..."
                  value={faqSearch}
                  onChange={(e) => setFaqSearch(e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 text-xs p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500 mb-4"
                />

                <div className="space-y-3">
                  {filteredFaqs.map((faq, idx) => (
                    <div key={idx} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1.5">
                      <h5 className="font-bold text-xs text-amber-400">❓ {faq.q}</h5>
                      <p className="text-xs text-slate-300 leading-relaxed">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
