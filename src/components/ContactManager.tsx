import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Send, 
  FileText, 
  Plus, 
  Search, 
  Trash2, 
  Edit, 
  Download, 
  Upload,
  Filter,
  MoreVertical,
  CheckCircle2,
  Clock,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Contact } from '../App';

interface ContactManagerProps {
  contacts: Contact[];
  setContacts: React.Dispatch<React.SetStateAction<Contact[]>>;
  isSyncing: boolean;
}

export default function ContactManager({ contacts, setContacts, isSyncing }: ContactManagerProps) {
  const [search, setSearch] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '', tags: '' });
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContact.name || !newContact.phone) return;

    const contact: Contact = {
      id: Math.random().toString(36).substr(2, 9),
      name: newContact.name,
      phone: newContact.phone,
      status: 'active',
      lastSeen: 'Just now',
      tags: newContact.tags.split(',').map(t => t.trim()).filter(Boolean)
    };

    setContacts(prev => [contact, ...prev]);
    setNewContact({ name: '', phone: '', tags: '' });
    setIsAddModalOpen(false);
  };

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search)
  );

  const toggleSelect = (id: string) => {
    setSelectedContacts(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedContacts.length === filteredContacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(filteredContacts.map(c => c.id));
    }
  };

  const handleDelete = () => {
    if (selectedContacts.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedContacts.length} contacts?`)) {
      setContacts(prev => prev.filter(c => !selectedContacts.includes(c.id)));
      setSelectedContacts([]);
    }
  };

  const handleCsvImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      const newContacts: Contact[] = [];
      
      // Basic CSV parsing (assuming Name, Phone)
      lines.forEach((line, index) => {
        if (index === 0) return; // Skip header
        const [name, phone] = line.split(',').map(s => s.trim());
        if (name && phone) {
          newContacts.push({
            id: 'csv_' + Math.random().toString(36).substr(2, 9),
            name,
            phone,
            status: 'active',
            lastSeen: 'Never',
            tags: ['CSV Import']
          });
        }
      });

      if (newContacts.length > 0) {
        setContacts(prev => {
          const existingPhones = new Set(prev.map(c => c.phone));
          const uniqueNew = newContacts.filter(c => !existingPhones.has(c.phone));
          return [...prev, ...uniqueNew];
        });
        alert(`Imported ${newContacts.length} contacts from CSV.`);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold uppercase tracking-tight font-mono">
            Contact <span className="text-[#00ff9d]">Manager</span>
          </h2>
          <p className="text-xs text-[#8e9299] font-mono">DATABASE v2.1.0 • {contacts.length} TOTAL ENTRIES</p>
        </div>

        <div className="flex items-center gap-2">
          {isSyncing && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00ff9d]/10 border border-[#00ff9d]/30 text-[#00ff9d] text-[10px] font-bold uppercase tracking-widest"
            >
              <RefreshCw className="w-3 h-3 animate-spin" />
              Syncing from Extension...
            </motion.div>
          )}
          <button 
            onClick={() => alert("To sync contacts:\n1. Open WhatsApp Web\n2. Use the Digital Sam extension to 'Import' contacts\n3. Click 'Sync to CRM' in the extension popup.")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#151619] border border-[#2d2e33] text-xs font-bold uppercase tracking-wider hover:border-[#00ff9d]/50 transition-all"
          >
            <RefreshCw className={cn("w-4 h-4", isSyncing && "animate-spin text-[#00ff9d]")} /> 
            {isSyncing ? 'Syncing...' : 'Sync Extension'}
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#151619] border border-[#2d2e33] text-xs font-bold uppercase tracking-wider hover:border-[#00ff9d]/50 transition-all"
          >
            <Upload className="w-4 h-4" /> Import CSV
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleCsvImport} 
            accept=".csv" 
            className="hidden" 
          />
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00ff9d] text-[#0a0a0c] text-xs font-bold uppercase tracking-wider hover:shadow-[0_0_20px_rgba(0,255,157,0.4)] transition-all"
          >
            <Plus className="w-4 h-4" /> Add Contact
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0a0a0c]/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-md bg-[#151619] border border-[#2d2e33] rounded-2xl p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#00ff9d]/10 border border-[#00ff9d]/20">
                    <Users className="w-5 h-5 text-[#00ff9d]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Add New Contact</h3>
                    <p className="text-[10px] text-[#8e9299] font-mono">DATABASE ENTRY v2.1.0</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-2 rounded-lg hover:bg-[#2d2e33] transition-colors"
                >
                  <Plus className="w-4 h-4 text-[#8e9299] rotate-45" />
                </button>
              </div>

              <form onSubmit={handleAddContact} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-[#8e9299] tracking-widest ml-1">Full Name</label>
                    <input 
                      type="text" 
                      value={newContact.name}
                      onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                      required
                      placeholder="e.g. Samuel Praise"
                      className="w-full bg-[#0a0a0c] border border-[#2d2e33] rounded-xl py-3 px-4 text-sm font-mono text-white outline-none focus:border-[#00ff9d] transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-[#8e9299] tracking-widest ml-1">Phone Number</label>
                    <input 
                      type="tel" 
                      value={newContact.phone}
                      onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
                      required
                      placeholder="e.g. +234 800 000 0000"
                      className="w-full bg-[#0a0a0c] border border-[#2d2e33] rounded-xl py-3 px-4 text-sm font-mono text-white outline-none focus:border-[#00ff9d] transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-[#8e9299] tracking-widest ml-1">Tags (Comma Separated)</label>
                    <input 
                      type="text" 
                      value={newContact.tags}
                      onChange={(e) => setNewContact(prev => ({ ...prev, tags: e.target.value }))}
                      placeholder="e.g. VIP, Lead, Student"
                      className="w-full bg-[#0a0a0c] border border-[#2d2e33] rounded-xl py-3 px-4 text-sm font-mono text-white outline-none focus:border-[#00ff9d] transition-all"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 py-3 rounded-xl bg-[#151619] border border-[#2d2e33] text-[#8e9299] font-bold uppercase tracking-widest text-[10px] hover:text-white transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-[#00ff9d] text-[#0a0a0c] font-bold uppercase tracking-widest text-[10px] hover:shadow-[0_0_20px_rgba(0,255,157,0.4)] transition-all"
                  >
                    Confirm Entry
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="p-6 rounded-xl bg-[#151619] border border-[#2d2e33] space-y-6">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8e9299]" />
            <input 
              type="text" 
              placeholder="Search by name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#0a0a0c] border border-[#2d2e33] focus:border-[#00ff9d] outline-none text-sm font-mono"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button className="p-2 rounded-lg bg-[#0a0a0c] border border-[#2d2e33] hover:border-[#00ff9d]/30">
              <Filter className="w-4 h-4 text-[#8e9299]" />
            </button>
            <button className="p-2 rounded-lg bg-[#0a0a0c] border border-[#2d2e33] hover:border-[#00ff9d]/30">
              <Download className="w-4 h-4 text-[#8e9299]" />
            </button>
            <div className="w-px h-6 bg-[#2d2e33] mx-1" />
            <button 
              onClick={handleDelete}
              disabled={selectedContacts.length === 0}
              className="p-2 rounded-lg bg-[#0a0a0c] border border-[#2d2e33] hover:border-red-500/50 disabled:opacity-30 transition-all"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          </div>
        </div>

        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#2d2e33] text-[10px] uppercase font-bold tracking-widest text-[#8e9299]">
                <th className="pb-4 px-4 w-10">
                  <input 
                    type="checkbox" 
                    checked={selectedContacts.length === filteredContacts.length && filteredContacts.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-[#2d2e33] bg-[#0a0a0c] text-[#00ff9d] focus:ring-[#00ff9d]"
                  />
                </th>
                <th className="pb-4 px-4">Contact</th>
                <th className="pb-4 px-4">Phone</th>
                <th className="pb-4 px-4">Status</th>
                <th className="pb-4 px-4">Last Seen</th>
                <th className="pb-4 px-4">Tags</th>
                <th className="pb-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm font-mono">
              <AnimatePresence mode="popLayout">
                {filteredContacts.map((contact) => (
                  <motion.tr 
                    key={contact.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={cn(
                      "border-b border-[#2d2e33]/50 hover:bg-[#0a0a0c]/50 transition-colors",
                      selectedContacts.includes(contact.id) && "bg-[#00ff9d]/5"
                    )}
                  >
                    <td className="py-4 px-4">
                      <input 
                        type="checkbox" 
                        checked={selectedContacts.includes(contact.id)}
                        onChange={() => toggleSelect(contact.id)}
                        className="w-4 h-4 rounded border-[#2d2e33] bg-[#0a0a0c] text-[#00ff9d] focus:ring-[#00ff9d]"
                      />
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-white">{contact.name}</div>
                    </td>
                    <td className="py-4 px-4 text-[#8e9299]">{contact.phone}</td>
                    <td className="py-4 px-4">
                      <div className={cn(
                        "flex items-center gap-1.5 text-[10px] uppercase font-bold",
                        contact.status === 'active' ? "text-[#00ff9d]" : 
                        contact.status === 'pending' ? "text-yellow-500" : "text-[#8e9299]"
                      )}>
                        {contact.status === 'active' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {contact.status}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-[#8e9299] text-xs">{contact.lastSeen}</td>
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1">
                        {contact.tags.map(tag => (
                          <span key={tag} className="px-1.5 py-0.5 rounded bg-[#0a0a0c] border border-[#2d2e33] text-[8px] uppercase font-bold text-[#8e9299]">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-1.5 rounded hover:bg-[#2d2e33] transition-colors">
                          <Edit className="w-3.5 h-3.5 text-[#8e9299]" />
                        </button>
                        <button className="p-1.5 rounded hover:bg-[#2d2e33] transition-colors">
                          <MoreVertical className="w-3.5 h-3.5 text-[#8e9299]" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredContacts.map((contact) => (
              <motion.div 
                key={contact.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn(
                  "p-4 rounded-xl bg-[#0a0a0c] border border-[#2d2e33] space-y-4",
                  selectedContacts.includes(contact.id) && "border-[#00ff9d]/50 bg-[#00ff9d]/5"
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      checked={selectedContacts.includes(contact.id)}
                      onChange={() => toggleSelect(contact.id)}
                      className="w-4 h-4 rounded border-[#2d2e33] bg-[#0a0a0c] text-[#00ff9d] focus:ring-[#00ff9d]"
                    />
                    <div>
                      <div className="font-bold text-white">{contact.name}</div>
                      <div className="text-xs text-[#8e9299] font-mono">{contact.phone}</div>
                    </div>
                  </div>
                  <div className={cn(
                    "flex items-center gap-1.5 text-[8px] uppercase font-bold px-2 py-1 rounded border",
                    contact.status === 'active' ? "text-[#00ff9d] border-[#00ff9d]/20 bg-[#00ff9d]/5" : 
                    contact.status === 'pending' ? "text-yellow-500 border-yellow-500/20 bg-yellow-500/5" : 
                    "text-[#8e9299] border-[#2d2e33] bg-[#151619]"
                  )}>
                    {contact.status}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#2d2e33]/50">
                  <div className="flex flex-wrap gap-1">
                    {contact.tags.map(tag => (
                      <span key={tag} className="px-1.5 py-0.5 rounded bg-[#151619] border border-[#2d2e33] text-[8px] uppercase font-bold text-[#8e9299]">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded bg-[#151619] border border-[#2d2e33]">
                      <Edit className="w-3.5 h-3.5 text-[#8e9299]" />
                    </button>
                    <button className="p-2 rounded bg-[#151619] border border-[#2d2e33]">
                      <MoreVertical className="w-3.5 h-3.5 text-[#8e9299]" />
                    </button>
                  </div>
                </div>
                <div className="text-[10px] text-[#8e9299] font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Last seen: {contact.lastSeen}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
          
          {filteredContacts.length === 0 && (
            <div className="py-12 text-center">
              <div className="text-[#2d2e33] font-mono italic text-sm">No contacts found matching your search criteria.</div>
            </div>
          )}
        </div>
      </div>
  );
}
