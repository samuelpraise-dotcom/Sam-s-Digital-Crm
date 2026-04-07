import React from 'react';
import { motion } from 'motion/react';
import { 
  Activity, 
  Users, 
  Smartphone, 
  Globe, 
  Shield, 
  Clock, 
  Zap,
  CheckCircle2,
  AlertCircle,
  Terminal,
  Cpu
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminControlCenterProps {
  sessions: any[];
  logs: any[];
  stats: any;
}

export default function AdminControlCenter({ sessions, logs, stats }: AdminControlCenterProps) {
  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold uppercase tracking-tight font-mono">
            Control <span className="text-[#00ff9d]">Center</span>
          </h2>
          <p className="text-xs text-[#8e9299] font-mono">ADMINISTRATIVE OVERRIDE • LIVE SESSION MONITORING</p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#151619] border border-[#2d2e33] text-[#00ff9d] text-[10px] font-bold uppercase tracking-wider">
          <Activity className="w-3 h-3 animate-pulse" /> {sessions.length} Active Nodes
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Global Stats */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Active Sessions', value: sessions.length, icon: Users, color: 'text-[#00ff9d]' },
            { label: 'System Integrity', value: '99.9%', icon: Shield, color: 'text-blue-400' },
            { label: 'CPU Load', value: `${stats.cpuUsage}%`, icon: Zap, color: 'text-yellow-400' },
            { label: 'Global Uptime', value: formatUptime(stats.uptime || 0), icon: Globe, color: 'text-[#00ff9d]' },
          ].map((stat, i) => (
            <div key={i} className="p-4 rounded-xl bg-[#151619] border border-[#2d2e33] flex items-center gap-4">
              <div className={cn("p-2 rounded-lg bg-[#0a0a0c] border border-[#2d2e33]", stat.color)}>
                <stat.icon className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-[#8e9299] tracking-wider">{stat.label}</div>
                <div className="text-lg font-mono font-bold text-white">{stat.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Active Sessions List */}
        <div className="lg:col-span-2 p-6 rounded-xl bg-[#151619] border border-[#2d2e33] space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#2d2e33]">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-[#00ff9d]" />
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#8e9299]">Live Session Nodes</h2>
            </div>
            <div className="text-[10px] font-mono text-[#4a4a4a]">REFRESH RATE: 1000ms</div>
          </div>

          <div className="space-y-3">
            {sessions.length > 0 ? sessions.map((session) => (
              <div key={session.id} className="p-4 rounded-xl bg-[#0a0a0c] border border-[#2d2e33] group hover:border-[#00ff9d]/30 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[#151619] border border-[#2d2e33] flex items-center justify-center text-[#00ff9d]">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white uppercase tracking-wider">Node: {session.id.slice(0, 8)}</div>
                      <div className="text-[10px] text-[#8e9299] font-mono">User ID: {session.userId}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#00ff9d] animate-pulse" />
                      <span className="text-[10px] text-[#00ff9d] font-mono uppercase">Online</span>
                    </div>
                    <div className="text-[8px] text-[#4a4a4a] font-mono uppercase mt-1">Last Seen: {new Date(session.lastSeen).toLocaleTimeString()}</div>
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="p-2 rounded bg-[#151619] border border-[#2d2e33] text-center">
                    <div className="text-[8px] text-[#8e9299] uppercase">Status</div>
                    <div className="text-[10px] font-bold text-white uppercase tracking-tighter">{session.status || 'Active'}</div>
                  </div>
                  <div className="p-2 rounded bg-[#151619] border border-[#2d2e33] text-center">
                    <div className="text-[8px] text-[#8e9299] uppercase">Protocol</div>
                    <div className="text-[10px] font-bold text-[#00ff9d] uppercase tracking-tighter">Encrypted</div>
                  </div>
                  <div className="p-2 rounded bg-[#151619] border border-[#2d2e33] text-center">
                    <div className="text-[8px] text-[#8e9299] uppercase">Region</div>
                    <div className="text-[10px] font-bold text-blue-400 uppercase tracking-tighter">Global</div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="py-20 flex flex-col items-center justify-center text-[#4a4a4a] space-y-4">
                <div className="p-4 rounded-full bg-[#0a0a0c] border border-[#2d2e33]">
                  <Activity className="w-8 h-8 opacity-20" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#8e9299]">No Active Nodes</p>
                  <p className="text-[10px] font-mono mt-1">Waiting for extension sessions to initialize...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* System Logs */}
        <div className="p-6 rounded-xl bg-[#151619] border border-[#2d2e33] space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-[#2d2e33]">
            <Terminal className="w-4 h-4 text-[#8e9299]" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#8e9299]">System Events</h2>
          </div>

          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {logs.length > 0 ? logs.map((log) => (
              <div key={log.id} className="flex items-start gap-3">
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full mt-1.5 shrink-0",
                  log.type === 'success' ? "bg-[#00ff9d]" : log.type === 'security' ? "bg-red-500" : "bg-blue-500"
                )} />
                <div>
                  <div className="text-[10px] text-white font-mono leading-tight">{log.event}</div>
                  <div className="text-[8px] text-[#4a4a4a] font-mono uppercase mt-0.5">{new Date(log.time).toLocaleTimeString()}</div>
                </div>
              </div>
            )) : (
              <div className="text-[10px] text-[#4a4a4a] font-mono italic">No events recorded...</div>
            )}
          </div>

          <div className="pt-4 border-t border-[#2d2e33]">
            <div className="p-4 rounded-lg bg-[#0a0a0c] border border-[#2d2e33] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[8px] font-bold text-[#8e9299] uppercase tracking-widest">CPU Usage</span>
                <span className="text-[8px] font-mono text-[#00ff9d]">{stats.cpuUsage}%</span>
              </div>
              <div className="h-1 w-full bg-[#151619] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#00ff9d] transition-all duration-500" 
                  style={{ width: `${stats.cpuUsage}%` }} 
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[8px] font-bold text-[#8e9299] uppercase tracking-widest">Memory</span>
                <span className="text-[8px] font-mono text-[#00ff9d]">{stats.memUsed}MB / {stats.memTotal}MB</span>
              </div>
              <div className="h-1 w-full bg-[#151619] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#00ff9d] transition-all duration-500" 
                  style={{ width: `${stats.memUsage}%` }} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
