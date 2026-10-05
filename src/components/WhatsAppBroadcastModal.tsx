import React, { useState } from 'react';
import { X, Copy, Check, MessageSquare, ExternalLink, Send } from 'lucide-react';
import { Task, Course } from '../types';
import { generateWhatsAppBroadcast } from '../utils/helpers';

interface WhatsAppBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  course?: Course;
}

export const WhatsAppBroadcastModal: React.FC<WhatsAppBroadcastModalProps> = ({
  isOpen,
  onClose,
  task,
  course,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !task) return null;

  const messageText = generateWhatsAppBroadcast(task, course);

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenWhatsApp = () => {
    const encoded = encodeURIComponent(messageText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Format Broadcast WhatsApp Kelas
            </h3>
            <p className="text-xs text-slate-500">
              Format pengingat rapi untuk disalin ke grup WhatsApp kelas
            </p>
          </div>
        </div>

        {/* Message Preview Box */}
        <div className="relative mb-4">
          <div className="p-3.5 bg-emerald-950 text-emerald-100 rounded-xl font-mono text-xs sm:text-sm whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto border border-emerald-800 shadow-inner">
            {messageText}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <button
            onClick={handleCopy}
            className="w-full sm:flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white rounded-xl font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Tersalin ke Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Salin Teks Broadcast</span>
              </>
            )}
          </button>

          <button
            onClick={handleOpenWhatsApp}
            className="w-full sm:w-auto py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-600/20"
          >
            <Send className="w-4 h-4" />
            <span>Kirim ke WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};
