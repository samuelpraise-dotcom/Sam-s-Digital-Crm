import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Plus, 
  Search, 
  Trash2, 
  Edit, 
  Copy, 
  Check,
  Tag,
  MessageSquare,
  MoreVertical,
  Zap,
  Code,
  X,
  Save,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Template {
  id: string;
  name: string;
  content: string;
  category: 'Sales' | 'Support' | 'Marketing' | 'Personal';
  lastUsed: string;
  variables: string[];
}

const MOCK_TEMPLATES: Template[] = [
  { 
    id: '1', 
    name: '🎓 Accepted', 
    content: 'Dear _______, 🎓\n\n🎉 Congratulations! You have been granted admission to study _______________at Miva Open University.\n\nWhy complete your enrollment early?\n\n📦 The Official Welcome Package: Be among the first to receive your physical Miva ID Card, official admission letter, and a collection of exclusive Miva gift items delivered straight to you.\n\n🎓 Early Masterclass Access: Get a head start with masterclasses led by industry experts with "Prime Experience."\n\n💻 LMS Familiarization: Gain early entry to the Learning Management System (LMS) to navigate your tools and dashboard with confidence.\n\n🤝 The Community Centre: Join our vibrant community hub to start networking with peers and faculty immediately.\n\n🎁 Miva Student Perks: Enjoy exclusive discounts on AI, Educational, and Entertainment tools, including Gemini Pro, Spotify, and Netflix.\n\n👥 Miva Buddies: Be paired with experienced student mentors who will walk you through every step of the process.\n\n📈 Career Advancement: Receive your official Admission and Enrollment letters early to facilitate discussions for job raises or promotions at your current workplace..\n\n⚠ Don’t miss these benefits!\n\nYou can watch our videos on youtube\n\n👉 https://www.youtube.com/@mivauniversity\n👉 https://youtu.be/wMnxQvSuAfg?si=TQz8zhvTdArnbgWq\n👉 https://www.youtube.com/live/HKupMBVxe_A?si=KoaA07jCpwduE5o5\n\n👉 Secure your spot today by making payment via our official portal:\n🔗 http://sis.miva.university', 
    category: 'Sales', 
    lastUsed: '2 hours ago',
    variables: []
  },
  { 
    id: '2', 
    name: '💰 Tuition Breakdown', 
    content: 'Here’s a quick breakdown of our tuition discount options for Undergraduate:\n\nTuition is ₦175,000 per semester (₦350,000 per year if paying per semester).\n\nIf you pay upfront for the full year, it’s ₦300,000 — you save ₦50,000 instantly.\n\nWe also have bigger multi-year discounts:\n• 2 Years – ₦570,000 (Save ₦130,000)\n• 3 Years – ₦810,000 (Save ₦240,000)\n• 4 Years – ₦990,000 (Save ₦410,000 — best value)\n\nThe more years you pay for upfront, the more you save.', 
    category: 'Sales', 
    lastUsed: '1 day ago',
    variables: []
  },
  { 
    id: '3', 
    name: '📝 Incomplete - Missing Doc', 
    content: 'Dear {name}, we noticed your application is incomplete. Specifically, we are missing your {document}. Please upload it to your portal to proceed.', 
    category: 'Support', 
    lastUsed: '5 mins ago',
    variables: ['name', 'document']
  },
  { 
    id: '4', 
    name: '📞 Follow-up', 
    content: 'Hi {name}, just following up on your admission status. Have you had a chance to look at the enrollment steps?', 
    category: 'Marketing', 
    lastUsed: 'Never',
    variables: ['name']
  }
];

export default function MessageTemplates() {
  const [templates, setTemplates] = useState<Template[]>(MOCK_TEMPLATES);
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState<Partial<Template>>({
    name: '',
    content: '',
    category: 'Sales'
  });

  const filteredTemplates = useMemo(() => 
    templates.filter(t => 
      t.name.toLowerCase().includes(search.toLowerCase()) || 
      t.content.toLowerCase().includes(search.toLowerCase())
    ), [templates, search]
  );

  const extractVariables = (text: string) => {
    const regex = /\{([^}]+)\}/g;
    const matches = text.match(regex) || [];
    return [...new Set(matches.map(m => m.slice(1, -1)))];
  };

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openModal = (template?: Template) => {
    if (template) {
      setEditingTemplate(template);
      setFormData(template);
    } else {
      setEditingTemplate(null);
      setFormData({ name: '', content: '', category: 'Sales' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTemplate(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.content) return;

    const variables = extractVariables(formData.content);
    
    if (editingTemplate) {
      setTemplates(prev => prev.map(t => 
        t.id === editingTemplate.id 
          ? { ...t, ...formData, variables } as Template 
          : t
      ));
    } else {
      const newTemplate: Template = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.name!,
        content: formData.content!,
        category: formData.category as any || 'Sales',
        lastUsed: 'Never',
        variables
      };
      setTemplates(prev => [newTemplate, ...prev]);
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      setTemplates(prev => prev.filter(t => t.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold uppercase tracking-tight font-mono">
            Message <span className="text-[#00ff9d]">Templates</span>
          </h2>
          <p className="text-xs text-[#8e9299] font-mono">LIBRARY v1.4.0 • {templates.length} ACTIVE SCHEMAS</p>
        </div>

        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#00ff9d] text-[#0a0a0c] text-xs font-bold uppercase tracking-wider hover:shadow-[0_0_20px_rgba(0,255,157,0.4)] transition-all"
        >
          <Plus className="w-4 h-4" /> Create Template
        </button>
      </div>

      <div className="p-6 rounded-xl bg-[#151619] border border-[#2d2e33] space-y-6">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8e9299]" />
          <input 
            type="text" 
            placeholder="Search templates by name or content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#0a0a0c] border border-[#2d2e33] focus:border-[#00ff9d] outline-none text-sm font-mono"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredTemplates.map((template) => (
              <motion.div 
                key={template.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group p-5 rounded-xl bg-[#0a0a0c] border border-[#2d2e33] hover:border-[#00ff9d]/30 transition-all flex flex-col gap-4 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1.5 rounded hover:bg-[#2d2e33] transition-colors">
                    <MoreVertical className="w-3.5 h-3.5 text-[#8e9299]" />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#151619] border border-[#2d2e33]">
                    <FileText className="w-4 h-4 text-[#00ff9d]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider truncate">{template.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] uppercase font-bold text-[#8e9299] bg-[#151619] px-1.5 py-0.5 rounded border border-[#2d2e33]">
                        {template.category}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-h-[80px] p-3 rounded-lg bg-[#151619] border border-[#2d2e33] text-xs font-mono text-[#8e9299] relative group/content">
                  <div className="line-clamp-3 leading-relaxed">
                    {template.content}
                  </div>
                  <button 
                    onClick={() => handleCopy(template.id, template.content)}
                    className="absolute top-2 right-2 p-1.5 rounded bg-[#0a0a0c] border border-[#2d2e33] opacity-0 group-hover/content:opacity-100 transition-all hover:border-[#00ff9d]/50"
                  >
                    {copiedId === template.id ? <Check className="w-3 h-3 text-[#00ff9d]" /> : <Copy className="w-3 h-3 text-[#8e9299]" />}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1 max-w-[60%]">
                    {template.variables.map(v => (
                      <span key={v} className="text-[8px] font-mono text-[#00ff9d] bg-[#00ff9d]/5 px-1.5 py-0.5 rounded border border-[#00ff9d]/20">
                        {`{${v}}`}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => openModal(template)}
                      className="p-1.5 rounded hover:bg-[#2d2e33] transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5 text-[#8e9299]" />
                    </button>
                    <button 
                      onClick={() => handleDelete(template.id)}
                      className="p-1.5 rounded hover:bg-red-500/10 transition-colors group/del"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-[#8e9299] group-hover/del:text-red-500" />
                    </button>
                  </div>
                </div>

                {/* Spintax Indicator */}
                {template.content.includes('{') && template.content.includes('|') && (
                  <div className="absolute bottom-2 right-2">
                    <Zap className="w-3 h-3 text-yellow-500 animate-pulse" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredTemplates.length === 0 && (
          <div className="py-20 text-center">
            <div className="p-4 inline-block rounded-full bg-[#0a0a0c] border border-[#2d2e33] mb-4">
              <MessageSquare className="w-8 h-8 text-[#2d2e33]" />
            </div>
            <h3 className="text-white font-bold uppercase tracking-widest text-sm mb-1">No Templates Found</h3>
            <p className="text-xs text-[#8e9299] font-mono">Try adjusting your search or create a new schema.</p>
          </div>
        )}
      </div>

      {/* Edit/Create Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-[#0a0a0c]/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-[#151619] border border-[#2d2e33] rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-[#2d2e33] flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-widest text-white">
                  {editingTemplate ? 'Edit Template' : 'Create New Template'}
                </h3>
                <button onClick={closeModal} className="p-2 rounded-lg hover:bg-[#2d2e33] transition-colors">
                  <X className="w-4 h-4 text-[#8e9299]" />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-[#8e9299] tracking-wider">Template Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Welcome Message"
                    className="w-full px-4 py-2.5 rounded-lg bg-[#0a0a0c] border border-[#2d2e33] focus:border-[#00ff9d] outline-none text-sm font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-[#8e9299] tracking-wider">Category</label>
                  <select 
                    value={formData.category}
                    onChange={e => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full px-4 py-2.5 rounded-lg bg-[#0a0a0c] border border-[#2d2e33] focus:border-[#00ff9d] outline-none text-sm font-mono appearance-none"
                  >
                    <option value="Sales">Sales</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Support">Support</option>
                    <option value="Personal">Personal</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase font-bold text-[#8e9299] tracking-wider">Message Content</label>
                    <div className="flex gap-2">
                      <button 
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, content: prev.content + '{name}' }))}
                        className="text-[8px] font-mono text-[#00ff9d] hover:underline"
                      >
                        +name
                      </button>
                      <button 
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, content: prev.content + '{Hi|Hello|Hey}' }))}
                        className="text-[8px] font-mono text-yellow-500 hover:underline"
                      >
                        +spintax
                      </button>
                    </div>
                  </div>
                  <textarea 
                    required
                    rows={5}
                    value={formData.content}
                    onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Type your message here... Use {variable} for dynamic data."
                    className="w-full px-4 py-3 rounded-lg bg-[#0a0a0c] border border-[#2d2e33] focus:border-[#00ff9d] outline-none text-sm font-mono resize-none leading-relaxed"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-[#0a0a0c] border border-[#2d2e33] text-xs font-bold uppercase tracking-wider hover:bg-[#2d2e33] transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-2.5 rounded-lg bg-[#00ff9d] text-[#0a0a0c] text-xs font-bold uppercase tracking-wider hover:shadow-[0_0_20px_rgba(0,255,157,0.4)] transition-all flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" /> {editingTemplate ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Quick Actions / Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl bg-[#151619] border border-[#2d2e33] flex items-start gap-4">
          <div className="p-3 rounded-xl bg-[#00ff9d]/10 border border-[#00ff9d]/20">
            <Code className="w-6 h-6 text-[#00ff9d]" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white">Variable Injection</h4>
            <p className="text-[10px] text-[#8e9299] font-mono leading-relaxed">
              Use <code className="text-[#00ff9d]">{`{name}`}</code>, <code className="text-[#00ff9d]">{`{phone}`}</code>, or custom fields to dynamically inject contact data during transmission.
            </p>
          </div>
        </div>
        <div className="p-6 rounded-xl bg-[#151619] border border-[#2d2e33] flex items-start gap-4">
          <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
            <Zap className="w-6 h-6 text-yellow-500" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white">Spintax Support</h4>
            <p className="text-[10px] text-[#8e9299] font-mono leading-relaxed">
              Use <code className="text-yellow-500">{`{Hi|Hello|Hey}`}</code> to automatically rotate greetings and bypass platform detection algorithms.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
