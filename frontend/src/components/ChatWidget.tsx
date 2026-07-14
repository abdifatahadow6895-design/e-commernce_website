import { useState } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BOT_RESPONSES: Record<string, string> = {
  default: "Hi! I'm NexBot, your shopping assistant. How can I help you today?",
  shipping: 'We offer free shipping on orders over $100. Standard delivery takes 3-5 business days.',
  returns: 'We accept returns within 30 days of delivery. Items must be unused and in original packaging.',
  payment: 'We accept Visa, Mastercard, Stripe, PayPal, Google Pay, Apple Pay, M-Pesa, and Cash on Delivery.',
  track: 'You can track your order by visiting your profile > Orders, or use the order tracking page with your order number.',
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: 'bot', text: BOT_RESPONSES.default }]);
  const [input, setInput] = useState('');

  const getBotResponse = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes('ship')) return BOT_RESPONSES.shipping;
    if (lower.includes('return')) return BOT_RESPONSES.returns;
    if (lower.includes('pay')) return BOT_RESPONSES.payment;
    if (lower.includes('track')) return BOT_RESPONSES.track;
    return "Thanks for your message! Our support team will get back to you shortly. For immediate help, check our FAQ or contact support@nexshop.com.";
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { role: 'user', text: input }]);
    const response = getBotResponse(input);
    setTimeout(() => setMessages((prev) => [...prev, { role: 'bot', text: response }]), 500);
    setInput('');
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 flex h-[420px] w-[360px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900 max-sm:right-4 max-sm:w-[calc(100vw-2rem)]"
          >
            <div className="flex items-center justify-between bg-gradient-to-r from-primary-600 to-purple-600 px-4 py-3 text-white">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                <div>
                  <p className="text-sm font-semibold">NexBot Support</p>
                  <p className="text-xs opacity-80">Online now</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${msg.role === 'user' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 p-3 dark:border-gray-700">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="input flex-1 text-sm"
                />
                <button onClick={sendMessage} className="btn-primary px-3"><Send className="h-4 w-4" /></button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-primary-600 to-purple-600 text-white shadow-lg shadow-primary-500/30 transition-transform hover:scale-110"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </>
  );
}
