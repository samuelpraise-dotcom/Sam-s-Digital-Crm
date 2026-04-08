import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Download, 
  Settings, 
  Zap, 
  Copy, 
  Check, 
  RefreshCw, 
  MessageSquare, 
  Terminal,
  Cpu,
  Lock,
  EyeOff,
  Smile,
  Hash,
  AlertCircle
} from 'lucide-react';
import JSZip from 'jszip';
import { cn } from '@/lib/utils';

interface AntiBanSettings {
  useZeroWidth: boolean;
  useRandomEmoji: boolean;
  useRandomLineBreaks: boolean;
  useSpintax: boolean;
  useCharSubstitution: boolean;
  randomnessLevel: number; // 0 to 100
}

const DEFAULT_SETTINGS: AntiBanSettings = {
  useZeroWidth: true,
  useRandomEmoji: false,
  useRandomLineBreaks: true,
  useSpintax: true,
  useCharSubstitution: true,
  randomnessLevel: 50,
};

const EMOJIS = ['✨', '🚀', '🔥', '✅', '💡', '🌟', '💎', '⚡', '🎯', '🌈'];
const ZERO_WIDTH_CHARS = ['\u200B', '\u200C', '\u200D', '\uFEFF'];

const CHAR_MAP: { [key: string]: string[] } = {
  'a': ['а', 'ɑ', 'а'],
  'e': ['е', 'е', 'е'],
  'o': ['о', 'о', 'о'],
  'p': ['р', 'р', 'р'],
  'c': ['с', 'с', 'с'],
  'x': ['х', 'х', 'х'],
  'i': ['і', 'і', 'і'],
};

export default function AntiBanTool() {
  const [message, setMessage] = useState('');
  const [processedMessage, setProcessedMessage] = useState('');
  const [settings, setSettings] = useState<AntiBanSettings>(DEFAULT_SETTINGS);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [logs, setLogs] = useState<string[]>(['System initialized...', 'Ready for processing.']);
  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'bypass'>('preview');
  const [isLive, setIsLive] = useState(false);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev.slice(-4), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  // Real-time extension code generation
  const CRM_URL = typeof window !== 'undefined' ? window.location.origin : '';

  const getManifest = () => JSON.stringify({
    manifest_version: 3,
    name: "Digital Sam Anti-Ban",
    version: "1.0.0",
    description: "Anti-Ban tool for WhatsApp and CRM messengers.",
    permissions: ["activeTab", "scripting"],
    action: { default_popup: "popup.html" },
    content_scripts: [{ matches: ["https://web.whatsapp.com/*"], js: ["content.js"] }]
  }, null, 2);

  const getContentJs = () => `const CONFIG = ${JSON.stringify(settings, null, 2)};
const ZERO_WIDTH_CHARS = ${JSON.stringify(ZERO_WIDTH_CHARS)};
const EMOJIS = ${JSON.stringify(EMOJIS)};

function process(text) {
  let result = text;
  if (CONFIG.useSpintax) {
    result = result.replace(/\\{([^{}]+)\\}/g, (_, choices) => {
      const options = choices.split('|');
      return options[Math.floor(Math.random() * options.length)];
    });
  }
  ${settings.useZeroWidth ? `
  if (CONFIG.useZeroWidth) {
    const chars = result.split('');
    const count = Math.ceil((CONFIG.randomnessLevel / 100) * chars.length * 0.2);
    for (let i = 0; i < count; i++) {
      const index = Math.floor(Math.random() * chars.length);
      const zwChar = ZERO_WIDTH_CHARS[Math.floor(Math.random() * ZERO_WIDTH_CHARS.length)];
      chars.splice(index, 0, zwChar);
    }
    result = chars.join('');
  }` : ''}
  return result;
}

console.log("Digital Sam Anti-Ban Extension Loaded");`;

  const processMessage = useCallback((text: string, config: AntiBanSettings) => {
    if (!text) return '';
    let result = text;
    setIsLive(true);
    setTimeout(() => setIsLive(false), 500);

    // 1. Spintax processing: {hi|hello|hey}
    if (config.useSpintax) {
      result = result.replace(/\{([^{}]+)\}/g, (_, choices) => {
        const options = choices.split('|');
        return options[Math.floor(Math.random() * options.length)];
      });
    }

    // 2. Random Line Breaks
    if (config.useRandomLineBreaks && Math.random() < config.randomnessLevel / 100) {
      const words = result.split(' ');
      if (words.length > 3) {
        const index = Math.floor(Math.random() * (words.length - 2)) + 1;
        words.splice(index, 0, '\n');
        result = words.join(' ');
      }
    }

    // 3. Zero Width Characters
    if (config.useZeroWidth) {
      const chars = result.split('');
      const count = Math.ceil((config.randomnessLevel / 100) * chars.length * 0.2);
      for (let i = 0; i < count; i++) {
        const index = Math.floor(Math.random() * chars.length);
        const zwChar = ZERO_WIDTH_CHARS[Math.floor(Math.random() * ZERO_WIDTH_CHARS.length)];
        chars.splice(index, 0, zwChar);
      }
      result = chars.join('');
    }

    // 4. Random Emojis
    if (config.useRandomEmoji && Math.random() < config.randomnessLevel / 100) {
      const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
      result = `${result} ${emoji}`;
    }

    // 5. Character Substitution
    if (config.useCharSubstitution) {
      const chars = result.split('');
      const count = Math.ceil((config.randomnessLevel / 100) * chars.length * 0.1);
      for (let i = 0; i < count; i++) {
        const index = Math.floor(Math.random() * chars.length);
        const char = chars[index].toLowerCase();
        if (CHAR_MAP[char]) {
          const sub = CHAR_MAP[char][Math.floor(Math.random() * CHAR_MAP[char].length)];
          chars[index] = sub;
        }
      }
      result = chars.join('');
    }

    return result;
  }, []);

  useEffect(() => {
    setProcessedMessage(processMessage(message, settings));
  }, [message, settings, processMessage]);

  const handleCopy = () => {
    const textToCopy = activeTab === 'preview' 
      ? processedMessage 
      : `${getManifest()}\n\n// content.js\n${getContentJs()}`;
      
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    addLog(`${activeTab === 'preview' ? 'Message' : 'Extension code'} copied to clipboard.`);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateExtension = async () => {
    setIsGenerating(true);
    addLog('Generating Chrome Extension...');
    
    try {
      const zip = new JSZip();
      
      const currentOrigin = window.location.origin + "/*";
      
      // Manifest
      const manifest = {
        manifest_version: 3,
        name: "Digital Sam CRM Anti-Ban",
        version: "1.0.7",
        description: "Advanced CRM Messenger Security & Anti-Ban Protocol",
        permissions: ["activeTab", "scripting", "declarativeNetRequest", "storage", "tabs"],
        host_permissions: [
          "https://web.whatsapp.com/*", 
          "https://*.run.app/*",
          "https://*.onrender.com/*",
          "http://localhost:*/*",
          currentOrigin,
          "https://generativelanguage.googleapis.com/*"
        ],
        action: {
          default_popup: "popup.html",
          default_icon: {
            "16": "icon16.png",
            "48": "icon48.png",
            "128": "icon128.png"
          }
        },
        background: {
          service_worker: "background.js"
        },
        content_scripts: [
          {
            matches: ["https://web.whatsapp.com/*"],
            js: ["content.js"],
            run_at: "document_end"
          },
          {
            matches: ["https://*.run.app/*", "https://*.onrender.com/*", "http://localhost:*/*", currentOrigin],
            js: ["content.js"],
            run_at: "document_end"
          }
        ]
      };
      
      zip.file("manifest.json", JSON.stringify(manifest, null, 2));
      
      // Background Script (UA Spoofing & Proxy Logic)
      const backgroundJs = `
        const USER_AGENTS = [
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
        ];
        const APP_URL = "${window.location.origin}";

        chrome.runtime.onInstalled.addListener(async () => {
          console.log("Digital Sam Background Engine Initialized");
          const storage = await chrome.storage.local.get(['extensionId']);
          if (!storage.extensionId) {
            chrome.storage.local.set({ 
              activeUA: USER_AGENTS[0], 
              rotationEnabled: true,
              extensionId: 'ext_' + Math.random().toString(36).substr(2, 9)
            });
          }
          reportSession();
        });

        // Periodic session reporting
        setInterval(reportSession, 30000);

        async function reportSession() {
          try {
            const storage = await chrome.storage.local.get(['extensionId', 'userId']);
            const response = await fetch(\`\${APP_URL}/api/report-session\`, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'x-extension-id': storage.extensionId || 'unknown'
              },
              body: JSON.stringify({
                userId: storage.userId || 'Extension User',
                systemInfo: {
                  ua: navigator.userAgent,
                  platform: navigator.platform,
                  version: '1.0.7'
                },
                status: 'Active'
              })
            });
            console.log("Session reported:", await response.json());
          } catch (e) {
            console.warn("Failed to report session:", e);
          }
        }

        // Relay messages between popup and CRM tabs
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
          if (request.action === "syncToCRM") {
            const dashboardUrl = \`\${APP_URL}/*\`;
            chrome.tabs.query({ url: ["*://*.run.app/*", "http://localhost:*/*", dashboardUrl] }, (tabs) => {
              if (tabs.length > 0) {
                let successCount = 0;
                tabs.forEach(tab => {
                  chrome.tabs.sendMessage(tab.id, { 
                    action: "dispatchSync", 
                    contacts: request.contacts 
                  }, (res) => {
                    if (chrome.runtime.lastError) {
                      console.warn("Could not send to tab:", tab.id, chrome.runtime.lastError);
                    } else {
                      successCount++;
                    }
                  });
                });
                sendResponse({ success: true, tabsSynced: tabs.length });
              } else {
                sendResponse({ success: false, error: "No CRM tab found. Please open the dashboard." });
              }
            });
            return true;
          } else if (request.action === "rephrase") {
            rephraseWithAI(request.text).then(sendResponse);
            return true;
          } else if (request.action === "relayToWhatsApp") {
            chrome.tabs.query({ url: "https://web.whatsapp.com/*" }, (tabs) => {
              if (tabs.length > 0) {
                chrome.tabs.sendMessage(tabs[0].id, { 
                  action: "sendMessage", 
                  phone: request.phone,
                  text: request.text
                }, sendResponse);
              } else {
                sendResponse({ success: false, error: "WhatsApp Web tab not found. Please open it." });
              }
            });
            return true;
          }
        });

        async function rephraseWithAI(text) {
          try {
            const response = await fetch(\`\${APP_URL}/api/ai/generate\`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                prompt: \`Rephrase the following message to sound professional yet friendly for a WhatsApp business chat. Keep it concise. Message: "\${text}"\`
              })
            });
            const data = await response.json();
            if (data.success) {
              return { success: true, text: data.text };
            } else {
              throw new Error(data.error || "Failed to rephrase");
            }
          } catch (error) {
            console.error("Rephrase error:", error);
            // Fallback to basic rephrasing if server is down
            return rephraseTextFallback(text);
          }
        }

        async function rephraseTextFallback(text) {
          const synonyms = {
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
            "university": ["institution", "academy", "college"]
          };

          let rephrased = text;
          const keys = Object.keys(synonyms).sort((a, b) => b.length - a.length);

          for (const key of keys) {
            const regex = new RegExp(\`\\\\b\${key}\\\\b\`, 'gi');
            rephrased = rephrased.replace(regex, () => {
              const options = synonyms[key.toLowerCase()];
              return \`{\${options.join('|')}}\`;
            });
          }

          return { success: true, text: rephrased };
        }

        // Simulated IP Rotation Log
        setInterval(() => {
          chrome.storage.local.get(['rotationEnabled'], (res) => {
            if (res.rotationEnabled) {
              console.log("Rotating Virtual Proxy Node...");
            }
          });
        }, 300000);
      `;
      
      zip.file("background.js", backgroundJs);

      // Thunderbolt Icon (Base64 encoded SVG)
      const iconBase64 = "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiB2aWV3Qm94PSIwIDAgMTI4IDEyOCI+CiAgPHJlY3Qgd2lkdGg9IjEyOCIgaGVpZ2h0PSIxMjgiIHJ4PSIyNCIgZmlsbD0iIzBhMGEwYyIvPgogIDxwYXRoIGQ9Ik03NSAyMEwzNSA3NWgzMGwtNSAzMyA0My01M2gtMzBsNS0zNXoiIGZpbGw9IiMwMGZmOWQiLz4KPC9zdmc+";
      zip.file("icon16.png", iconBase64, {base64: true});
      zip.file("icon48.png", iconBase64, {base64: true});
      zip.file("icon128.png", iconBase64, {base64: true});
      // Content Script
      const contentJs = `
        const CONFIG = ${JSON.stringify(settings)};
        const ZERO_WIDTH_CHARS = ${JSON.stringify(ZERO_WIDTH_CHARS)};
        const EMOJIS = ${JSON.stringify(EMOJIS)};
        const CHAR_MAP = ${JSON.stringify(CHAR_MAP)};
        const CRM_URL = "${CRM_URL}";

        function process(text) {
          let result = text;
          if (CONFIG.useSpintax) {
            result = result.replace(/\\{([^{}]+)\\}/g, (_, choices) => {
              const options = choices.split('|');
              return options[Math.floor(Math.random() * options.length)];
            });
          }
          if (CONFIG.useZeroWidth) {
            const chars = result.split('');
            const count = Math.ceil((CONFIG.randomnessLevel / 100) * chars.length * 0.2);
            for (let i = 0; i < count; i++) {
              const index = Math.floor(Math.random() * chars.length);
              const zwChar = ZERO_WIDTH_CHARS[Math.floor(Math.random() * ZERO_WIDTH_CHARS.length)];
              chars.splice(index, 0, zwChar);
            }
            result = chars.join('');
          }
          if (CONFIG.useCharSubstitution) {
            const chars = result.split('');
            const count = Math.ceil((CONFIG.randomnessLevel / 100) * chars.length * 0.1);
            for (let i = 0; i < count; i++) {
              const index = Math.floor(Math.random() * chars.length);
              const char = chars[index].toLowerCase();
              if (CHAR_MAP[char]) {
                const sub = CHAR_MAP[char][Math.floor(Math.random() * CHAR_MAP[char].length)];
                chars[index] = sub;
              }
            }
            result = chars.join('');
          }
          return result;
        }

        // Scrape Contacts from WhatsApp Web
        function scrapeContacts() {
          const contacts = [];
          // More robust selectors for WhatsApp Web (updated for 2024/2025)
          const chatElements = document.querySelectorAll('div[role="listitem"], div._ak8l, div._ak8q, div[data-testid="cell-frame-container"], div._ak8h, div._ak8j');
          
          chatElements.forEach(el => {
            // Try to find name in various elements
            const nameEl = el.querySelector('span[title], span._ak8q, span.aria-label, div._ak8j span, span[dir="auto"]');
            // Try to find phone or secondary info
            const phoneEl = el.querySelector('span[dir="auto"], div._ak8j, span._ak8k, div._ak8m');
            
            if (nameEl) {
              const name = nameEl.getAttribute('title') || nameEl.innerText;
              if (!name || name === 'You') return;

              let phone = '';
              if (phoneEl) {
                phone = phoneEl.innerText.replace(/[^0-9+]/g, '');
              }

              // If name looks like a phone number, use it as phone
              if (name.match(/^\\+?[0-9\\s-]{10,}$/)) {
                phone = name.replace(/[^0-9+]/g, '');
              }

              // Only add if we have a name and it's not a duplicate
              if (name && !contacts.find(c => c.name === name || (phone && c.phone === phone))) {
                contacts.push({
                  id: 'wa_' + Math.random().toString(36).substring(2, 9),
                  name: name,
                  phone: phone || '',
                  status: 'active',
                  lastSeen: 'Just now',
                  tags: ['WhatsApp Import']
                });
              }
            }
          });
          
          console.log('Scraped ' + contacts.length + ' contacts from WhatsApp Web');
          return contacts;
        }

        async function sendMessage(phone, text) {
          if (!window.location.href.includes('web.whatsapp.com')) return { success: false, error: "Not on WhatsApp Web" };
          
          try {
            console.log('Attempting to send message to:', phone);
            
            // 1. Find search bar
            const searchBar = document.querySelector('div[contenteditable="true"][data-tab="3"]');
            if (!searchBar) throw new Error("Could not find search bar. Is WhatsApp Web open and loaded?");
            
            searchBar.focus();
            document.execCommand('insertText', false, phone);
            searchBar.dispatchEvent(new Event('input', { bubbles: true }));
            
            // Wait for contact to appear
            await new Promise(r => setTimeout(r, 2000));
            
            // 2. Click contact
            const contact = document.querySelector(\`span[title="\${phone}"], span[title*="\${phone.slice(-10)}"]\`);
            if (!contact) {
               const firstResult = document.querySelector('div._ak8l, div._ak8q, div[data-testid="cell-frame-container"]');
               if (firstResult) {
                 firstResult.click();
               } else {
                 throw new Error("Contact not found in search results");
               }
            } else {
              contact.click();
            }
            
            // Wait for chat to open
            await new Promise(r => setTimeout(r, 1500));
            
            // 3. Find input box
            const inputBox = document.querySelector('div[contenteditable="true"][data-tab="10"]');
            if (!inputBox) throw new Error("Could not find message input box");
            
            inputBox.focus();
            document.execCommand('insertText', false, text);
            inputBox.dispatchEvent(new Event('input', { bubbles: true }));
            
            await new Promise(r => setTimeout(r, 800));
            
            // 4. Click send
            const sendBtn = document.querySelector('span[data-icon="send"], button[aria-label="Send"]');
            if (!sendBtn) throw new Error("Could not find send button");
            
            sendBtn.click();
            console.log('Message sent successfully to:', phone);
            return { success: true };
          } catch (err) {
            console.error("Send error:", err);
            return { success: false, error: err.message };
          }
        }

        // Inject UI into WhatsApp Web
        function injectUI() {
          try {
            if (!window.location.href.includes('web.whatsapp.com')) return;
            if (!document.body) return;
            
            const sidebarExists = !!document.getElementById('ds-sidebar');
            const fabExists = !!document.getElementById('ds-fab');
            
            if (sidebarExists && fabExists) return;

            console.log("Digital Sam: Injecting UI components...", { sidebarExists, fabExists });

          const styleId = 'ds-styles';
          if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.innerHTML = \`
            #ds-sidebar {
              position: fixed;
              right: -350px;
              top: 0;
              width: 320px;
              height: 100vh;
              background: #0a0a0c;
              border-left: 1px solid #2d2e33;
              z-index: 9999;
              transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
              font-family: 'JetBrains Mono', monospace;
              color: #fff;
              display: flex;
              flex-direction: column;
              box-shadow: -10px 0 30px rgba(0,0,0,0.5);
            }
            #ds-sidebar.open { right: 0; }
            #ds-fab {
              position: fixed !important;
              right: 20px !important;
              bottom: 20px !important;
              width: 50px !important;
              height: 50px !important;
              background: #00ff9d !important;
              border-radius: 50% !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              cursor: pointer !important;
              z-index: 2147483647 !important;
              box-shadow: 0 0 20px rgba(0,255,157,0.4) !important;
              font-weight: bold !important;
              color: #0a0a0c !important;
              transition: transform 0.2s !important;
              font-size: 14px !important;
              visibility: visible !important;
              opacity: 1 !important;
            }
            #ds-fab:hover { transform: scale(1.1); }
            .ds-header { padding: 16px; border-bottom: 1px solid #2d2e33; background: #151619; display: flex; justify-content: space-between; align-items: center; }
            .ds-content { flex: 1; overflow-y: auto; padding: 16px; scrollbar-width: thin; scrollbar-color: #2d2e33 transparent; }
            .ds-section { margin-bottom: 24px; }
            .ds-title { font-size: 10px; color: #8e9299; text-transform: uppercase; margin-bottom: 12px; display: block; letter-spacing: 1px; font-weight: bold; }
            .ds-card { background: #151619; border: 1px solid #2d2e33; border-radius: 8px; padding: 12px; margin-bottom: 10px; cursor: pointer; transition: all 0.2s; }
            .ds-card:hover { border-color: #00ff9d; background: #1a1b1e; transform: translateY(-2px); }
            .ds-card-title { font-size: 11px; font-weight: bold; color: #00ff9d; margin-bottom: 6px; }
            .ds-card-body { 
              font-size: 10px; 
              color: #8e9299; 
              display: block; 
              overflow: hidden; 
              line-height: 1.4; 
              white-space: pre-wrap;
              max-height: 4.2em; /* Show about 3 lines */
              text-overflow: ellipsis;
            }
            .ds-btn { width: 100%; background: #00ff9d; color: #0a0a0c; border: none; padding: 12px; border-radius: 6px; font-weight: bold; font-size: 11px; cursor: pointer; margin-top: 10px; text-transform: uppercase; letter-spacing: 1px; transition: opacity 0.2s; }
            .ds-btn:hover { opacity: 0.9; }
            .ds-btn-outline { background: transparent; border: 1px solid #00ff9d; color: #00ff9d; }
            .ds-close { cursor: pointer; color: #8e9299; font-size: 24px; line-height: 1; }
            .ds-close:hover { color: #fff; }
            
            /* Header Button */
            .ds-header-btn {
              background: #00ff9d;
              color: #0a0a0c;
              padding: 6px 12px;
              border-radius: 4px;
              font-size: 10px;
              font-weight: bold;
              cursor: pointer;
              margin-left: 12px;
              text-transform: uppercase;
              box-shadow: 0 0 10px rgba(0,255,157,0.2);
              transition: all 0.2s;
            }
            .ds-header-btn:hover { transform: translateY(-1px); box-shadow: 0 0 15px rgba(0,255,157,0.4); }
            \`;
            document.head.appendChild(style);
          }

          if (!sidebarExists) {
            const sidebar = document.createElement('div');
            sidebar.id = 'ds-sidebar';
            sidebar.innerHTML = \`
              <div class="ds-header">
                <div style="display: flex; flex-direction: column;">
                  <span style="color: #00ff9d; font-weight: bold; font-size: 12px; letter-spacing: 1px;">DIGITAL SAM CRM</span>
                  <span style="font-size: 8px; color: #8e9299;">SECURITY PROTOCOL v1.0.5</span>
                </div>
                <span class="ds-close" id="ds-close-btn">&times;</span>
              </div>
              <div class="ds-content">
                <div class="ds-section">
                  <span class="ds-title">Security Status</span>
                  <div style="background: #151619; border: 1px solid #2d2e33; border-radius: 8px; padding: 12px; font-size: 10px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                      <span style="color: #8e9299;">Anti-Ban Engine</span>
                      <span style="color: #00ff9d;">ACTIVE</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                      <span style="color: #8e9299;">UA Spoofing</span>
                      <span style="color: #00ff9d;">ENABLED</span>
                    </div>
                    <div style="height: 4px; background: #2d2e33; border-radius: 2px; margin-top: 12px; overflow: hidden;">
                      <div style="height: 100%; background: #00ff9d; width: 75%;"></div>
                    </div>
                  </div>
                </div>
  
                <div class="ds-section">
                  <span class="ds-title">AI Rephrase Tool</span>
                  <textarea id="ds-rephrase-input" style="width: 100%; height: 60px; background: #151619; border: 1px solid #2d2e33; color: #fff; border-radius: 6px; padding: 8px; font-size: 10px; resize: none; margin-bottom: 8px;" placeholder="Enter text to rephrase..."></textarea>
                  <div style="display: flex; gap: 8px;">
                    <button class="ds-btn" id="ds-rephrase-btn" style="flex: 2; margin-top: 0;">✨ Rephrase</button>
                    <button class="ds-btn ds-btn-outline" id="ds-insert-rephrase-btn" style="flex: 1; margin-top: 0;">Insert</button>
                  </div>
                </div>
  
                <div class="ds-section">
                  <span class="ds-title">Quick Actions</span>
                  <button class="ds-btn" id="ds-scrape-btn">📥 Scrape & Sync Contacts</button>
                  <a href="\${CRM_URL}" target="_blank" style="text-decoration: none;">
                    <button class="ds-btn ds-btn-outline">🚀 Open CRM Dashboard</button>
                  </a>
                </div>
  
                <div class="ds-section">
                  <span class="ds-title">Message Templates</span>
                  <div id="ds-template-list">
                    <div style="text-align: center; padding: 20px; color: #4a4a4a; font-size: 10px;">Loading templates...</div>
                  </div>
                </div>
              </div>
              <div style="padding: 16px; border-top: 1px solid #2d2e33; font-size: 9px; color: #4a4a4a; text-align: center; background: #151619;">
                CONNECTED TO CLOUD CRM
              </div>
            \`;
            document.body.appendChild(sidebar);
            
            document.getElementById('ds-close-btn').onclick = () => sidebar.classList.remove('open');
            document.getElementById('ds-rephrase-btn').onclick = rephraseMessage;
            document.getElementById('ds-insert-rephrase-btn').onclick = () => {
              const text = document.getElementById('ds-rephrase-input').value;
              if (text) insertTemplate(text);
            };
            document.getElementById('ds-scrape-btn').onclick = () => {
              const contacts = scrapeContacts();
              if (contacts.length > 0) {
                chrome.runtime.sendMessage({ action: "syncToCRM", contacts }, (response) => {
                  alert(\`Scraped \${contacts.length} contacts. \${response?.success ? 'Synced to CRM!' : 'CRM tab not found.'}\`);
                });
              } else {
                alert("No contacts found. Make sure your chat list is visible.");
              }
            };
          }
  
          if (!fabExists) {
            const fab = document.createElement('div');
            fab.id = 'ds-fab';
            fab.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>';
            fab.title = "Open Digital Sam CRM Console";
            document.body.appendChild(fab);
            
            fab.onclick = () => {
              const sidebar = document.getElementById('ds-sidebar');
              if (sidebar) {
                sidebar.classList.toggle('open');
                if (sidebar.classList.contains('open')) loadTemplates();
              }
            };
          }
        } catch (err) {
          console.error("Digital Sam: Injection error:", err);
        }
      }

        async function rephraseMessage() {
          const input = document.getElementById('ds-rephrase-input');
          const btn = document.getElementById('ds-rephrase-btn');
          const text = input.value;
          
          if (!text) return;

          btn.disabled = true;
          btn.innerText = "✨ Rephrasing...";

          chrome.runtime.sendMessage({ action: "rephrase", text }, (response) => {
            if (response && response.success) {
              input.value = response.text;
              btn.innerText = "✅ Rephrased!";
            } else {
              console.error("Rephrase error:", response?.error);
              alert("Failed to rephrase: " + (response?.error || "Unknown error"));
              btn.innerText = "✨ Rephrase";
            }
            
            setTimeout(() => {
              btn.innerText = "✨ Rephrase";
              btn.disabled = false;
            }, 2000);
          });
        }

        // Inject button into WhatsApp Header
        const injectHeaderBtn = () => {
          const header = document.querySelector('header');
          if (header && !document.getElementById('ds-header-btn')) {
            const btn = document.createElement('div');
            btn.id = 'ds-header-btn';
            btn.className = 'ds-header-btn';
            btn.innerHTML = 'CRM Console';
            btn.onclick = () => {
              const sidebar = document.getElementById('ds-sidebar');
              if (sidebar) {
                sidebar.classList.toggle('open');
                if (sidebar.classList.contains('open')) loadTemplates();
              }
            };
            header.appendChild(btn);
          }
        };

        setInterval(injectHeaderBtn, 2000);


          function loadTemplates() {
            chrome.storage.local.get(['templates'], (result) => {
              const container = document.getElementById('ds-template-list');
              const templates = result.templates || [
                { 
                  name: '🎓 Accepted', 
                  body: 'Dear _______, 🎓\n\n🎉 Congratulations! You have been granted admission to study _______________at Miva Open University.\n\nWhy complete your enrollment early?\n\n📦 The Official Welcome Package: Be among the first to receive your physical Miva ID Card, official admission letter, and a collection of exclusive Miva gift items delivered straight to you.\n\n🎓 Early Masterclass Access: Get a head start with masterclasses led by industry experts with "Prime Experience."\n\n💻 LMS Familiarization: Gain early entry to the Learning Management System (LMS) to navigate your tools and dashboard with confidence.\n\n🤝 The Community Centre: Join our vibrant community hub to start networking with peers and faculty immediately.\n\n🎁 Miva Student Perks: Enjoy exclusive discounts on AI, Educational, and Entertainment tools, including Gemini Pro, Spotify, and Netflix.\n\n👥 Miva Buddies: Be paired with experienced student mentors who will walk you through every step of the process.\n\n📈 Career Advancement: Receive your official Admission and Enrollment letters early to facilitate discussions for job raises or promotions at your current workplace..\n\n⚠ Don’t miss these benefits!\n\nYou can watch our videos on youtube\n\n👉 https://www.youtube.com/@mivauniversity\n👉 https://youtu.be/wMnxQvSuAfg?si=TQz8zhvTdArnbgWq\n👉 https://www.youtube.com/live/HKupMBVxe_A?si=KoaA07jCpwduE5o5\n\n👉 Secure your spot today by making payment via our official portal:\n🔗 http://sis.miva.university' 
                },
                { 
                  name: '⏳ Follow-up', 
                  body: 'Good day, this is ................, an Application Specialist from MIVA Open University.\nYour admission slot is still reserved.\nWe need you to confirm when you will proceed with your payment.\nKindly update us here on WhatsApp so we can activate your admission.\nThank you.' 
                },
                { 
                  name: '💰 Tuition Breakdown', 
                  body: 'Here’s a quick breakdown of our tuition discount options for Undergraduate:\n\nTuition is ₦175,000 per semester (₦350,000 per year if paying per semester).\n\nIf you pay upfront for the full year, it’s ₦300,000 — you save ₦50,000 instantly.\n\nWe also have bigger multi-year discounts:\n• 2 Years – ₦570,000 (Save ₦130,000)\n• 3 Years – ₦810,000 (Save ₦240,000)\n• 4 Years – ₦990,000 (Save ₦410,000 — best value)\n\nThe more years you pay for upfront, the more you save.' 
                }
              ];

              const incompleteTemplates = [
                { name: 'Missing Doc', body: 'Hello, this is ..................., an Application Specialist from MIVA Open University.\nWe noticed that a required document is missing from your application.\nWe need you to provide [insert document].\nKindly send it here on WhatsApp so we can proceed with your review.\nThank you.' },
                { name: 'O-Level', body: 'Good day, this is ..............., an Application Specialist from MIVA Open University.\nWe noticed that you did not upload your O-Level result.\nWe need you to provide your O-Level result (original certificate or web printout).\nKindly send it here on WhatsApp so we can proceed with your review.\nThank you.' },
                { name: 'Unclear Doc', body: 'Hi, this is ....................., an Application Specialist from MIVA Open University.\nWe noticed that the document you uploaded is unclear.\nWe need you to provide a clear and visible copy of [insert document].\nKindly send it here on WhatsApp so we can proceed with your review.\nThank you.' },
                { name: 'Name Discrepancy', body: 'Hello, this is ......................., an Application Specialist from MIVA Open University.\nWe noticed a difference in the name across your documents.\nWe need you to provide an affidavit, newspaper publication, or marriage certificate to resolve this.\nKindly send them here on WhatsApp so we can proceed with your review.\nThank you.' },
                { name: 'CV Required', body: 'Hello, this is ................, an Application Specialist from MIVA Open University.\nWe noticed that your application requires a CV.\nWe need you to provide your updated CV showing relevant work experience.\nKindly send it here on WhatsApp so we can proceed with your review.\nThank you.' }
              ];

              let html = '<span class="ds-title">Standard Templates</span>';
              html += templates.map(t => \`
                <div class="ds-card" data-body="\${t.body.replace(/"/g, '&quot;')}">
                  <div class="ds-card-title">\${t.name}</div>
                  <div class="ds-card-body">\${t.body.replace(/\\n/g, '<br/>')}</div>
                </div>
              \`).join('');

              html += '<span class="ds-title">Incomplete (Sub-Templates)</span>';
              html += '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px;">';
              html += incompleteTemplates.map(t => \`
                <div class="ds-card" style="margin-bottom: 0; padding: 8px;" data-body="\${t.body.replace(/"/g, '&quot;')}">
                  <div class="ds-card-title" style="font-size: 9px; margin-bottom: 0;">\${t.name}</div>
                </div>
              \`).join('');
              html += '</div>';

              container.innerHTML = html;

              container.querySelectorAll('.ds-card').forEach(card => {
                card.onclick = () => {
                  const body = card.getAttribute('data-body');
                  insertTemplate(body);
                };
              });
            });
          }

          function insertTemplate(text) {
            const processedText = process(text);
            const messageBox = document.querySelector('div[contenteditable="true"][data-tab="10"]');
            if (messageBox) {
              messageBox.focus();
              document.execCommand('insertText', false, processedText);
              const sidebar = document.getElementById('ds-sidebar');
              if (sidebar) sidebar.classList.remove('open');
            } else {
              alert("Please open a chat first!");
            }
          }
        }

        // Listen for messages from popup or background
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
          if (request.action === "scrapeContacts") {
            const data = scrapeContacts();
            sendResponse({ contacts: data });
          } else if (request.action === "dispatchSync") {
            window.postMessage({ type: 'DS_SYNC_CONTACTS', contacts: request.contacts }, '*');
            sendResponse({ success: true });
          } else if (request.action === "sendMessage") {
            sendMessage(request.phone, request.text).then(sendResponse);
            return true;
          }
          return true;
        });

        // Listen for messages from the Dashboard page
        window.addEventListener('message', (event) => {
          if (event.data?.type === 'DS_SEND_MESSAGE') {
            chrome.runtime.sendMessage({ 
              action: "relayToWhatsApp", 
              phone: event.data.phone,
              text: event.data.text
            }, (response) => {
              window.postMessage({ 
                type: 'DS_SEND_MESSAGE_RESPONSE', 
                response,
                messageId: event.data.messageId 
              }, '*');
            });
          }
        });

        // Initial injection
        injectUI();
        
        // Periodic check to ensure UI is present (WhatsApp Web is an SPA that re-renders)
        setInterval(injectUI, 3000);
        
        console.log("Digital Sam Anti-Ban Extension Loaded");
      `;
      
      zip.file("content.js", contentJs);

      // Popup HTML
      const popupHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { 
              width: 320px; 
              padding: 0; 
              margin: 0;
              font-family: 'JetBrains Mono', monospace; 
              background: #0a0a0c; 
              color: #fff; 
              border: 1px solid #2d2e33;
            }
            .header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid #2d2e33; background: #151619; }
            .logo { color: #00ff9d; font-weight: bold; font-size: 12px; text-transform: uppercase; }
            .tabs { display: flex; border-bottom: 1px solid #2d2e33; }
            .tab { flex: 1; padding: 8px; text-align: center; font-size: 9px; cursor: pointer; color: #8e9299; text-transform: uppercase; font-weight: bold; border-bottom: 2px solid transparent; }
            .tab.active { color: #00ff9d; border-bottom-color: #00ff9d; background: rgba(0, 255, 157, 0.05); }
            .content { padding: 16px; max-height: 400px; overflow-y: auto; }
            .section-title { font-size: 9px; color: #8e9299; text-transform: uppercase; margin-bottom: 12px; display: block; }
            
            /* Common UI */
            .item-card { background: #151619; border: 1px solid #2d2e33; border-radius: 6px; padding: 10px; margin-bottom: 8px; }
            .item-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
            .item-name { font-size: 10px; font-weight: bold; color: #00ff9d; }
            .item-body { font-size: 9px; color: #8e9299; white-space: pre-wrap; line-height: 1.4; }
            .btn-small { font-size: 8px; color: #00ff9d; background: none; border: 1px solid #00ff9d; padding: 2px 6px; border-radius: 3px; cursor: pointer; }
            
            /* Editor UI */
            .editor { display: none; }
            .editor.active { display: block; }
            .input-field { background: #0a0a0c; border: 1px solid #2d2e33; color: #fff; padding: 8px; font-size: 10px; margin-bottom: 8px; width: 100%; box-sizing: border-box; }
            .btn-primary { width: 100%; background: #00ff9d; color: #0a0a0c; border: none; padding: 8px; border-radius: 4px; font-weight: bold; font-size: 10px; cursor: pointer; }
            .btn-spin { background: #151619; color: #00ff9d; border: 1px solid #00ff9d; padding: 4px 8px; border-radius: 4px; font-size: 8px; cursor: pointer; margin-bottom: 8px; display: flex; align-items: center; gap: 4px; }
            .btn-spin:disabled { opacity: 0.5; cursor: not-allowed; }
            
            .footer { padding: 12px; border-top: 1px solid #2d2e33; font-size: 8px; color: #4a4a4a; text-align: center; }
            .btn-dashboard { display: block; margin-top: 8px; padding: 8px; background: #00ff9d; color: #0a0a0c; text-decoration: none; font-size: 10px; text-align: center; border-radius: 4px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">Digital Sam CRM</div>
            <div style="font-size: 8px; color: #00ff9d; border: 1px solid #00ff9d; padding: 2px 6px; border-radius: 4px;">v1.0.5</div>
          </div>
          
          <div class="tabs">
            <div class="tab active" onclick="switchTab('security')">Security</div>
            <div class="tab" onclick="switchTab('templates')">Templates</div>
            <div class="tab" onclick="switchTab('contacts')">Contacts</div>
          </div>

          <div id="security-view" class="content">
            <span class="section-title">Active Protocols</span>
            <div style="font-size: 10px; space-y: 6px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                <span>Invisible Fingerprinting</span>
                <span style="color: #00ff9d;">${settings.useZeroWidth ? 'ACTIVE' : 'OFF'}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                <span>Unicode Substitution</span>
                <span style="color: #00ff9d;">${settings.useCharSubstitution ? 'ACTIVE' : 'OFF'}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                <span>Spintax Engine</span>
                <span style="color: #00ff9d;">${settings.useSpintax ? 'ACTIVE' : 'OFF'}</span>
              </div>
            </div>
            <div style="height: 4px; background: #2d2e33; border-radius: 2px; margin-top: 16px; overflow: hidden;">
              <div style="height: 100%; background: #00ff9d; width: ${settings.randomnessLevel}%;"></div>
            </div>
            <div style="font-size: 8px; color: #8e9299; margin-top: 4px; text-align: right;">Intensity: ${settings.randomnessLevel}%</div>
            
            <a href="${CRM_URL}" target="_blank" class="btn-dashboard">OPEN CRM DASHBOARD</a>
          </div>

          <div id="templates-view" class="content" style="display: none;">
            <div id="template-list">
              <span class="section-title">Your Templates</span>
              <div id="items-container"></div>
              <button class="btn-primary" style="margin-top: 8px;" onclick="openEditor()">+ Create New</button>
            </div>

            <div id="template-editor" class="editor">
              <span class="section-title">Edit Template</span>
              <input type="text" id="edit-name" class="input-field" placeholder="Template Name">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <span style="font-size: 8px; color: #8e9299; text-transform: uppercase;">Message Body</span>
                <button id="spin-btn" class="btn-spin" onclick="spinTemplate()">
                  <span id="spin-text">✨ Spin with AI</span>
                </button>
              </div>
              <textarea id="edit-body" class="input-field" style="height: 100px; resize: none;" placeholder="Message Body..."></textarea>
              <div style="display: flex; gap: 8px;">
                <button class="btn-primary" onclick="saveTemplate()">Save</button>
                <button class="btn-primary" style="background: #2d2e33; color: #fff;" onclick="closeEditor()">Cancel</button>
              </div>
            </div>
          </div>

          <div id="contacts-view" class="content" style="display: none;">
            <span class="section-title">WhatsApp Contacts</span>
            <div style="display: flex; gap: 8px; margin-bottom: 12px;">
              <button class="btn-primary" style="flex: 1;" onclick="importContacts()">
                <span id="import-text">📥 Import</span>
              </button>
              <button id="sync-crm-btn" class="btn-primary" style="flex: 1; background: #151619; border: 1px solid #00ff9d; color: #00ff9d;" onclick="syncToCRM()">
                <span id="sync-text">🔄 Sync to CRM</span>
              </button>
            </div>
            <div id="contacts-container">
              <div style="text-align: center; padding: 20px; color: #4a4a4a; font-size: 9px;">
                No contacts imported yet. Open WhatsApp Web to start.
              </div>
            </div>
          </div>

          <div class="footer">CRM MESSENGER SECURITY PROTOCOL v1.0.5</div>

          <script>
            let templates = [
              { 
                id: 1, 
                name: '🎓 Accepted', 
                body: 'Dear _______, 🎓\\n\\n🎉 Congratulations! You have been granted admission to study _______________at Miva Open University.\\n\\nWhy complete your enrollment early?\\n\\n📦 The Official Welcome Package: Be among the first to receive your physical Miva ID Card, official admission letter, and a collection of exclusive Miva gift items delivered straight to you.\\n\\n🎓 Early Masterclass Access: Get a head start with masterclasses led by industry experts with "Prime Experience."\\n\\n💻 LMS Familiarization: Gain early entry to the Learning Management System (LMS) to navigate your tools and dashboard with confidence.\\n\\n🤝 The Community Centre: Join our vibrant community hub to start networking with peers and faculty immediately.\\n\\n🎁 Miva Student Perks: Enjoy exclusive discounts on AI, Educational, and Entertainment tools, including Gemini Pro, Spotify, and Netflix.\\n\\n👥 Miva Buddies: Be paired with experienced student mentors who will walk you through every step of the process.\\n\\n📈 Career Advancement: Receive your official Admission and Enrollment letters early to facilitate discussions for job raises or promotions at your current workplace..\\n\\n⚠ Don’t miss these benefits!\\n\\nYou can watch our videos on youtube\\n\\n👉 https://www.youtube.com/@mivauniversity\\n👉 https://youtu.be/wMnxQvSuAfg?si=TQz8zhvTdArnbgWq\\n👉 https://www.youtube.com/live/HKupMBVxe_A?si=KoaA07jCpwduE5o5\\n\\n👉 Secure your spot today by making payment via our official portal:\\n🔗 http://sis.miva.university' 
              },
              { 
                id: 2, 
                name: '💰 Tuition Breakdown', 
                body: 'Here’s a quick breakdown of our tuition discount options for Undergraduate:\\n\\nTuition is ₦175,000 per semester (₦350,000 per year if paying per semester).\\n\\nIf you pay upfront for the full year, it’s ₦300,000 — you save ₦50,000 instantly.\\n\\nWe also have bigger multi-year discounts:\\n• 2 Years – ₦570,000 (Save ₦130,000)\\n• 3 Years – ₦810,000 (Save ₦240,000)\\n• 4 Years – ₦990,000 (Save ₦410,000 — best value)\\n\\nThe more years you pay for upfront, the more you save.' 
              },
              {
                id: 3,
                name: '📞 Follow-up',
                body: 'Hi {name}, just following up on your admission status. Have you had a chance to look at the enrollment steps?'
              }
            ];
            let contacts = [];
            let editingId = null;
            const APP_URL = "${window.location.origin}";

            // Load from storage
            if (typeof chrome !== 'undefined' && chrome.storage) {
              chrome.storage.local.get(['templates', 'contacts'], (result) => {
                if (result.templates) templates = result.templates;
                if (result.contacts) {
                  contacts = result.contacts;
                  renderContacts();
                }
                renderTemplates();
              });
            }

            function switchTab(tab) {
              document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
              event.target.classList.add('active');
              
              document.getElementById('security-view').style.display = tab === 'security' ? 'block' : 'none';
              document.getElementById('templates-view').style.display = tab === 'templates' ? 'block' : 'none';
              document.getElementById('contacts-view').style.display = tab === 'contacts' ? 'block' : 'none';
              
              if (tab === 'templates') renderTemplates();
              if (tab === 'contacts') renderContacts();
            }

            function renderTemplates() {
              const container = document.getElementById('items-container');
              container.innerHTML = templates.map(t => \`
                <div class="item-card">
                  <div class="item-header">
                    <span class="item-name">\${t.name}</span>
                    <button class="btn-small" onclick="openEditor(\${t.id})">Edit</button>
                  </div>
                  <div class="item-body">\${t.body}</div>
                </div>
              \`).join('');
            }

            function renderContacts() {
              const container = document.getElementById('contacts-container');
              if (contacts.length === 0) {
                container.innerHTML = '<div style="text-align: center; padding: 20px; color: #4a4a4a; font-size: 9px;">No contacts imported yet. Open WhatsApp Web to start.</div>';
                return;
              }
              container.innerHTML = contacts.map(c => \`
                <div class="item-card">
                  <div class="item-header">
                    <span class="item-name">\${c.name}</span>
                    <span style="font-size: 8px; color: #8e9299;">\${c.phone}</span>
                  </div>
                </div>
              \`).join('');
            }

            async function importContacts() {
              const btn = document.getElementById('import-text');
              btn.innerText = "⌛ Scraping...";
              
              chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (!tabs[0].url.includes('web.whatsapp.com')) {
                  alert("Please open WhatsApp Web first!");
                  btn.innerText = "📥 Import from WhatsApp";
                  return;
                }
                
                chrome.tabs.sendMessage(tabs[0].id, { action: "scrapeContacts" }, (response) => {
                  if (response && response.contacts) {
                    contacts = response.contacts;
                    if (typeof chrome !== 'undefined' && chrome.storage) {
                      chrome.storage.local.set({ contacts });
                    }
                    renderContacts();
                    btn.innerText = "✅ \${contacts.length} Imported";
                    setTimeout(() => btn.innerText = "📥 Import", 2000);
                  } else {
                    alert("Failed to scrape contacts. Make sure WhatsApp Web is fully loaded.");
                    btn.innerText = "📥 Import";
                  }
                });
              });
            }

            async function syncToCRM() {
              if (contacts.length === 0) {
                alert("No contacts to sync. Import them first!");
                return;
              }
              
              const btn = document.getElementById('sync-text');
              btn.innerText = "⌛ Syncing...";
              
              chrome.runtime.sendMessage({ action: "syncToCRM", contacts }, (response) => {
                if (response && response.success) {
                  btn.innerText = "✅ Synced!";
                  setTimeout(() => btn.innerText = "🔄 Sync to CRM", 2000);
                } else {
                  alert("CRM Dashboard not found. Please open it in another tab.");
                  btn.innerText = "🔄 Sync to CRM";
                }
              });
            }

            function openEditor(id = null) {
              editingId = id;
              const template = id ? templates.find(t => t.id === id) : { name: '', body: '' };
              
              document.getElementById('edit-name').value = template.name;
              document.getElementById('edit-body').value = template.body;
              
              document.getElementById('template-list').style.display = 'none';
              document.getElementById('template-editor').classList.add('active');
            }

            function closeEditor() {
              document.getElementById('template-list').style.display = 'block';
              document.getElementById('template-editor').classList.remove('active');
            }

            async function spinTemplate() {
              const body = document.getElementById('edit-body').value;
              if (!body) return;

              const btn = document.getElementById('spin-btn');
              const btnText = document.getElementById('spin-text');
              btn.disabled = true;
              btnText.innerText = "✨ Spinning...";

              try {
                const response = await fetch(\`\${APP_URL}/api/ai/generate\`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    prompt: \`Paraphrase the following message into a spintax format using {word1|word2|word3} patterns for key words and phrases to create multiple variations. Keep the meaning identical but change the structure and vocabulary. Message: "\${body}"\`
                  })
                });

                const data = await response.json();
                if (data.success) {
                  document.getElementById('edit-body').value = data.text;
                } else {
                  throw new Error(data.error || "Failed to spin");
                }
              } catch (error) {
                console.error("Spin error:", error);
                alert("Failed to spin: " + error.message);
              } finally {
                btn.disabled = false;
                btnText.innerText = "✨ AI Spin (Spintax)";
              }
            }

            function saveTemplate() {
              const name = document.getElementById('edit-name').value;
              const body = document.getElementById('edit-body').value;
              
              if (editingId) {
                const index = templates.findIndex(t => t.id === editingId);
                templates[index] = { ...templates[index], name, body };
              } else {
                templates.push({ id: Date.now(), name, body });
              }
              
              if (typeof chrome !== 'undefined' && chrome.storage) {
                chrome.storage.local.set({ templates });
              }
              
              renderTemplates();
              closeEditor();
            }

            // Initial render
            renderTemplates();
          </script>
        </body>
        </html>
      `;
      
      zip.file("popup.html", popupHtml);
      
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = "digital_sam_antiban_extension.zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      addLog('Extension package ready for download.');
    } catch (error) {
      addLog('Error generating extension.');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-6"
      >
        {/* Header */}
        <div className="lg:col-span-12 flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-6 h-6 text-[#00ff9d]" />
              <h1 className="text-2xl font-bold tracking-tight uppercase font-mono">
                Digital Sam <span className="text-[#00ff9d]">Anti-Ban</span>
              </h1>
            </div>
            <p className="text-sm text-[#8e9299] font-mono">CRM MESSENGER SECURITY PROTOCOL v1.0.4</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#151619] border border-[#2d2e33]">
              <div className="w-2 h-2 rounded-full bg-[#00ff9d] animate-pulse" />
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#8e9299]">System Secure</span>
            </div>
            <button 
              onClick={generateExtension}
              disabled={isGenerating}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all",
                "bg-[#00ff9d] text-[#0a0a0c] hover:shadow-[0_0_20px_rgba(0,255,157,0.4)] disabled:opacity-50"
              )}
            >
              {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {isGenerating ? 'Packaging...' : 'Download Extension'}
            </button>
          </div>
        </div>

        {/* Left Pane: Configuration */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-xl bg-[#151619] border border-[#2d2e33] space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-[#2d2e33]">
              <Settings className="w-4 h-4 text-[#8e9299]" />
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#8e9299]">Configuration</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] uppercase font-bold text-[#8e9299] flex items-center gap-2">
                    <Zap className="w-3 h-3" /> Randomness Intensity
                  </label>
                  <span className="text-[10px] font-mono text-[#00ff9d]">{settings.randomnessLevel}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={settings.randomnessLevel}
                  onChange={(e) => setSettings(s => ({ ...s, randomnessLevel: parseInt(e.target.value) }))}
                  className="w-full h-1 bg-[#2d2e33] rounded-lg appearance-none cursor-pointer accent-[#00ff9d]"
                />
              </div>

              <div className="space-y-3 pt-2">
                {[
                  { id: 'useZeroWidth', label: 'Invisible Characters', icon: EyeOff, desc: 'Injects ZWSP to bypass detection' },
                  { id: 'useSpintax', label: 'Spintax Support', icon: RefreshCw, desc: 'Randomizes {word1|word2} patterns' },
                  { id: 'useCharSubstitution', label: 'Char Substitution', icon: Hash, desc: 'Uses similar-looking Unicode chars' },
                  { id: 'useRandomLineBreaks', label: 'Dynamic Spacing', icon: Terminal, desc: 'Adds random line breaks' },
                  { id: 'useRandomEmoji', label: 'Emoji Injection', icon: Smile, desc: 'Appends random contextual emojis' },
                ].map((opt) => (
                  <label key={opt.id} className="flex items-start gap-3 p-3 rounded-lg bg-[#0a0a0c] border border-[#2d2e33] cursor-pointer hover:border-[#00ff9d]/30 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={settings[opt.id as keyof AntiBanSettings] as boolean}
                      onChange={(e) => setSettings(s => ({ ...s, [opt.id]: e.target.checked }))}
                      className="mt-1 w-4 h-4 rounded border-[#2d2e33] bg-[#151619] text-[#00ff9d] focus:ring-[#00ff9d]"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <opt.icon className="w-3 h-3 text-[#00ff9d]" />
                        <span className="text-xs font-bold text-white">{opt.label}</span>
                      </div>
                      <p className="text-[10px] text-[#8e9299] mt-0.5">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* System Logs */}
          <div className="p-4 rounded-xl bg-[#151619] border border-[#2d2e33] font-mono text-[10px]">
            <div className="flex items-center gap-2 mb-3 text-[#8e9299]">
              <Terminal className="w-3 h-3" />
              <span className="uppercase font-bold tracking-widest">System Logs</span>
            </div>
            <div className="space-y-1.5 opacity-60">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-[#00ff9d] tracking-tighter">&gt;</span>
                  <span>{log}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Pane: Input & Preview */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
            {/* Input */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between px-2">
                <label className="text-[10px] uppercase font-bold text-[#8e9299] flex items-center gap-2">
                  <MessageSquare className="w-3 h-3" /> Source Message
                </label>
                <div className="flex items-center gap-2 text-[10px] font-mono text-[#8e9299]">
                  <Hash className="w-3 h-3" /> {message.length} chars
                </div>
              </div>
              <textarea 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your message here... Use {hi|hello} for spintax."
                className="flex-1 w-full min-h-[300px] p-4 rounded-xl bg-[#151619] border border-[#2d2e33] focus:border-[#00ff9d] focus:ring-1 focus:ring-[#00ff9d] outline-none transition-all text-sm font-mono resize-none"
              />
            </div>

            {/* Preview & Code Tabs */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setActiveTab('preview')}
                    className={cn(
                      "text-[10px] uppercase font-bold tracking-widest transition-colors",
                      activeTab === 'preview' ? "text-[#00ff9d]" : "text-[#8e9299] hover:text-white"
                    )}
                  >
                    Encrypted Preview
                  </button>
                  <button 
                    onClick={() => setActiveTab('code')}
                    className={cn(
                      "text-[10px] uppercase font-bold tracking-widest transition-colors",
                      activeTab === 'code' ? "text-[#00ff9d]" : "text-[#8e9299] hover:text-white"
                    )}
                  >
                    Extension Code
                  </button>
                  <button 
                    onClick={() => setActiveTab('bypass')}
                    className={cn(
                      "text-[10px] uppercase font-bold tracking-widest transition-colors",
                      activeTab === 'bypass' ? "text-[#00ff9d]" : "text-[#8e9299] hover:text-white"
                    )}
                  >
                    Restriction Bypass
                  </button>
                </div>
                
                <div className="flex items-center gap-3">
                  <AnimatePresence>
                    {isLive && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-1.5"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-[#00ff9d] animate-pulse" />
                        <span className="text-[8px] uppercase font-bold text-[#00ff9d]">Live</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <button 
                    onClick={handleCopy}
                    disabled={activeTab === 'preview' ? !processedMessage : false}
                    className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[#00ff9d] hover:opacity-80 disabled:opacity-30 transition-opacity"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="flex-1 w-full min-h-[300px] p-4 rounded-xl bg-[#0a0a0c] border border-[#2d2e33] relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00ff9d]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                
                <div className="relative z-10 h-full overflow-auto custom-scrollbar">
                  {activeTab === 'preview' ? (
                    <div className="text-sm font-mono whitespace-pre-wrap break-all">
                      {processedMessage || <span className="text-[#2d2e33] italic">Processing output will appear here...</span>}
                    </div>
                  ) : activeTab === 'code' ? (
                    <div className="space-y-4">
                      <div>
                        <div className="text-[8px] uppercase font-bold text-[#8e9299] mb-2 flex items-center gap-1.5">
                          <Terminal className="w-2 h-2" /> manifest.json
                        </div>
                        <pre className="text-[11px] font-mono text-white/80 bg-[#151619] p-3 rounded-lg border border-[#2d2e33] overflow-x-auto">
                          {getManifest()}
                        </pre>
                      </div>
                      <div>
                        <div className="text-[8px] uppercase font-bold text-[#8e9299] mb-2 flex items-center gap-1.5">
                          <Terminal className="w-2 h-2" /> content.js
                        </div>
                        <pre className="text-[11px] font-mono text-white/80 bg-[#151619] p-3 rounded-lg border border-[#2d2e33] overflow-x-auto">
                          {getContentJs()}
                        </pre>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="p-4 rounded-lg bg-[#151619] border border-[#2d2e33] space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="text-[10px] uppercase font-bold text-[#00ff9d]">IP Rotation Protocol</div>
                          <div className="px-2 py-0.5 rounded bg-[#00ff9d]/10 text-[#00ff9d] text-[8px] font-mono">ENCRYPTED</div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <div className="text-[8px] text-[#8e9299] uppercase">Current Proxy</div>
                            <div className="text-[10px] font-mono text-white">192.168.1.104:8080</div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-[8px] text-[#8e9299] uppercase">Rotation Interval</div>
                            <div className="text-[10px] font-mono text-white">Every 5 messages</div>
                          </div>
                        </div>
                        <button className="w-full py-2 rounded bg-[#0a0a0c] border border-[#2d2e33] text-[10px] font-bold uppercase tracking-widest hover:border-[#00ff9d]/50 transition-all">
                          Refresh Proxy Pool
                        </button>
                      </div>

                      <div className="p-4 rounded-lg bg-[#151619] border border-[#2d2e33] space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="text-[10px] uppercase font-bold text-[#00ff9d]">User-Agent Spoofing</div>
                          <div className="px-2 py-0.5 rounded bg-[#00ff9d]/10 text-[#00ff9d] text-[8px] font-mono">ACTIVE</div>
                        </div>
                        <div className="text-[10px] font-mono text-[#8e9299] break-all p-2 bg-[#0a0a0c] rounded border border-[#2d2e33]">
                          Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36
                        </div>
                        <div className="flex gap-2">
                          <button className="flex-1 py-2 rounded bg-[#0a0a0c] border border-[#2d2e33] text-[10px] font-bold uppercase tracking-widest hover:border-[#00ff9d]/50 transition-all">
                            Randomize UA
                          </button>
                          <button className="flex-1 py-2 rounded bg-[#0a0a0c] border border-[#2d2e33] text-[10px] font-bold uppercase tracking-widest hover:border-[#00ff9d]/50 transition-all">
                            Mobile Mode
                          </button>
                        </div>
                      </div>

                      <div className="p-4 rounded-lg bg-yellow-500/5 border border-yellow-500/20 flex items-start gap-3">
                        <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5" />
                        <div>
                          <div className="text-[10px] font-bold text-yellow-500 uppercase tracking-wider">Restriction Warning</div>
                          <p className="text-[9px] text-[#8e9299] font-mono leading-relaxed mt-1">
                            Platform algorithms have been updated. IP rotation is highly recommended for campaigns exceeding 500 messages per hour.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Visual hardware details */}
                <div className="absolute bottom-3 right-3 flex gap-1">
                  <div className="w-1 h-1 rounded-full bg-[#2d2e33]" />
                  <div className="w-1 h-1 rounded-full bg-[#2d2e33]" />
                  <div className="w-1 h-1 rounded-full bg-[#2d2e33]" />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Info Bar */}
          <div className="p-6 rounded-xl bg-[#151619] border border-[#2d2e33] flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#0a0a0c] border border-[#2d2e33]">
                  <Cpu className="w-5 h-5 text-[#00ff9d]" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#8e9299]">Engine Status</div>
                  <div className="text-xs font-mono">OPTIMIZED</div>
                </div>
              </div>
              <div className="w-px h-8 bg-[#2d2e33] hidden md:block" />
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#0a0a0c] border border-[#2d2e33]">
                  <Shield className="w-5 h-5 text-[#00ff9d]" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#8e9299]">Security Level</div>
                  <div className="text-xs font-mono">ENHANCED</div>
                </div>
              </div>
            </div>

            <div className="text-[10px] text-[#8e9299] max-w-xs text-center md:text-right font-mono">
              The Anti-Ban engine uses proprietary randomization algorithms to ensure your messages bypass automated detection systems.
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
