import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Users, 
  MessageSquare, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Play, 
  Pause, 
  RotateCcw,
  Zap,
  Shield,
  BarChart3,
  Terminal,
  Plus,
  Smartphone
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { io } from 'socket.io-client';
import { Contact, MessageLog } from '../App';

const localRephrase = (text: string): string => {
  const synonyms: { [key: string]: string[] } = {
    "hello": ["Hi", "Greetings", "Hey", "Hello"],
    "hi": ["Hello", "Greetings", "Hey", "Hi"],
    "automated": ["automatic", "system-generated", "programmed"],
    "message": ["note", "notification", "alert", "message"],
    "automated message": ["system notification", "automatic alert", "automated note"],
    "from": ["sent by", "originating from", "from"],
    "please": ["kindly", "if possible", "please"],
    "contact": ["reach out to", "get in touch with", "connect with"],
    "help": ["assistance", "support", "guidance"],
    "thanks": ["thank you", "much appreciated", "gratitude"],
    "regards": ["best regards", "sincerely", "kind regards"],
    "professional": ["expert", "specialist", "skilled"],
    "friendly": ["warm", "welcoming", "kind"],
    "persuasive": ["convincing", "compelling", "influential"],
    "university": ["institution", "academy", "college"],
    "automated message from Miva University": ["system alert from Miva University", "automatic notification by Miva University", "automated note from Miva University"]
  };

  let rephrased = text;
  const keys = Object.keys(synonyms).sort((a, b) => b.length - a.length);

  for (const key of keys) {
    const regex = new RegExp(`\\b${key}\\b`, 'gi');
    rephrased = rephrased.replace(regex, () => {
      const options = synonyms[key.toLowerCase()];
      return `{${options.join('|')}}`;
    });
  }

  return rephrased;
};

interface BulkSenderProps {
  contacts: Contact[];
  onMessageSent: (log: Omit<MessageLog, 'id' | 'timestamp'>) => void;
}

interface Campaign {
  id: string;
  name: string;
  total: number;
  sent: number;
  failed: number;
  status: 'running' | 'paused' | 'completed' | 'draft';
  startTime: string;
}

export default function BulkSender({ contacts, onMessageSent }: BulkSenderProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    const saved = localStorage.getItem('ds_crm_campaigns');
    return saved ? JSON.parse(saved) : [];
  });
  const [isSending, setIsSending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentCampaign, setCurrentCampaign] = useState<Campaign | null>(null);
  const [messageText, setMessageText] = useState('Hello {name}, this is an automated message from Miva University.');
  const [logs, setLogs] = useState<string[]>([]);
  
  const [antiBanSettings, setAntiBanSettings] = useState({
    spintax: true,
    zeroWidth: true,
    charSub: false,
    randomDelay: true,
    warmUp: true,
    accountRotation: false,
    minDelay: 2,
    maxDelay: 5
  });

  useEffect(() => {
    localStorage.setItem('ds_crm_campaigns', JSON.stringify(campaigns));
  }, [campaigns]);

  const [isRephrasing, setIsRephrasing] = useState(false);
  const [sendingChannel, setSendingChannel] = useState<'extension' | 'native'>('extension');
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    // Connect to socket for native bridge
    const s = io(window.location.origin);
    setSocket(s);
    return () => {
      s.disconnect();
    };
  }, []);
  const rephraseMessage = async () => {
    if (!messageText) return;
    setIsRephrasing(true);
    
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: `Rephrase this message for a professional WhatsApp communication, making it sound friendly and trustworthy. Keep it concise. Message: ${messageText}` 
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setMessageText(data.text);
      } else {
        // Fallback to local rephrase if API fails
        setMessageText(localRephrase(messageText));
      }
    } catch (error) {
      console.error("AI Rephrase Error:", error);
      setMessageText(localRephrase(messageText));
    } finally {
      setIsRephrasing(false);
    }
  };

  const startNewCampaign = () => {
    if (contacts.length === 0) {
      alert("No contacts available to start a campaign.");
      return;
    }

    const newCampaign: Campaign = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Campaign ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
      total: contacts.length,
      sent: 0,
      failed: 0,
      status: 'running',
      startTime: new Date().toLocaleString()
    };

    setCampaigns(prev => [newCampaign, ...prev]);
    setCurrentCampaign(newCampaign);
    setIsSending(true);
    setProgress(0);
    setLogs([`[${new Date().toLocaleTimeString()}] INITIALIZING CAMPAIGN: ${newCampaign.name}`]);
  };

  const clearCampaignHistory = () => {
    if (confirm('Clear all campaign history?')) {
      setCampaigns([]);
      localStorage.removeItem('ds_crm_campaigns');
    }
  };

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (isSending && currentCampaign && currentCampaign.sent < currentCampaign.total) {
      const delay = antiBanSettings.randomDelay 
        ? (Math.random() * (antiBanSettings.maxDelay - antiBanSettings.minDelay) + antiBanSettings.minDelay) * 1000
        : antiBanSettings.minDelay * 1000;

      timeout = setTimeout(() => {
        const contactIndex = currentCampaign.sent;
        const contact = contacts[contactIndex];
        
        if (contact) {
          const personalizedMessage = messageText.replace('{name}', contact.name);
          
          // Real sending
          if (sendingChannel === 'extension') {
            window.postMessage({
              type: 'DS_SEND_MESSAGE',
              phone: contact.phone,
              text: personalizedMessage,
              messageId: Math.random().toString(36).substr(2, 9)
            }, '*');
          } else {
            socket?.emit('relay_to_desktop', {
              action: 'sendMessage',
              phone: contact.phone,
              text: personalizedMessage
            });
          }

          onMessageSent({
            contactName: contact.name,
            phone: contact.phone,
            content: personalizedMessage,
            status: 'sent'
          });

          setLogs(prev => [`[${new Date().toLocaleTimeString()}] SENT: ${contact.name} (${contact.phone})`, ...prev].slice(0, 50));

          const updatedCampaign = {
            ...currentCampaign,
            sent: currentCampaign.sent + 1,
            status: (currentCampaign.sent + 1 === currentCampaign.total) ? 'completed' : 'running' as any
          };

          setCurrentCampaign(updatedCampaign);
          setCampaigns(prev => prev.map(c => c.id === updatedCampaign.id ? updatedCampaign : c));
          setProgress(Math.round(((currentCampaign.sent + 1) / currentCampaign.total) * 100));

          if (updatedCampaign.status === 'completed') {
            setIsSending(false);
          }
        }
      }, delay);
    }

    return () => clearTimeout(timeout);
  }, [isSending, currentCampaign, contacts, messageText, antiBanSettings, onMessageSent]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold uppercase tracking-tight font-mono">
            Bulk <span className="text-[#00ff9d]">Sender</span>
          </h2>
          <p className="text-xs text-[#8e9299] font-mono">ENGINE v4.0.2 • HIGH PRIORITY QUEUE</p>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={startNewCampaign}
            disabled={isSending || contacts.length === 0}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#00ff9d] text-[#0a0a0c] text-xs font-bold uppercase tracking-wider hover:shadow-[0_0_20px_rgba(0,255,157,0.4)] transition-all disabled:opacity-50"
          >
            <Plus className="w-4 h-4" /> New Campaign ({contacts.length} Contacts)
          </button>
          <button 
            onClick={() => window.location.hash = 'antiban'}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#151619] border border-[#2d2e33] text-[#8e9299] text-xs font-bold uppercase tracking-wider hover:border-[#00ff9d]/50 hover:text-white transition-all"
          >
            <Smartphone className="w-4 h-4" /> Get Extension
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Campaign Configuration */}
        <div className="p-6 rounded-xl bg-[#151619] border border-[#2d2e33] space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-[#2d2e33]">
            <MessageSquare className="w-4 h-4 text-[#00ff9d]" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#8e9299]">Compose Message</h2>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] uppercase font-bold text-[#8e9299] tracking-widest">Message Body</label>
                <button 
                  onClick={rephraseMessage}
                  disabled={isRephrasing || !messageText}
                  className="text-[10px] font-bold text-[#00ff9d] uppercase tracking-widest flex items-center gap-1 hover:underline disabled:opacity-50 transition-all"
                >
                  {isRephrasing ? 'Rephrasing...' : '✨ Rephrase with AI'}
                </button>
              </div>
              <textarea 
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Use {name} for personalization..."
                className="w-full h-32 bg-[#0a0a0c] border border-[#2d2e33] rounded-xl p-4 text-xs font-mono text-white outline-none focus:border-[#00ff9d] transition-all resize-none"
              />
              <div className="flex justify-between text-[8px] font-mono text-[#4a4a4a] uppercase tracking-widest">
                <span>Variables: {"{name}"}</span>
                <span>{messageText.length} Characters</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#0a0a0c] border border-[#2d2e33] space-y-3">
              <div className="text-[10px] uppercase font-bold text-[#8e9299] tracking-widest flex items-center gap-2">
                <Smartphone className="w-3 h-3 text-[#00ff9d]" /> Sending Channel
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setSendingChannel('extension')}
                  className={cn(
                    "py-2 rounded border text-[8px] font-bold uppercase tracking-widest transition-all",
                    sendingChannel === 'extension' ? "bg-[#00ff9d]/10 border-[#00ff9d] text-[#00ff9d]" : "bg-[#151619] border-[#2d2e33] text-[#4a4a4a] hover:border-[#8e9299]"
                  )}
                >
                  Browser Ext
                </button>
                <button 
                  onClick={() => setSendingChannel('native')}
                  className={cn(
                    "py-2 rounded border text-[8px] font-bold uppercase tracking-widest transition-all",
                    sendingChannel === 'native' ? "bg-yellow-500/10 border-yellow-500 text-yellow-500" : "bg-[#151619] border-[#2d2e33] text-[#4a4a4a] hover:border-[#8e9299]"
                  )}
                >
                  Native Bridge
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#0a0a0c] border border-[#2d2e33] space-y-3">
              <div className="text-[10px] uppercase font-bold text-[#8e9299] tracking-widest flex items-center gap-2">
                <Zap className="w-3 h-3 text-[#00ff9d]" /> Protocol Settings
              </div>
              
              {[
                { id: 'spintax', label: 'Spintax Randomization' },
                { id: 'randomDelay', label: 'Dynamic Delay' },
                { id: 'warmUp', label: 'Account Warm-up' },
              ].map((opt) => (
                <label key={opt.id} className="flex items-center justify-between cursor-pointer group">
                  <span className="text-[10px] text-[#8e9299] group-hover:text-white transition-colors">{opt.label}</span>
                  <input 
                    type="checkbox" 
                    checked={antiBanSettings[opt.id as keyof typeof antiBanSettings] as boolean}
                    onChange={(e) => setAntiBanSettings(s => ({ ...s, [opt.id]: e.target.checked }))}
                    className="w-3 h-3 rounded border-[#2d2e33] bg-[#151619] text-[#00ff9d] focus:ring-[#00ff9d]"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Active Campaign Stats */}
        <div className="lg:col-span-2 p-6 rounded-xl bg-[#151619] border border-[#2d2e33] space-y-6">
          {currentCampaign ? (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#00ff9d]/10 border border-[#00ff9d]/20">
                    <Send className="w-5 h-5 text-[#00ff9d]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">{currentCampaign.name}</h3>
                    <p className="text-[10px] text-[#8e9299] font-mono uppercase">Status: <span className={cn(
                      currentCampaign.status === 'running' ? "text-[#00ff9d]" : "text-blue-500"
                    )}>{currentCampaign.status}</span></p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsSending(!isSending)}
                    disabled={currentCampaign.status === 'completed'}
                    className="p-2 rounded-lg bg-[#0a0a0c] border border-[#2d2e33] hover:border-[#00ff9d]/30 transition-all disabled:opacity-30"
                  >
                    {isSending ? <Pause className="w-4 h-4 text-yellow-500" /> : <Play className="w-4 h-4 text-[#00ff9d]" />}
                  </button>
                  <button 
                    onClick={() => {
                      setIsSending(false);
                      setCurrentCampaign(null);
                      setProgress(0);
                    }}
                    className="p-2 rounded-lg bg-[#0a0a0c] border border-[#2d2e33] hover:border-red-500/30 transition-all"
                  >
                    <RotateCcw className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <div className="text-[10px] uppercase font-bold text-[#8e9299]">Transmission Progress</div>
                  <div className="text-xs font-mono text-[#00ff9d]">{progress}%</div>
                </div>
                <div className="h-2 w-full bg-[#0a0a0c] rounded-full overflow-hidden border border-[#2d2e33]">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-gradient-to-r from-[#00ff9d]/50 to-[#00ff9d] shadow-[0_0_10px_rgba(0,255,157,0.3)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-[#0a0a0c] border border-[#2d2e33] space-y-1">
                  <div className="text-[10px] uppercase font-bold text-[#8e9299] flex items-center gap-1.5">
                    <Users className="w-3 h-3" /> Total
                  </div>
                  <div className="text-lg font-mono font-bold">{currentCampaign.total}</div>
                </div>
                <div className="p-4 rounded-lg bg-[#0a0a0c] border border-[#2d2e33] space-y-1">
                  <div className="text-[10px] uppercase font-bold text-[#8e9299] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-[#00ff9d]" /> Sent
                  </div>
                  <div className="text-lg font-mono font-bold text-[#00ff9d]">{currentCampaign.sent}</div>
                </div>
                <div className="p-4 rounded-lg bg-[#0a0a0c] border border-[#2d2e33] space-y-1">
                  <div className="text-[10px] uppercase font-bold text-[#8e9299] flex items-center gap-1.5">
                    <AlertTriangle className="w-3 h-3 text-red-500" /> Failed
                  </div>
                  <div className="text-lg font-mono font-bold text-red-500">{currentCampaign.failed}</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0a0a0c] border border-[#2d2e33] font-mono">
                <div className="flex items-center gap-2 mb-3">
                  <Terminal className="w-3 h-3 text-[#00ff9d]" />
                  <span className="text-[10px] uppercase font-bold text-white">Live Transmission Log</span>
                </div>
                <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
                  {logs.map((log, i) => (
                    <div key={i} className="text-[9px] text-[#8e9299] font-mono">
                      {">"} {log}
                    </div>
                  ))}
                  {isSending && (
                    <div className="text-[9px] text-[#00ff9d] animate-pulse">
                      {">"} TRANSMITTING PACKET TO {contacts[currentCampaign.sent]?.phone}...
                    </div>
                  )}
                  <div className="text-[9px] text-[#4a4a4a]">
                    {">"} System initialized. Waiting for next queue...
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-[#4a4a4a] space-y-4 py-12">
              <div className="p-4 rounded-full bg-[#0a0a0c] border border-[#2d2e33]">
                <Zap className="w-8 h-8 opacity-20" />
              </div>
              <div className="text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-[#8e9299]">No Active Campaign</p>
                <p className="text-[10px] font-mono mt-1">Configure a message and click "New Campaign" to start.</p>
              </div>
            </div>
          )}
        </div>

        {/* Campaign History */}
        <div className="lg:col-span-3 p-6 rounded-xl bg-[#151619] border border-[#2d2e33] space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-[#2d2e33]">
            <RotateCcw className="w-4 h-4 text-[#8e9299]" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#8e9299]">Campaign History</h2>
            <button 
              onClick={clearCampaignHistory}
              className="ml-auto text-[8px] font-bold uppercase tracking-widest text-red-500/50 hover:text-red-500 transition-colors"
            >
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {campaigns.length > 0 ? campaigns.map(campaign => (
              <div key={campaign.id} className="p-4 rounded-lg bg-[#0a0a0c] border border-[#2d2e33] hover:border-[#00ff9d]/20 transition-all cursor-pointer group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white group-hover:text-[#00ff9d] transition-colors truncate max-w-[150px]">{campaign.name}</span>
                  <span className={cn(
                    "text-[8px] uppercase font-bold px-1.5 py-0.5 rounded",
                    campaign.status === 'running' ? "bg-[#00ff9d]/10 text-[#00ff9d]" :
                    campaign.status === 'completed' ? "bg-blue-500/10 text-blue-500" :
                    "bg-[#2d2e33] text-[#8e9299]"
                  )}>
                    {campaign.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-[#8e9299] font-mono">
                  <span>{campaign.sent} / {campaign.total} SENT</span>
                  <span>{campaign.startTime.split(',')[0]}</span>
                </div>
              </div>
            )) : (
              <div className="col-span-full text-center py-8 text-[10px] font-mono text-[#4a4a4a] uppercase tracking-widest">
                No campaign history found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
