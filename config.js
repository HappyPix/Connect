/* Public website settings only. Never put API keys or private secrets in this file. */
window.CONNECT_HAPPYPIX_CONFIG = {
  /* Set this to your deployed Cloudflare Worker URL, e.g. https://connect-happypix-agent.YOURNAME.workers.dev */
  AI_ENDPOINT: "PASTE_YOUR_CLOUDFLARE_WORKER_URL_HERE",
  /* Optional Apps Script web-app URL. Keep blank if the Worker is configured with SHEETS_WEB_APP_URL secret. */
  LEADS_ENDPOINT: ""
};