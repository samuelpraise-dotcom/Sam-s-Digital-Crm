import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Settings as SettingsIcon, 
  Shield, 
  Bell, 
  User, 
  Database, 
  Globe, 
  Lock, 
  Zap,
  Save,
  RefreshCw,
  Smartphone,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Settings() {
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'notifications' | 'api'>('general');
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 3000);
    }, 800);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'api', label: 'API & Integration', icon: Zap },
    { id: 'extension', label: 'Chrome Extension', icon: Smartphone },
    { id: 'hosting', label: 'Publish & Hosting', icon: Globe },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold uppercase tracking-tight font-mono">
            System <span className="text-[#00ff9d]">Settings</span>
          </h2>
          <p className="text-xs text-[#8e9299] font-mono">CONFIGURATION v4.2.0 • GLOBAL PARAMETERS</p>
        </div>

        <div className="flex items-center gap-3">
          {showSaved && (
            <motion.span 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-[10px] font-bold text-[#00ff9d] uppercase tracking-widest"
            >
              Changes Saved Successfully
            </motion.span>
          )}
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#00ff9d] text-[#0a0a0c] text-xs font-bold uppercase tracking-wider hover:shadow-[0_0_20px_rgba(0,255,157,0.4)] transition-all disabled:opacity-50"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="w-full lg:w-64 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "w-full flex items-center gap-3 p-4 rounded-xl transition-all border",
                activeTab === tab.id 
                  ? "bg-[#00ff9d]/10 text-[#00ff9d] border-[#00ff9d]/20" 
                  : "bg-[#151619] text-[#8e9299] border-[#2d2e33] hover:border-[#00ff9d]/30 hover:text-white"
              )}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-widest">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8 rounded-2xl bg-[#151619] border border-[#2d2e33] space-y-8">
          {activeTab === 'general' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <section className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-[#00ff9d]" /> Profile Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-[#8e9299] tracking-wider">Display Name</label>
                    <input 
                      type="text" 
                      defaultValue="Digital Sam Admin"
                      className="w-full px-4 py-2.5 rounded-lg bg-[#0a0a0c] border border-[#2d2e33] focus:border-[#00ff9d] outline-none text-sm font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-[#8e9299] tracking-wider">Email Address</label>
                    <input 
                      type="email" 
                      defaultValue="admin@digitalsam.ai"
                      className="w-full px-4 py-2.5 rounded-lg bg-[#0a0a0c] border border-[#2d2e33] focus:border-[#00ff9d] outline-none text-sm font-mono"
                    />
                  </div>
                </div>
              </section>

              <div className="h-px bg-[#2d2e33]" />

              <section className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#00ff9d]" /> Localization
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-[#8e9299] tracking-wider">Timezone</label>
                    <select className="w-full px-4 py-2.5 rounded-lg bg-[#0a0a0c] border border-[#2d2e33] focus:border-[#00ff9d] outline-none text-sm font-mono appearance-none">
                      <option>UTC (Coordinated Universal Time)</option>
                      <option>EST (Eastern Standard Time)</option>
                      <option>PST (Pacific Standard Time)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-[#8e9299] tracking-wider">Language</label>
                    <select className="w-full px-4 py-2.5 rounded-lg bg-[#0a0a0c] border border-[#2d2e33] focus:border-[#00ff9d] outline-none text-sm font-mono appearance-none">
                      <option>English (US)</option>
                      <option>Spanish</option>
                      <option>French</option>
                    </select>
                  </div>
                </div>
              </section>
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <section className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#00ff9d]" /> Authentication
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-[#0a0a0c] border border-[#2d2e33]">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5 text-[#8e9299]" />
                      <div>
                        <div className="text-xs font-bold text-white uppercase tracking-wider">Two-Factor Authentication</div>
                        <div className="text-[10px] text-[#8e9299] font-mono">Secure your account with a secondary device.</div>
                      </div>
                    </div>
                    <div className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-[#2d2e33] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00ff9d]"></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-[#0a0a0c] border border-[#2d2e33]">
                    <div className="flex items-center gap-3">
                      <RefreshCw className="w-5 h-5 text-[#8e9299]" />
                      <div>
                        <div className="text-xs font-bold text-white uppercase tracking-wider">Auto-Logout Session</div>
                        <div className="text-[10px] text-[#8e9299] font-mono">Automatically log out after 30 minutes of inactivity.</div>
                      </div>
                    </div>
                    <div className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-[#2d2e33] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00ff9d]"></div>
                    </div>
                  </div>
                </div>
              </section>
            </motion.div>
          )}

          {activeTab === 'notifications' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <section className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-white flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#00ff9d]" /> Alert Preferences
                </h3>
                <div className="space-y-4">
                  {[
                    { label: 'Campaign Completion', desc: 'Notify when a bulk send finishes.' },
                    { label: 'Security Alerts', desc: 'Notify on suspicious login attempts.' },
                    { label: 'System Updates', desc: 'Notify about new features and maintenance.' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-[#0a0a0c] border border-[#2d2e33]">
                      <div>
                        <div className="text-xs font-bold text-white uppercase tracking-wider">{item.label}</div>
                        <div className="text-[10px] text-[#8e9299] font-mono">{item.desc}</div>
                      </div>
                      <div className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked={i < 2} />
                        <div className="w-11 h-6 bg-[#2d2e33] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00ff9d]"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </motion.div>
          )}

          {activeTab === 'api' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <section className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#00ff9d]" /> API Configuration
                </h3>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-[#8e9299] tracking-wider">Primary API Key</label>
                    <div className="flex gap-2">
                      <input 
                        type="password" 
                        readOnly
                        value="sk_live_51Mz9X8L2k9J1P0Q7R4S5T6U7V8W9X0"
                        className="flex-1 px-4 py-2.5 rounded-lg bg-[#0a0a0c] border border-[#2d2e33] text-sm font-mono text-[#00ff9d]"
                      />
                      <button className="px-4 py-2.5 rounded-lg bg-[#151619] border border-[#2d2e33] text-[10px] font-bold uppercase tracking-widest hover:border-[#00ff9d]/50">
                        Reveal
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-[#00ff9d]/5 border border-[#00ff9d]/20 flex items-start gap-3">
                    <MessageSquare className="w-5 h-5 text-[#00ff9d] mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-[#00ff9d] uppercase tracking-wider">Webhook Integration</div>
                      <div className="text-[10px] text-[#8e9299] font-mono leading-relaxed mt-1">
                        Configure webhooks to receive real-time updates on message delivery status and contact interactions directly in your external systems.
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </motion.div>
          )}
          {activeTab === 'extension' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-white flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-[#00ff9d]" /> Browser Extension
                  </h3>
                  <div className="px-2 py-0.5 rounded bg-[#00ff9d]/10 text-[#00ff9d] text-[8px] font-mono">v1.0.5 READY</div>
                </div>

                <div className="p-6 rounded-xl bg-[#0a0a0c] border border-[#2d2e33] space-y-4">
                  <p className="text-xs text-[#8e9299] font-mono leading-relaxed">
                    Download the Digital Sam Anti-Ban extension to bring advanced message encryption and restriction bypass directly to your browser. Compatible with WhatsApp Web and other CRM messengers.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { label: 'Invisible Fingerprinting', status: 'Included' },
                      { label: 'Unicode Substitution', status: 'Included' },
                      { label: 'Spintax Support', status: 'Included' },
                    ].map((feat, i) => (
                      <div key={i} className="p-3 rounded-lg bg-[#151619] border border-[#2d2e33] text-center">
                        <div className="text-[8px] text-[#8e9299] uppercase mb-1">{feat.label}</div>
                        <div className="text-[10px] font-bold text-[#00ff9d]">{feat.status}</div>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => {
                      // Redirect to Anti-Ban tool where the generator is
                      window.location.hash = 'antiban';
                    }}
                    className="w-full py-3 rounded-lg bg-[#00ff9d] text-[#0a0a0c] text-xs font-bold uppercase tracking-widest hover:shadow-[0_0_20px_rgba(0,255,157,0.4)] transition-all"
                  >
                    Go to Anti-Ban Tool to Download
                  </button>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#8e9299]">Installation Guide</h4>
                  <div className="space-y-3">
                    {[
                      'Download the .zip package from the Anti-Ban Tool.',
                      'Extract the folder to a secure location on your machine.',
                      'Open Chrome and navigate to chrome://extensions',
                      'Enable "Developer Mode" in the top right corner.',
                      'Click "Load unpacked" and select the extracted folder.',
                    ].map((step, i) => (
                      <div key={i} className="flex gap-3 items-start">
                        <div className="w-5 h-5 rounded-full bg-[#2d2e33] flex items-center justify-center text-[10px] font-bold text-[#00ff9d] shrink-0">{i + 1}</div>
                        <p className="text-[10px] text-[#8e9299] font-mono mt-1">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </motion.div>
          )}

          {activeTab === 'hosting' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-white flex items-center gap-2">
                    <Globe className="w-4 h-4 text-[#00ff9d]" /> Publish & Local Hosting
                  </h3>
                  <div className="px-2 py-0.5 rounded bg-[#00ff9d]/10 text-[#00ff9d] text-[8px] font-mono">v4.2.0 SERVER READY</div>
                </div>

                <div className="p-6 rounded-xl bg-[#0a0a0c] border border-[#2d2e33] space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-[#00ff9d]/10 border border-[#00ff9d]/20">
                      <Database className="w-6 h-6 text-[#00ff9d]" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-white uppercase tracking-wider">Local Server Deployment</div>
                      <p className="text-[10px] text-[#8e9299] font-mono leading-relaxed">
                        Host this entire CRM system on your own local machine or a private server. This ensures maximum privacy and control over your contact data and messaging logs.
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="p-4 rounded-xl bg-[#151619] border border-[#2d2e33] space-y-3">
                      <div className="text-[10px] font-bold text-white uppercase tracking-widest">Step 1: Export Source</div>
                      <p className="text-[9px] text-[#8e9299] font-mono">Download the full server source code from the Settings menu (Export to ZIP).</p>
                    </div>
                    <div className="p-4 rounded-xl bg-[#151619] border border-[#2d2e33] space-y-3">
                      <div className="text-[10px] font-bold text-white uppercase tracking-widest">Step 2: Install Node.js</div>
                      <p className="text-[9px] text-[#8e9299] font-mono">Ensure you have Node.js v18+ installed on your local machine.</p>
                    </div>
                    <div className="p-4 rounded-xl bg-[#151619] border border-[#2d2e33] space-y-3">
                      <div className="text-[10px] font-bold text-white uppercase tracking-widest">Step 3: Run Install</div>
                      <p className="text-[9px] text-[#8e9299] font-mono">Open terminal in the project folder and run 'npm install' to fetch dependencies.</p>
                    </div>
                    <div className="p-4 rounded-xl bg-[#151619] border border-[#2d2e33] space-y-3">
                      <div className="text-[10px] font-bold text-white uppercase tracking-widest">Step 4: Launch Server</div>
                      <p className="text-[9px] text-[#8e9299] font-mono">Run 'npm start' to launch the production server on http://localhost:3000.</p>
                    </div>
                  </div>

                  <div className="mt-6 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                    <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Zap className="w-3 h-3" /> Multi-Laptop Setup
                    </div>
                    <p className="text-[9px] text-[#8e9299] font-mono leading-relaxed mb-3">
                      To connect multiple laptops to one central dashboard:
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2 text-[9px] text-[#8e9299] font-mono">
                        <div className="w-1 h-1 rounded-full bg-blue-400 mt-1" />
                        <span>Find the <b>Local IP</b> of your server laptop (e.g., 192.168.1.5).</span>
                      </li>
                      <li className="flex items-start gap-2 text-[9px] text-[#8e9299] font-mono">
                        <div className="w-1 h-1 rounded-full bg-blue-400 mt-1" />
                        <span>Access the dashboard from other laptops using <b>http://[IP-ADDRESS]:3000</b>.</span>
                      </li>
                      <li className="flex items-start gap-2 text-[9px] text-[#8e9299] font-mono">
                        <div className="w-1 h-1 rounded-full bg-blue-400 mt-1" />
                        <span>Download the extension <b>from that IP address</b> so it knows where to sync.</span>
                      </li>
                    </ul>
                  </div>

                  <div className="mt-6 p-4 rounded-xl bg-[#00ff9d]/5 border border-[#00ff9d]/20">
                    <div className="text-[10px] font-bold text-[#00ff9d] uppercase tracking-widest mb-2">Why Host Locally?</div>
                    <ul className="space-y-2">
                      {[
                        'Zero data leakage to third-party cloud providers.',
                        'Faster response times for real-time contact syncing.',
                        'Customizable server-side logic and database integrations.',
                        'Bypass corporate firewall restrictions on cloud apps.'
                      ].map((benefit, i) => (
                        <li key={i} className="flex items-center gap-2 text-[9px] text-[#8e9299] font-mono">
                          <div className="w-1 h-1 rounded-full bg-[#00ff9d]" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
