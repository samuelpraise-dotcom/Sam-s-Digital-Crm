import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Users, 
  Send, 
  Settings as SettingsIcon, 
  LayoutDashboard, 
  LogOut, 
  Menu, 
  X,
  Bell,
  Search,
  Cpu,
  Zap,
  Clock,
  BarChart3,
  FileText,
  TrendingUp,
  Activity,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { io, Socket } from 'socket.io-client';
import AntiBanTool from './components/AntiBanTool';
import ContactManager from './components/ContactManager';
import BulkSender from './components/BulkSender';
import MessageTemplates from './components/MessageTemplates';
import Settings from './components/Settings';
import AdminControlCenter from './components/AdminControlCenter';
import Login from './components/Login';
import { cn } from '@/lib/utils';

export interface Contact {
  id: string;
  name: string;
  phone: string;
  status: 'active' | 'inactive' | 'pending';
  lastSeen: string;
  tags: string[];
}

export interface MessageLog {
  id: string;
  contactName: string;
  phone: string;
  content: string;
  timestamp: string;
  status: 'sent' | 'failed';
}

const MOCK_CONTACTS: Contact[] = [
  { id: '1', name: 'John Doe', phone: '+1 234 567 8901', status: 'active', lastSeen: '2 mins ago', tags: ['VIP', 'Client'] },
  { id: '2', name: 'Jane Smith', phone: '+1 987 654 3210', status: 'pending', lastSeen: '1 hour ago', tags: ['Lead'] },
  { id: '3', name: 'Robert Johnson', phone: '+1 555 123 4567', status: 'inactive', lastSeen: '1 day ago', tags: ['Old'] },
  { id: '4', name: 'Sarah Williams', phone: '+1 444 999 8888', status: 'active', lastSeen: 'Just now', tags: ['VIP'] },
  { id: '5', name: 'Michael Brown', phone: '+1 222 333 4444', status: 'active', lastSeen: '5 mins ago', tags: ['Partner'] },
];

type View = 'dashboard' | 'antiban' | 'contacts' | 'bulk' | 'templates' | 'settings' | 'admin';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeView, setActiveView] = useState<View>('antiban');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [systemLogs, setSystemLogs] = useState<any[]>([]);
  const [systemStats, setSystemStats] = useState<any>({ cpuUsage: 0, memUsage: 0 });
  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem('ds_crm_contacts');
    return saved ? JSON.parse(saved) : MOCK_CONTACTS;
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [messageHistory, setMessageHistory] = useState<MessageLog[]>(() => {
    const saved = localStorage.getItem('ds_crm_messages');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('ds_crm_messages', JSON.stringify(messageHistory));
  }, [messageHistory]);

  const addMessageLog = (log: Omit<MessageLog, 'id' | 'timestamp'>) => {
    const newLog: MessageLog = {
      ...log,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString()
    };
    setMessageHistory(prev => [newLog, ...prev].slice(0, 100)); // Keep last 100
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    if (socket) socket.disconnect();
  };

  useEffect(() => {
    if (isAuthenticated) {
      const newSocket = io(window.location.origin);
      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('Connected to Control Center');
        newSocket.emit('identify', { type: 'admin' });
      });

      newSocket.on('sessions_update', (sessions) => {
        setActiveSessions(sessions);
      });

      newSocket.on('logs_update', (logs) => {
        setSystemLogs(logs);
      });

      newSocket.on('stats_update', (stats) => {
        setSystemStats(stats);
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [isAuthenticated]);

  const clearMessageHistory = () => {
    if (confirm('Are you sure you want to clear all message history? This will reset your analytics.')) {
      setMessageHistory([]);
      localStorage.removeItem('ds_crm_messages');
    }
  };

  useEffect(() => {
    localStorage.setItem('ds_crm_contacts', JSON.stringify(contacts));
  }, [contacts]);

  const analyticsData = useMemo(() => {
    if (messageHistory.length === 0) {
      return Array.from({ length: 7 }, (_, i) => ({
        time: `${10 + i}:00`,
        sent: Math.floor(Math.random() * 50) + 10,
        failed: Math.floor(Math.random() * 5)
      }));
    }

    const groups: Record<string, { sent: number, failed: number }> = {};
    messageHistory.forEach(msg => {
      const date = new Date(msg.timestamp);
      const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (!groups[time]) groups[time] = { sent: 0, failed: 0 };
      if (msg.status === 'sent') groups[time].sent++;
      else if (msg.status === 'failed') groups[time].failed++;
    });

    return Object.entries(groups)
      .map(([time, counts]) => ({ time, ...counts }))
      .reverse()
      .slice(0, 7);
  }, [messageHistory]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'DS_SYNC_CONTACTS') {
        console.log('Received contacts from extension:', event.data.contacts);
        const newContacts = event.data.contacts as Contact[];
        setContacts(prev => {
          const existingPhones = new Set(prev.map(c => c.phone).filter(p => p));
          const uniqueNew = newContacts.filter(c => {
            if (!c.phone) return true; // Keep if no phone, use name/id
            return !existingPhones.has(c.phone);
          });
          console.log(`Adding ${uniqueNew.length} new unique contacts`);
          return [...prev, ...uniqueNew];
        });
        setIsSyncing(true);
        setTimeout(() => setIsSyncing(false), 3000);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '') as View;
      if (['dashboard', 'antiban', 'contacts', 'bulk', 'templates', 'settings'].includes(hash)) {
        setActiveView(hash);
      }
    };
    window.addEventListener('hashchange', handleHash);
    handleHash(); // Initial check
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'antiban', label: 'Anti-Ban Tool', icon: Shield },
    { id: 'bulk', label: 'Bulk Sender', icon: Send },
    { id: 'templates', label: 'Templates', icon: FileText },
    { id: 'contacts', label: 'Contact Manager', icon: Users },
    { id: 'admin', label: 'Control Center', icon: Activity },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white font-sans selection:bg-[#00ff9d]/30 selection:text-[#00ff9d]">
      {/* Background Grid */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#2d2e33_1px,transparent_1px),linear-gradient(to_bottom,#2d2e33_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed top-0 left-0 z-50 h-full bg-[#151619] border-r border-[#2d2e33] transition-all duration-300 ease-in-out",
          isSidebarOpen ? "w-64 translate-x-0" : "w-20 -translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 flex items-center gap-3 border-b border-[#2d2e33]">
            <div className="p-2 rounded-lg bg-[#00ff9d] text-[#0a0a0c]">
              <Cpu className="w-5 h-5" />
            </div>
            {isSidebarOpen && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="font-mono font-bold text-lg tracking-tighter"
              >
                DIGITAL<span className="text-[#00ff9d]">SAM</span>
              </motion.div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as View)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl transition-all group relative",
                  activeView === item.id 
                    ? "bg-[#00ff9d]/10 text-[#00ff9d] border border-[#00ff9d]/20" 
                    : "text-[#8e9299] hover:bg-[#2d2e33] hover:text-white border border-transparent"
                )}
              >
                <item.icon className={cn("w-5 h-5", activeView === item.id ? "text-[#00ff9d]" : "group-hover:text-white")} />
                {isSidebarOpen && (
                  <span className="text-xs font-bold uppercase tracking-widest">{item.label}</span>
                )}
                {activeView === item.id && (
                  <motion.div 
                    layoutId="active-pill"
                    className="absolute left-0 w-1 h-6 bg-[#00ff9d] rounded-r-full"
                  />
                )}
              </button>
            ))}
          </nav>

          {/* User Profile / Logout */}
          <div className="p-4 border-t border-[#2d2e33]">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 p-3 rounded-xl text-[#8e9299] hover:bg-red-500/10 hover:text-red-500 transition-all group"
            >
              <LogOut className="w-5 h-5 group-hover:text-red-500" />
              {isSidebarOpen && (
                <span className="text-xs font-bold uppercase tracking-widest">Logout</span>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main 
        className={cn(
          "transition-all duration-300 ease-in-out min-h-screen flex flex-col",
          isSidebarOpen ? "lg:pl-64" : "lg:pl-20"
        )}
      >
        {/* Top Header */}
        <header className="h-20 border-b border-[#2d2e33] bg-[#0a0a0c]/80 backdrop-blur-md sticky top-0 z-40 px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg bg-[#151619] border border-[#2d2e33] hover:border-[#00ff9d]/50 transition-all"
            >
              {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
            <div className="h-6 w-px bg-[#2d2e33]" />
            <div className="text-xs font-mono text-[#8e9299] uppercase tracking-widest">
              System Status: <span className="text-[#00ff9d] font-bold">Optimal</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8e9299]" />
              <input 
                type="text" 
                placeholder="Global search..."
                className="pl-10 pr-4 py-2 rounded-lg bg-[#151619] border border-[#2d2e33] focus:border-[#00ff9d] outline-none text-xs font-mono w-64"
              />
            </div>
            <button className="p-2 rounded-lg bg-[#151619] border border-[#2d2e33] relative">
              <Bell className="w-4 h-4 text-[#8e9299]" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#00ff9d] rounded-full border border-[#151619]" />
            </button>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00ff9d] to-[#00ff9d]/50 flex items-center justify-center text-[#0a0a0c] font-bold text-xs">
              SP
            </div>
          </div>
        </header>

        {/* View Content */}
        <div className="flex-1 p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeView === 'antiban' && <AntiBanTool />}
              {activeView === 'contacts' && <ContactManager contacts={contacts} setContacts={setContacts} isSyncing={isSyncing} />}
              {activeView === 'bulk' && <BulkSender contacts={contacts} onMessageSent={addMessageLog} />}
              {activeView === 'templates' && <MessageTemplates />}
              {activeView === 'settings' && <Settings />}
              {activeView === 'admin' && (
                <AdminControlCenter 
                  sessions={activeSessions} 
                  logs={systemLogs} 
                  stats={systemStats} 
                />
              )}
              {activeView === 'dashboard' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <LayoutDashboard className="w-4 h-4 text-[#00ff9d]" />
                      <h2 className="text-xs font-bold uppercase tracking-widest text-[#8e9299]">System Overview</h2>
                    </div>
                    <button 
                      onClick={clearMessageHistory}
                      className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-[#151619] border border-[#2d2e33] text-[#8e9299] text-[10px] font-bold uppercase tracking-wider hover:border-red-500/50 hover:text-red-500 transition-all"
                    >
                      <X className="w-3 h-3" /> Clear History
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { label: 'Total Messages', value: messageHistory.length.toLocaleString(), trend: '+12%', icon: Send },
                      { label: 'Active Campaigns', value: '1', trend: 'Stable', icon: Zap },
                      { label: 'Total Contacts', value: contacts.length.toLocaleString(), trend: '+5%', icon: Users },
                      { label: 'Security Score', value: '98%', trend: 'Optimal', icon: Shield },
                    ].map((stat, i) => (
                      <div key={i} className="p-6 rounded-xl bg-[#151619] border border-[#2d2e33] space-y-2 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-[#00ff9d]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        <div className="flex items-center justify-between">
                          <stat.icon className="w-5 h-5 text-[#00ff9d]" />
                          <span className="text-[10px] font-mono text-[#00ff9d]">{stat.trend}</span>
                        </div>
                        <div className="text-2xl font-bold font-mono tracking-tight">{stat.value}</div>
                        <div className="text-[10px] uppercase font-bold tracking-widest text-[#8e9299]">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-6 rounded-xl bg-[#151619] border border-[#2d2e33]">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-[#00ff9d]" />
                        <h2 className="text-xs font-bold uppercase tracking-widest text-[#8e9299]">Transmission Analytics</h2>
                      </div>
                      <div className="flex items-center gap-2">
                        {['24H', '7D', '30D'].map((range) => (
                          <button 
                            key={range}
                            className={cn(
                              "px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest transition-all",
                              range === '24H' ? "bg-[#00ff9d] text-[#0a0a0c]" : "bg-[#0a0a0c] border border-[#2d2e33] text-[#8e9299] hover:border-[#00ff9d]/30"
                            )}
                          >
                            {range}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="h-[240px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={analyticsData}>
                          <defs>
                            <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#00ff9d" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#00ff9d" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#2d2e33" vertical={false} />
                          <XAxis 
                            dataKey="time" 
                            stroke="#4a4a4a" 
                            fontSize={10} 
                            tickLine={false} 
                            axisLine={false}
                            tick={{ fill: '#8e9299', fontFamily: 'monospace' }}
                          />
                          <YAxis 
                            stroke="#4a4a4a" 
                            fontSize={10} 
                            tickLine={false} 
                            axisLine={false}
                            tick={{ fill: '#8e9299', fontFamily: 'monospace' }}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#151619', 
                              border: '1px solid #2d2e33',
                              borderRadius: '8px',
                              fontSize: '10px',
                              fontFamily: 'monospace'
                            }}
                            itemStyle={{ color: '#00ff9d' }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="sent" 
                            stroke="#00ff9d" 
                            fillOpacity={1} 
                            fill="url(#colorSent)" 
                            strokeWidth={2}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="failed" 
                            stroke="#ef4444" 
                            fillOpacity={0} 
                            strokeWidth={1}
                            strokeDasharray="5 5"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 p-6 rounded-xl bg-[#151619] border border-[#2d2e33]">
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-[#00ff9d]" />
                          <h2 className="text-xs font-bold uppercase tracking-widest text-[#8e9299]">Recent Activity</h2>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-[#00ff9d]" />
                          <span className="text-[8px] font-mono text-[#8e9299] uppercase tracking-widest">Live Updates</span>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        {messageHistory.length > 0 ? (
                          messageHistory.slice(0, 5).map((msg) => (
                            <div key={msg.id} className="flex items-center justify-between p-4 rounded-xl bg-[#0a0a0c] border border-[#2d2e33] group hover:border-[#00ff9d]/30 transition-all">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-[#151619] border border-[#2d2e33] flex items-center justify-center text-[#00ff9d] font-bold text-xs">
                                  {msg.contactName.charAt(0)}
                                </div>
                                <div>
                                  <div className="text-xs font-bold text-white">{msg.contactName}</div>
                                  <div className="text-[10px] text-[#8e9299] font-mono">{msg.phone}</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-[10px] text-[#00ff9d] font-mono uppercase tracking-widest">Sent</div>
                                <div className="text-[8px] text-[#4a4a4a] font-mono">{new Date(msg.timestamp).toLocaleTimeString()}</div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="h-48 flex flex-col items-center justify-center text-[#4a4a4a] space-y-2">
                            <Send className="w-8 h-8 opacity-20" />
                            <span className="text-[10px] uppercase tracking-[0.2em]">No recent messages</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-6 rounded-xl bg-[#151619] border border-[#2d2e33] h-80 flex flex-col">
                      <div className="flex items-center gap-2 mb-6">
                        <Shield className="w-4 h-4 text-[#00ff9d]" />
                        <h2 className="text-xs font-bold uppercase tracking-widest text-[#8e9299]">Security Health</h2>
                      </div>
                      
                      <div className="space-y-4 flex-1">
                        {[
                          { label: 'Anti-Ban Engine', status: 'Active', color: 'text-[#00ff9d]' },
                          { label: 'IP Rotation', status: 'Enabled', color: 'text-[#00ff9d]' },
                          { label: 'UA Spoofing', status: 'Active', color: 'text-[#00ff9d]' },
                          { label: 'Restriction Risk', status: 'Low', color: 'text-blue-400' },
                        ].map((item, i) => (
                          <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[#0a0a0c] border border-[#2d2e33]">
                            <span className="text-[10px] font-bold text-white uppercase tracking-wider">{item.label}</span>
                            <span className={cn("text-[10px] font-mono", item.color)}>{item.status}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 p-3 rounded-lg bg-[#00ff9d]/5 border border-[#00ff9d]/20 text-center">
                        <div className="text-[8px] text-[#00ff9d] font-mono uppercase tracking-widest mb-1">System Integrity</div>
                        <div className="text-xs font-bold font-mono text-white">99.98% SECURE</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-xl bg-[#151619] border border-[#2d2e33]">
                    <div className="flex items-center gap-2 mb-6">
                      <Clock className="w-4 h-4 text-[#8e9299]" />
                      <h2 className="text-xs font-bold uppercase tracking-widest text-[#8e9299]">Recent Security Events</h2>
                    </div>
                    <div className="space-y-3">
                      {[
                        { event: 'IP Rotation Successful', time: '2m ago', type: 'success' },
                        { event: 'Detection Pattern Blocked', time: '15m ago', type: 'security' },
                        { event: 'New Proxy Pool Synchronized', time: '1h ago', type: 'system' },
                      ].map((log, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[#0a0a0c] border border-[#2d2e33] group hover:border-[#00ff9d]/30 transition-all">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              log.type === 'success' ? "bg-[#00ff9d]" : log.type === 'security' ? "bg-red-500" : "bg-blue-500"
                            )} />
                            <span className="text-[10px] text-white font-mono">{log.event}</span>
                          </div>
                          <span className="text-[10px] text-[#8e9299] font-mono">{log.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <footer className="p-8 border-t border-[#2d2e33] flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] font-mono text-[#8e9299] uppercase tracking-widest">
          <div>© 2026 DIGITAL SAM CRM MESSENGER • ALL RIGHTS RESERVED</div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Protocol</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Security Status</a>
          </div>
        </footer>
      </main>
    </div>
  );
}

// Missing icon from previous imports
// import { BarChart3 } from 'lucide-react';
