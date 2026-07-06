

# 🚀 Digital Sam CRM & Anti-Ban System

An enterprise-ready, full-stack CRM and anti-detection orchestration system built specifically for WhatsApp Web and modern messaging platforms. This system bridges the gap between customer engagement automation and strict platform safety by combining a real-time web dashboard with a powerful, dynamic Chrome browser extension.

---

## 🌟 Key Features

| Feature | Category | Functional Description |
| --- | --- | --- |
| **Real-time Dashboard** | Management | Monitor connected extension nodes, track execution statistics, and view aggregated system logs instantly. |
| **Contact Management** | Data Sync | Efficiently scrape, filter, and synchronize communication contacts directly from the WhatsApp Web client. |
| **Anti-Ban Engine** | Security | On-the-fly generation of tailored Chrome extensions with deep fingerprint obfuscation. |
| **AI Rephrasing** | Optimization | Embedded Google Gemini AI integration to rewrite messaging copy dynamically, minimizing behavioral signatures. |

---

### 🛡️ Advanced Anti-Detection Capabilities

* **Invisible Fingerprinting:** Randomizes Canvas, WebGL, and AudioContext browser characteristics to break tracking patterns.
* **Unicode Substitution:** Exchanges standard text with secure lookalike homoglyphs to alter message cryptographic hashes without changing readability.
* **Spintax Support:** Native parsing of nested syntax setups (e.g., `{Hello\|Hi\|Greetings}`) to enforce messaging entropy.
* **User-Agent Spoofing:** Periodically rotates high-reputation, native-looking browser agent strings across active nodes.

---

## 💻 Local Hosting Instructions

Follow these instructions to host the control dashboard server on a local machine.

### Prerequisites

* **Node.js** (v18.0.0 or higher recommended)
* **npm** (Bundled natively with Node.js)

### Step-by-Step Setup

1. **Extract the Project:**
Unpack the downloaded project repository ZIP archive into your local workspace directory.
2. **Install Required Packages:**
Open a terminal app (Command Prompt, PowerShell, or Terminal), navigate to the root directory, and run:
```bash
npm install

```


3. **Configure Environment Variables:**
Create a file named `.env` in the root folder (or duplicate `.env.example`) and append your Gemini credentials:
```env
GEMINI_API_KEY=your_actual_api_key_here
PORT=3000

```


4. **Launch the Application:**
* **For Development** *(Includes hot-reloading)*:
```bash
npm run dev

```


* **For Production** *(Optimized for speed and stability)*:
```bash
npm run build
npm start

```




5. **Access the Interface:**
Launch your browser and navigate to: `http://localhost:3000`

---

## 🌐 Multi-Laptop Architecture Setup

Scale operations horizontally by linking multiple user laptops back to your primary command workstation.

```
       [ Central Server Host ]
          (IP: 192.168.1.5)
                 ▲
        _________|_________
       |                   |
[ Node Laptop 1 ]   [ Node Laptop 2 ]

```

1. Identify the **Local IPv4 Address** of your primary server laptop (e.g., `192.168.1.5`).
2. Open a browser on any secondary client laptop over the same local network and visit: `http://192.168.1.5:3000`.
3. Download the extension payload **directly from that connected IP endpoint** so each node retains correct structural routing back to the master server.

---

## 🧩 Chrome Extension Installation

1. Open the system dashboard interface in your browser.
2. Navigate to the **Anti-Ban Tool** management tab.
3. Select **Download Extension (.zip)** to pull down your compiled workspace.
4. Extract the contents of that downloaded ZIP file.
5. In Google Chrome, type and enter `chrome://extensions/` in the URL bar.
6. Toggle the **Developer Mode** switch located in the top-right corner.
7. Click **Load unpacked** in the upper left, then pick the root directory of your extracted extension folder.

---

## 🚀 Cloud Deployment Guidelines

When deploying this orchestration system out to live cloud networks (e.g., AWS, Google Cloud, Heroku, or Vercel):

> ⚠️ **Critical Deployment Considerations:**
> * Ensure your environment variables strictly flag `NODE_ENV=production`.
> * By default, the underlying server binds to `0.0.0.0` on port `3000`. Verify that your host or cloud proxy layer handles traffic routing smoothly to this port.
> 
> 

---

## ✍️ Authorship & Professional Details

* **Samuel Praise** * *Role:* Software Engineer & AI Architect
* *Credentials:* MIT (In View), MBA
