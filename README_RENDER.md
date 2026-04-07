# Deploying to Render.com

To deploy your Digital Sam CRM to Render, follow these steps:

### 1. Prepare your Repository
1.  Push this entire project to a **GitHub** repository.
2.  Ensure `package.json` and `server.ts` are in the root folder.

### 2. Create a New Web Service on Render
1.  Log in to [Render.com](https://render.com).
2.  Click **New +** > **Blueprint**. (This uses the `render.yaml` file I created for you).
3.  Connect your GitHub repository.
4.  Render will automatically configure everything!

### 3. Manual Configuration (If not using Blueprint)
If you prefer manual setup, use these settings:
*   **Runtime:** `Node`
*   **Build Command:** `npm install && npm run build`
*   **Start Command:** `npm start`

### 4. Add Environment Variables
Click the **Advanced** button or go to the **Environment** tab and add:
*   `NODE_ENV`: `production`
*   `GEMINI_API_KEY`: (Your Google Gemini API Key)

### 5. Deployment
1.  Click **Create Web Service**.
2.  Render will build the app (this takes 2-3 minutes).
3.  Once it says "Live", you will get a URL like `https://digital-sam-crm.onrender.com`.

### Important Notes for Render Free Tier:
*   **Spin Down:** If no one uses the site for 15 minutes, Render will put the server to "sleep." The next person to visit will experience a 30-second delay while it wakes up.
*   **Extension:** After deploying, you **must** open your new Render URL and download the extension again. This ensures the extension knows to send data to Render instead of your local IP.
