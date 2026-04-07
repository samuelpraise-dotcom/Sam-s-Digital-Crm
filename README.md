# Digital Sam CRM & Anti-Ban System

This is a full-stack CRM and Anti-Ban system designed for WhatsApp Web and other messaging platforms. It includes a real-time dashboard, contact management, and a powerful Chrome extension.

## Features

- **Real-time Dashboard:** Monitor active extension nodes, system stats, and logs.
- **Contact Management:** Scrape, sync, and manage contacts from WhatsApp Web.
- **Anti-Ban Tool:** Generate a custom Chrome extension with advanced anti-detection features:
  - Invisible Fingerprinting
  - Unicode Substitution
  - Spintax Support
  - User-Agent Spoofing
- **AI Rephrasing:** Integrated Gemini AI for rephrasing messages to avoid detection.

## Local Hosting Instructions

To host this server on your own machine (laptop/desktop), follow these steps:

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)

### Setup

1. **Extract the Project:**
   If you downloaded this as a ZIP, extract it to a folder on your computer.

2. **Install Dependencies:**
   Open your terminal (Command Prompt, PowerShell, or Terminal), navigate to the project folder, and run:
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory (you can copy `.env.example`) and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

4. **Run the Server:**
   For development (with auto-reload):
   ```bash
   npm run dev
   ```
   For production (faster and more stable):
   ```bash
   npm run build
   npm start
   ```

5. **Access the Dashboard:**
   Open your browser and go to `http://localhost:3000`.

### Multi-Laptop Setup

To connect multiple laptops to one central dashboard:
1. Find the **Local IP** of your server laptop (e.g., `192.168.1.5`).
2. Access the dashboard from other laptops using `http://[IP-ADDRESS]:3000`.
3. Download the extension **from that IP address** on each laptop so it knows where to sync.

## Chrome Extension Installation

1. Open the Dashboard in your browser.
2. Navigate to the **Anti-Ban Tool** tab.
3. Click **Download Extension (.zip)**.
4. Extract the downloaded ZIP file.
5. Open Chrome and go to `chrome://extensions`.
6. Enable **Developer Mode** (top right).
7. Click **Load unpacked** and select the extracted folder.

## Deployment

To publish this app to the web (e.g., Google Cloud, Heroku, Vercel):
1. Ensure `NODE_ENV` is set to `production`.
2. The server binds to `0.0.0.0` on port `3000` by default.
