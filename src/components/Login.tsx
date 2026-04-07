import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, User, Cpu, Zap, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate a bit of loading for effect
    setTimeout(() => {
      if (username === 'Admin' && password === 'Admin') {
        onLogin();
      } else {
        setError('INVALID ACCESS CREDENTIALS');
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Grid */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#2d2e33_1px,transparent_1px),linear-gradient(to_bottom,#2d2e33_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      {/* Animated Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00ff9d]/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] animate-pulse delay-700" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo Section */}
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="inline-flex p-4 rounded-2xl bg-[#00ff9d]/10 border border-[#00ff9d]/20 mb-4 shadow-[0_0_30px_rgba(0,255,157,0.1)]"
          >
            <Cpu className="w-10 h-10 text-[#00ff9d]" />
          </motion.div>
          <h1 className="text-3xl font-mono font-bold tracking-tighter text-white mb-2">
            DIGITAL<span className="text-[#00ff9d]">SAM</span> <span className="text-[#8e9299] font-light">CRM</span>
          </h1>
          <p className="text-[10px] font-mono text-[#8e9299] uppercase tracking-[0.3em]">Security Protocol v4.0.2</p>
        </div>

        {/* Login Card */}
        <div className="bg-[#151619] border border-[#2d2e33] rounded-2xl p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00ff9d] to-transparent opacity-50" />
          
          <div className="mb-8">
            <h2 className="text-lg font-bold text-white mb-1">System Authentication</h2>
            <p className="text-xs text-[#8e9299]">Enter administrative credentials to bypass the firewall.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-[#8e9299] tracking-widest ml-1">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8e9299]" />
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="Username"
                    className="w-full bg-[#0a0a0c] border border-[#2d2e33] rounded-xl py-3 pl-10 pr-4 text-sm font-mono text-white outline-none focus:border-[#00ff9d] focus:ring-1 focus:ring-[#00ff9d]/20 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-[#8e9299] tracking-widest ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8e9299]" />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-[#0a0a0c] border border-[#2d2e33] rounded-xl py-3 pl-10 pr-4 text-sm font-mono text-white outline-none focus:border-[#00ff9d] focus:ring-1 focus:ring-[#00ff9d]/20 transition-all"
                  />
                </div>
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-3"
              >
                <Zap className="w-4 h-4 text-red-500" />
                <span className="text-[10px] font-mono font-bold text-red-500 uppercase tracking-wider">{error}</span>
              </motion.div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full py-4 rounded-xl bg-[#00ff9d] text-[#0a0a0c] font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all hover:shadow-[0_0_30px_rgba(0,255,157,0.4)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",
                isLoading && "animate-pulse"
              )}
            >
              {isLoading ? 'Decrypting...' : (
                <>
                  Initialize Access <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#2d2e33] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-3 h-3 text-[#00ff9d]" />
              <span className="text-[8px] font-mono text-[#8e9299] uppercase tracking-widest">Encrypted Session</span>
            </div>
            <span className="text-[8px] font-mono text-[#4a4a4a]">IP: 192.168.1.104</span>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-[10px] font-mono text-[#4a4a4a] uppercase tracking-widest">
            Authorized Personnel Only • Unauthorized access is strictly prohibited
          </p>
        </div>
      </motion.div>
    </div>
  );
}
