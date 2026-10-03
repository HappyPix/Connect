/* =====================================================================
   AI HAPPY GURU — Chat Widget Engine
   File: /ai/chat-widget.js

   Self-contained. Injects its own markup into <body> on load, so it
   works even if /ai/chat-ui.html can't be fetched (e.g. opened as a
   local file). Nothing here touches the host page's existing DOM,
   IDs, classes, or globals — everything is namespaced under "aihg".

   Load order:
     <link rel="stylesheet" href="/ai/chat-widget.css">
     ...
     <script src="/ai/config.js"></script>
     <script src="/ai/chat-widget.js" defer></script>
   ===================================================================== */
(function () {
  "use strict";

  const CFG = window.AIHappyGuruConfig || {};
  if (!CFG.brand) {
    console.warn("[AI Happy Guru] config.js not found — widget disabled.");
    return;
  }

  /* ------------------------------------------------------------------
     Safe storage (falls back to in-memory if localStorage is blocked)
     ------------------------------------------------------------------ */
  const memStore = {};
  const store = {
    get(k) { try { return window.localStorage.getItem(k); } catch (e) { return memStore[k] ?? null; } },
    set(k, v) { try { window.localStorage.setItem(k, v); } catch (e) { memStore[k] = v; } }
  };

  /* ------------------------------------------------------------------
     State
     ------------------------------------------------------------------ */
  const state = {
    open: false,
    language: null,
    theme: null,
    listening: false,
    voiceOutputOn: true,
    history: [],
    promptTool: (CFG.promptTools && CFG.promptTools[0]) || "ChatGPT"
  };

  /* ------------------------------------------------------------------
     Language detection
     ------------------------------------------------------------------ */
  function detectLanguage() {
    const saved = store.get("aihg-lang");
    if (saved && CFG.languages.supported.includes(saved)) return saved;

    const nav = (navigator.language || navigator.userLanguage || "en").toLowerCase();
    if (nav.startsWith("mr")) return "mr";
    if (nav.startsWith("hi")) return "hi";
    return "en";
  }

  function t(key) {
    const dict = (CFG.strings[state.language] || CFG.strings.en);
    return dict[key] != null ? dict[key] : (CFG.strings.en[key] || "");
  }
  function labelFor(obj) {
    return obj[state.language] || obj.en;
  }

  /* ------------------------------------------------------------------
     Theme (auto follows host site's body.light class + OS preference)
     ------------------------------------------------------------------ */
  function resolveAutoTheme() {
    if (document.body.classList.contains("light")) return "light";
    if (document.body.classList.contains("dark")) return "dark";
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) return "light";
    return "dark";
  }
  function applyTheme() {
    const mode = state.theme === "auto" ? resolveAutoTheme() : state.theme;
    const root = document.getElementById("aihg-root");
    if (root) root.setAttribute("data-aihg-theme", mode);
  }

  /* ------------------------------------------------------------------
     Build & inject markup
     ------------------------------------------------------------------ */
  function buildMarkup() {
    const b = CFG.brand;
    const wrap = document.createElement("div");
    wrap.id = "aihg-root";
    wrap.innerHTML = `
      <div class="aihg-window" role="dialog" aria-label="${b.name}" aria-modal="false">

        <div class="aihg-header">
          <div class="aihg-avatar">${b.avatar}</div>
          <div class="aihg-header-text">
            <h3>${b.name}</h3>
            <span>${b.subtitle}</span>
          </div>
          <div class="aihg-header-actions">

            <div class="aihg-dropdown" id="aihg-lang-dd">
              <button class="aihg-icon-btn" id="aihg-lang-btn" title="Language" aria-label="Change language">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18"/></svg>
              </button>
              <div class="aihg-dropdown-menu" id="aihg-lang-menu"></div>
            </div>

            <div class="aihg-dropdown" id="aihg-theme-dd">
              <button class="aihg-icon-btn" id="aihg-theme-btn" title="Theme" aria-label="Change theme">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
              </button>
              <div class="aihg-dropdown-menu" id="aihg-theme-menu"></div>
            </div>

            <button class="aihg-icon-btn" id="aihg-close-btn" title="Close" aria-label="Close chat">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><path d="M6 6l12 12M18 6L6 18"/></svg>
            </button>
          </div>
        </div>

        <div class="aihg-body" id="aihg-body"></div>

        <div class="aihg-footer">
          <textarea class="aihg-input" id="aihg-input" rows="1" placeholder=""></textarea>
          <button class="aihg-mic-btn" id="aihg-mic-btn" title="Voice input" aria-label="Voice input">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v1a7 7 0 01-14 0v-1M12 18v4M8 22h8"/></svg>
          </button>
          <button class="aihg-send-btn" id="aihg-send-btn" title="Send" aria-label="Send message">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 20l18-8L3 4v6l12 2-12 2z"/></svg>
          </button>
        </div>
        <div class="aihg-footer-note" id="aihg-footer-note"></div>
      </div>

      <div class="aihg-fab-wrap">
        <div class="aihg-tooltip" id="aihg-tooltip">${b.tooltip}</div>
        <button class="aihg-fab" id="aihg-fab" aria-label="${b.tooltip}">
          <span class="aihg-pulse"></span>
          <span class="aihg-pulse aihg-pulse-2"></span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a5 5 0 015 5v1a5 5 0 01-10 0V8a5 5 0 015-5z"/><path d="M7 13v1a5 5 0 0010 0v-1M4 21c1.5-3 4.2-4 8-4s6.5 1 8 4"/><circle cx="9" cy="9" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="9" r="1" fill="currentColor" stroke="none"/></svg>
          <span class="aihg-fab-dot" id="aihg-fab-dot"></span>
        </button>
      </div>
    `;
    document.body.appendChild(wrap);
  }

  /* ------------------------------------------------------------------
     Rendering helpers
     ------------------------------------------------------------------ */
  function scrollBody() {
    const body = document.getElementById("aihg-body");
    body.scrollTop = body.scrollHeight;
  }

  function addMessage(role, html, opts) {
    opts = opts || {};
    const body = document.getElementById("aihg-body");
    const row = document.createElement("div");
    row.className = "aihg-msg " + (role === "user" ? "aihg-user" : "aihg-bot");
    const avatar = role === "user" ? "🙂" : CFG.brand.avatar;
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    row.innerHTML = `
      <div class="aihg-msg-avatar">${avatar}</div>
      <div>
        <div class="aihg-bubble">${html}</div>
        ${opts.noTime ? "" : `<span class="aihg-msg-time">${time}</span>`}
      </div>`;
    body.appendChild(row);
    scrollBody();

    if (CFG.features.persistHistory && !opts.skipSave) {
      state.history.push({ role, html, t: Date.now() });
      store.set("aihg-history", JSON.stringify(state.history.slice(-40)));
    }
    return row;
  }

  function showTyping() {
    const body = document.getElementById("aihg-body");
    const row = document.createElement("div");
    row.className = "aihg-msg aihg-bot";
    row.id = "aihg-typing-row";
    row.innerHTML = `
      <div class="aihg-msg-avatar">${CFG.brand.avatar}</div>
      <div class="aihg-bubble aihg-typing"><span></span><span></span><span></span></div>`;
    body.appendChild(row);
    scrollBody();
  }
  function hideTyping() {
    const row = document.getElementById("aihg-typing-row");
    if (row) row.remove();
  }

  function botReply(html, opts) {
    showTyping();
    const delay = 550 + Math.random() * 500;
    setTimeout(() => {
      hideTyping();
      addMessage("bot", html, opts);
      if (state.voiceOutputOn && CFG.features.voiceOutput) speak(stripHtml(html));
    }, delay);
  }

  function stripHtml(html) {
    const d = document.createElement("div");
    d.innerHTML = html;
    return d.textContent || d.innerText || "";
  }

  /* ------------------------------------------------------------------
     Welcome message + quick actions
     ------------------------------------------------------------------ */
  function renderWelcome() {
    const menu = CFG.welcomeMenu.map(m => `<li>${labelFor(m)}</li>`).join("");
    addMessage("bot", `
      <strong>${t("welcomeTitle")}</strong><br>
      ${t("welcomeBody")}
      <ul style="margin:8px 0 0 18px;padding:0;line-height:1.7;">${menu}</ul>
    `, { skipSave: true });
    renderQuickActions();
  }

  function renderQuickActions() {
    const body = document.getElementById("aihg-body");
    const wrap = document.createElement("div");
    wrap.className = "aihg-quick";
    wrap.id = "aihg-quick-actions";
    wrap.innerHTML = CFG.quickActions.map(qa =>
      `<button class="aihg-quick-btn" data-action="${qa.action}">${qa.icon} ${labelFor(qa.label)}</button>`
    ).join("");
    body.appendChild(wrap);
    scrollBody();

    wrap.querySelectorAll(".aihg-quick-btn").forEach(btn => {
      btn.addEventListener("click", () => handleAction(btn.dataset.action, btn.textContent.trim()));
    });
  }

  /* ------------------------------------------------------------------
     Action router (quick buttons)
     ------------------------------------------------------------------ */
  function handleAction(action, label) {
    addMessage("user", label);

    if (action.startsWith("link:")) {
      const key = action.split(":")[1];
      const target = CFG.links[key];
      goTo(target);
      botReply(faqReply(key));
      return;
    }

    if (action === "tool:prompt") {
      botReply(t("promptTitle") + " ✨");
      setTimeout(renderPromptGenerator, 650);
      return;
    }

    botReply(t("fallback"));
  }

  function goTo(target) {
    if (!target) return;
    if (/^https?:\/\//i.test(target)) {
      window.open(target, "_blank", "noopener");
      return;
    }
    const el = document.querySelector(target);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  /* ------------------------------------------------------------------
     Prompt Generator
     ------------------------------------------------------------------ */
  function renderPromptGenerator() {
    const body = document.getElementById("aihg-body");
    const card = document.createElement("div");
    card.className = "aihg-msg aihg-bot";
    card.innerHTML = `
      <div class="aihg-msg-avatar">${CFG.brand.avatar}</div>
      <div style="width:100%;">
        <div class="aihg-prompt-card" id="aihg-prompt-card">
          <label>${t("promptToolLabel")}</label>
          <div class="aihg-tool-chip-row" id="aihg-tool-chips">
            ${CFG.promptTools.map(tool =>
              `<button type="button" class="aihg-tool-chip${tool === state.promptTool ? " aihg-active" : ""}" data-tool="${tool}">${tool}</button>`
            ).join("")}
          </div>
          <label>${t("promptIdeaLabel")}</label>
          <textarea class="aihg-textarea" id="aihg-prompt-idea" placeholder="${t("promptIdeaPlaceholder")}"></textarea>
          <button class="aihg-btn-primary" id="aihg-prompt-generate-btn">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l1.9 4.9L19 9l-5.1 1.9L12 16l-1.9-5.1L5 9l5.1-1.1z"/></svg>
            ${t("promptGenerate")}
          </button>
          <div id="aihg-prompt-output-wrap" style="display:none;">
            <div class="aihg-prompt-output" id="aihg-prompt-output"></div>
            <button class="aihg-copy-btn" id="aihg-prompt-copy-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 012-2h10"/></svg>
              ${t("promptCopy")}
            </button>
          </div>
        </div>
      </div>`;
    body.appendChild(card);
    scrollBody();

    card.querySelectorAll(".aihg-tool-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        card.querySelectorAll(".aihg-tool-chip").forEach(c => c.classList.remove("aihg-active"));
        chip.classList.add("aihg-active");
        state.promptTool = chip.dataset.tool;
      });
    });

    card.querySelector("#aihg-prompt-generate-btn").addEventListener("click", () => {
      const idea = card.querySelector("#aihg-prompt-idea").value.trim();
      if (!idea) {
        card.querySelector("#aihg-prompt-idea").focus();
        return;
      }
      const output = buildPrompt(state.promptTool, idea);
      const outWrap = card.querySelector("#aihg-prompt-output-wrap");
      const outBox = card.querySelector("#aihg-prompt-output");
      outBox.textContent = output;
      outWrap.style.display = "flex";
      outWrap.style.flexDirection = "column";
      outWrap.style.gap = "8px";
      scrollBody();
    });

    card.querySelector("#aihg-prompt-copy-btn").addEventListener("click", (e) => {
      const text = card.querySelector("#aihg-prompt-output").textContent;
      copyToClipboard(text);
      const btn = e.currentTarget;
      const original = btn.innerHTML;
      btn.innerHTML = "✓ " + t("promptCopied");
      setTimeout(() => (btn.innerHTML = original), 1600);
    });
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  }
  function fallbackCopy(text) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (e) { /* no-op */ }
    document.body.removeChild(ta);
  }

  /**
   * Builds a tool-tuned prompt from a plain-language idea.
   */
  function buildPrompt(tool, idea) {
    const T = tool.toLowerCase();

    if (T.includes("gemini")) {
      return `Act as a expert creative & research assistant.\n\nTask: ${idea}\n\nInstructions:\n- Think step by step before answering.\n- Ask a clarifying question ONLY if the request is ambiguous.\n- Use clear headings and short paragraphs.\n- Include a brief summary at the end.`;
    }
    if (T.includes("chatgpt")) {
      return `You are an expert assistant.\n\nGoal: ${idea}\n\nFormat:\n- Use headings and bullet points where helpful.\n- Keep tone friendly and professional.\n- Give one concrete example.\n\nConstraints:\n- Be concise but complete.\n- If information is uncertain, say so.`;
    }
    if (T.includes("claude")) {
      return `<task>${idea}</task>\n\nPlease reason through this carefully, step by step, inside <thinking> tags, then give your final answer inside <answer> tags. Keep the final answer clear and well structured for a general audience.`;
    }
    if (T.includes("suno")) {
      return `Song idea: ${idea}\n\n[Genre]: (choose a genre that fits the mood)\n[Mood]: uplifting, cinematic\n[Tempo]: medium\n[Structure]\n[Verse 1]\n(lyrics about ${idea})\n[Chorus]\n(catchy, memorable hook about ${idea})\n[Verse 2]\n[Bridge]\n[Outro]`;
    }
    if (T.includes("runway")) {
      return `Subject: ${idea}\nCamera: slow cinematic dolly-in, shallow depth of field\nLighting: soft golden-hour light\nStyle: photorealistic, high detail, 4K\nMotion: gentle, natural movement\nDuration: 4-6 seconds\nMood: calm, inspiring`;
    }
    if (T.includes("kling")) {
      return `Scene: ${idea}\nCamera motion: smooth tracking shot\nMotion strength: medium\nStyle: cinematic, realistic\nLighting: natural, high contrast\nAspect ratio: 16:9\nExtra: keep faces and hands consistent across frames`;
    }
    if (T.includes("midjourney")) {
      return `${idea}, cinematic lighting, ultra-detailed, professional photography, vibrant colors, trending on artstation --ar 16:9 --style raw --v 6`;
    }
    if (T.includes("leonardo")) {
      return `Prompt: ${idea}\nStyle: digital art, highly detailed, concept-art quality\nLighting: dramatic rim light\nModel suggestion: Leonardo Phoenix / PhotoReal\nNegative prompt: blurry, low quality, extra limbs, watermark`;
    }
    if (T.includes("canva")) {
      return `Design brief: ${idea}\nFormat: social media post (1080x1080)\nColor palette: brand blue, gold accent, dark navy background\nTypography: bold heading + clean sans-serif body\nLayout: centered focal image with short headline and CTA button`;
    }
    if (T.includes("notebooklm")) {
      return `Source material topic: ${idea}\n\nAsk NotebookLM to:\n1. Summarize the key points in plain language.\n2. Generate 5 study questions with answers.\n3. Create an audio overview (podcast style) explaining ${idea} to a beginner.`;
    }
    return `Task: ${idea}\n\nPlease respond in a clear, well-structured way with a short summary at the end.`;
  }

  /* ------------------------------------------------------------------
     Local FAQ / intent engine (AI Course Assistant)
     ------------------------------------------------------------------ */
  const INTENTS = [
    {
      key: "aiMasterClass",
      words: ["master class", "mastarclass", "ai course", "ai class", "syllabus", "मास्टर क्लास", "कोर्स", "मास्टर क्लास"],
      reply: {
        en: `The <strong>AI Master Class Series</strong> is our flagship program covering AI fundamentals, prompt engineering, AI tools and more, with a certification exam at the end. Tap "AI Master Class" above or ask me anything specific!`,
        mr: `<strong>AI मास्टर क्लास सीरीज</strong> हा आमचा मुख्य कोर्स आहे — AI बेसिक्स, प्रॉम्प्ट इंजिनिअरिंग, AI टूल्स आणि शेवटी प्रमाणपत्र परीक्षा. वरील "AI मास्टर क्लास" बटण दाबा किंवा मला विशिष्ट प्रश्न विचारा!`,
        hi: `<strong>AI मास्टर क्लास सीरीज़</strong> हमारा मुख्य प्रोग्राम है — AI बेसिक्स, प्रॉम्प्ट इंजीनियरिंग, AI टूल्स और अंत में प्रमाणपत्र परीक्षा। ऊपर "AI मास्टर क्लास" बटन दबाएँ या मुझसे कोई खास सवाल पूछें!`
      }
    },
    {
      key: "cmFellowship",
      words: ["cm fellowship", "fellowship", "maharashtra 2026", "फेलोशिप"],
      reply: {
        en: `The <strong>CM Fellowship Maharashtra 2026</strong> program is featured on our home page — scroll up to the "About" section for full details, eligibility and how to apply.`,
        mr: `<strong>CM फेलोशिप महाराष्ट्र 2026</strong> प्रोग्रामची माहिती होमपेजवरील "About" सेक्शनमध्ये आहे — पात्रता व अर्जाची प्रक्रिया तिथे पहा.`,
        hi: `<strong>CM फेलोशिप महाराष्ट्र 2026</strong> प्रोग्राम की पूरी जानकारी होमपेज के "About" सेक्शन में है — पात्रता और आवेदन प्रक्रिया वहाँ देखें।`
      }
    },
    {
      key: "mockTest",
      words: ["mock test", "mock exam", "exam", "certification", "quiz", "मॉक टेस्ट", "परीक्षा"],
      reply: {
        en: `We have timed, scored <strong>Mock Exams</strong> with a downloadable certificate on completion. Tap "Mock Test" above to jump right in!`,
        mr: `आमच्याकडे टाइम्ड, स्कोअर्ड <strong>मॉक एक्झाम</strong> आहेत आणि पूर्ण झाल्यावर सर्टिफिकेट मिळते. वरील "मॉक टेस्ट" बटण दाबा!`,
        hi: `हमारे पास टाइम्ड, स्कोर्ड <strong>मॉक एग्ज़ाम</strong> हैं और पूरा करने पर सर्टिफिकेट मिलता है। ऊपर "मॉक टेस्ट" बटन दबाएँ!`
      }
    },
    {
      key: "aiTools",
      words: ["ai tools", "tools directory", "chatgpt", "gemini tool", "टूल्स"],
      reply: {
        en: `Check the <strong>AI Tools Directory</strong> section for image, video, writing, audio and productivity AI tools with direct links — tap "AI Tools" above.`,
        mr: `इमेज, व्हिडिओ, रायटिंग, ऑडिओ आणि प्रॉडक्टिव्हिटी AI टूल्ससाठी <strong>AI टूल्स डिरेक्टरी</strong> सेक्शन पहा — वरील "AI टूल्स" बटण दाबा.`,
        hi: `इमेज, वीडियो, राइटिंग, ऑडियो और प्रोडक्टिविटी AI टूल्स के लिए <strong>AI टूल्स डायरेक्टरी</strong> सेक्शन देखें — ऊपर "AI टूल्स" बटन दबाएँ।`
      }
    },
    {
      key: "learningHub",
      words: ["prompt engineering", "learning hub", "tutorial", "n8n", "ai agent", "प्रॉम्प्ट इंजिनिअरिंग"],
      reply: {
        en: `Our <strong>AI Learning Hub</strong> covers prompt engineering, AI automation, AI agents, n8n, and tutorials for students, teachers & competitive exams.`,
        mr: `आमच्या <strong>AI लर्निंग हब</strong>मध्ये प्रॉम्प्ट इंजिनिअरिंग, AI ऑटोमेशन, AI एजंट्स, n8n आणि विद्यार्थी/शिक्षक/स्पर्धा परीक्षांसाठी ट्यूटोरियल्स आहेत.`,
        hi: `हमारे <strong>AI लर्निंग हब</strong> में प्रॉम्प्ट इंजीनियरिंग, AI ऑटोमेशन, AI एजेंट्स, n8n और छात्र/शिक्षक/प्रतियोगी परीक्षाओं के लिए ट्यूटोरियल शामिल हैं।`
      }
    },
    {
      key: "youtube",
      words: ["youtube", "video", "channel", "subscribe", "यूट्यूब", "व्हिडिओ"],
      reply: {
        en: `Subscribe to our YouTube channel <strong>@AIhappypixels</strong> for the latest videos, shorts & podcasts — tap "YouTube" above.`,
        mr: `नवीन व्हिडिओ, शॉर्ट्स आणि पॉडकास्टसाठी आमचे यूट्यूब चॅनेल <strong>@AIhappypixels</strong> सबस्क्राइब करा — वरील "यूट्यूब" बटण दाबा.`,
        hi: `नए वीडियो, शॉर्ट्स और पॉडकास्ट के लिए हमारा यूट्यूब चैनल <strong>@AIhappypixels</strong> सब्सक्राइब करें — ऊपर "यूट्यूब" बटन दबाएँ।`
      }
    },
    {
      key: "contact",
      words: ["contact", "email", "phone", "support", "help", "संपर्क"],
      reply: {
        en: `You can reach our team through the <strong>Contact</strong> section at the bottom of the page — tap "Contact Us" above.`,
        mr: `पेजच्या शेवटी असलेल्या <strong>Contact</strong> सेक्शनमधून आमच्या टीमशी संपर्क साधा — वरील "Contact Us" बटण दाबा.`,
        hi: `पेज के अंत में मौजूद <strong>Contact</strong> सेक्शन से हमारी टीम से संपर्क करें — ऊपर "Contact Us" बटन दबाएँ।`
      }
    },
    {
      key: "aiNews",
      words: ["news", "latest ai", "update", "न्यूज"],
      reply: {
        en: `AI moves fast! Follow our YouTube channel and this website's updates section for the latest AI news and tool releases.`,
        mr: `AI क्षेत्र वेगाने बदलत आहे! ताज्या AI न्यूज व टूल रिलीजसाठी आमचे यूट्यूब चॅनेल व वेबसाइट अपडेट्स फॉलो करा.`,
        hi: `AI तेज़ी से बदल रहा है! ताज़ा AI न्यूज़ और टूल रिलीज़ के लिए हमारा यूट्यूब चैनल और वेबसाइट अपडेट्स फॉलो करें।`
      }
    },
    {
      key: "greeting",
      words: ["hello", "hi", "hey", "namaste", "नमस्कार", "नमस्ते"],
      reply: {
        en: `Hello! 👋 How can I help you today?`,
        mr: `नमस्कार! 👋 मी आज तुम्हाला कशी मदत करू?`,
        hi: `नमस्ते! 👋 आज मैं आपकी कैसे मदद कर सकता हूँ?`
      }
    },
    {
      key: "thanks",
      words: ["thank", "thanks", "धन्यवाद", "shukriya", "शुक्रिया"],
      reply: {
        en: `You're welcome! 😊 Anything else I can help with?`,
        mr: `स्वागत आहे! 😊 आणखी काही मदत हवी आहे का?`,
        hi: `आपका स्वागत है! 😊 और कुछ मदद चाहिए?`
      }
    }
  ];

  function faqReply(key) {
    const intent = INTENTS.find(i => i.key === key);
    return intent ? labelFor(intent.reply) : t("fallback");
  }

  function matchIntent(text) {
    const lower = text.toLowerCase();
    let best = null, bestScore = 0;
    INTENTS.forEach(intent => {
      intent.words.forEach(w => {
        if (lower.includes(w.toLowerCase()) && w.length > bestScore) {
          best = intent;
          bestScore = w.length;
        }
      });
    });
    return best;
  }

  async function answer(userText) {
    // 1) Try optional remote AI backend (Gemini) if configured
    if (CFG.useGeminiAPI && CFG.gemini && typeof CFG.gemini.generate === "function") {
      try {
        const remote = await CFG.gemini.generate(userText, { language: state.language });
        if (remote) return remote;
      } catch (e) {
        console.warn("[AI Happy Guru] Gemini call failed, using local answers.", e);
      }
    }
    // 2) Local FAQ / intent engine
    const intent = matchIntent(userText);
    if (intent) return labelFor(intent.reply);
    return t("fallback");
  }

  /* ------------------------------------------------------------------
     Sending a message
     ------------------------------------------------------------------ */
  async function sendMessage(text) {
    text = (text || "").trim();
    if (!text) return;
    addMessage("user", escapeHtml(text));
    const input = document.getElementById("aihg-input");
    input.value = "";
    autosizeInput(input);

    showTyping();
    const reply = await answer(text);
    hideTyping();
    addMessage("bot", reply);
    if (state.voiceOutputOn && CFG.features.voiceOutput) speak(stripHtml(reply));
  }

  function escapeHtml(str) {
    const d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
  }

  function autosizeInput(el) {
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 100) + "px";
  }

  /* ------------------------------------------------------------------
     Voice input (Web Speech API)
     ------------------------------------------------------------------ */
  let recognizer = null;
  function initVoiceInput() {
    const micBtn = document.getElementById("aihg-mic-btn");
    if (!CFG.features.voiceInput) { micBtn.style.display = "none"; return; }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      micBtn.addEventListener("click", () => botReply(t("voiceNotSupported")));
      return;
    }

    recognizer = new SR();
    recognizer.continuous = false;
    recognizer.interimResults = false;
    recognizer.maxAlternatives = 1;

    micBtn.addEventListener("click", () => {
      if (state.listening) {
        recognizer.stop();
        return;
      }
      recognizer.lang = state.language === "mr" ? "mr-IN" : state.language === "hi" ? "hi-IN" : "en-US";
      try { recognizer.start(); } catch (e) { /* already started */ }
    });

    recognizer.onstart = () => {
      state.listening = true;
      micBtn.classList.add("aihg-listening");
      document.getElementById("aihg-input").placeholder = t("listening");
    };
    recognizer.onend = () => {
      state.listening = false;
      micBtn.classList.remove("aihg-listening");
      document.getElementById("aihg-input").placeholder = t("inputPlaceholder");
    };
    recognizer.onerror = () => {
      state.listening = false;
      micBtn.classList.remove("aihg-listening");
    };
    recognizer.onresult = (event) => {
      const text = event.results[0][0].transcript;
      const input = document.getElementById("aihg-input");
      input.value = text;
      autosizeInput(input);
      sendMessage(text);
    };
  }

  /* ------------------------------------------------------------------
     Voice output (SpeechSynthesis)
     ------------------------------------------------------------------ */
  function speak(text) {
    if (!("speechSynthesis" in window) || !text) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = state.language === "mr" ? "mr-IN" : state.language === "hi" ? "hi-IN" : "en-US";
      utter.rate = 1;
      window.speechSynthesis.speak(utter);
    } catch (e) { /* no-op */ }
  }

  /* ------------------------------------------------------------------
     Dropdown menus (language / theme)
     ------------------------------------------------------------------ */
  function closeDropdowns(except) {
    document.querySelectorAll(".aihg-dropdown").forEach(dd => {
      if (dd.id !== except) dd.classList.remove("aihg-menu-open");
    });
  }

  function renderLangMenu() {
    const menu = document.getElementById("aihg-lang-menu");
    menu.innerHTML = CFG.languages.supported.map(code =>
      `<button class="aihg-dropdown-item${state.language === code ? " aihg-active" : ""}" data-lang="${code}">${CFG.languages.labels[code]}</button>`
    ).join("");
    menu.querySelectorAll("[data-lang]").forEach(btn => {
      btn.addEventListener("click", () => {
        state.language = btn.dataset.lang;
        store.set("aihg-lang", state.language);
        closeDropdowns();
        refreshLocalizedUI();
      });
    });
  }

  function renderThemeMenu() {
    const menu = document.getElementById("aihg-theme-menu");
    const opts = [
      { id: "auto", label: "Auto", icon: "🌓" },
      { id: "dark", label: "Dark", icon: "🌙" },
      { id: "light", label: "Light", icon: "☀️" }
    ];
    menu.innerHTML = opts.map(o =>
      `<button class="aihg-dropdown-item${state.theme === o.id ? " aihg-active" : ""}" data-theme="${o.id}">${o.icon} ${o.label}</button>`
    ).join("");
    menu.querySelectorAll("[data-theme]").forEach(btn => {
      btn.addEventListener("click", () => {
        state.theme = btn.dataset.theme;
        store.set("aihg-theme", state.theme);
        closeDropdowns();
        applyTheme();
        renderThemeMenu();
      });
    });
  }

  function refreshLocalizedUI() {
    document.getElementById("aihg-input").placeholder = t("inputPlaceholder");
    document.getElementById("aihg-footer-note").textContent = t("footerNote");
    renderLangMenu();
  }

  /* ------------------------------------------------------------------
     Open / close
     ------------------------------------------------------------------ */
  function openChat() {
    const root = document.getElementById("aihg-root");
    root.classList.add("aihg-open");
    state.open = true;
    const dot = document.getElementById("aihg-fab-dot");
    dot.classList.remove("aihg-show");
    store.set("aihg-seen", "1");
    setTimeout(() => document.getElementById("aihg-input").focus(), 300);
  }
  function closeChat() {
    document.getElementById("aihg-root").classList.remove("aihg-open");
    state.open = false;
  }
  function toggleChat() {
    state.open ? closeChat() : openChat();
  }

  /* ------------------------------------------------------------------
     Ripple helper (used on FAB + primary buttons)
     ------------------------------------------------------------------ */
  function attachRipple(el) {
    el.addEventListener("click", function (e) {
      const rect = el.getBoundingClientRect();
      const ripple = document.createElement("span");
      const size = Math.max(rect.width, rect.height);
      ripple.className = "aihg-ripple";
      ripple.style.width = ripple.style.height = size + "px";
      ripple.style.left = (e.clientX - rect.left - size / 2) + "px";
      ripple.style.top = (e.clientY - rect.top - size / 2) + "px";
      el.appendChild(ripple);
      setTimeout(() => ripple.remove(), 650);
    });
  }

  /* ------------------------------------------------------------------
     Wire up events
     ------------------------------------------------------------------ */
  function bindEvents() {
    document.getElementById("aihg-fab").addEventListener("click", toggleChat);
    document.getElementById("aihg-close-btn").addEventListener("click", closeChat);
    attachRipple(document.getElementById("aihg-fab"));

    const input = document.getElementById("aihg-input");
    input.addEventListener("input", () => autosizeInput(input));
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage(input.value);
      }
    });
    document.getElementById("aihg-send-btn").addEventListener("click", () => sendMessage(input.value));

    document.getElementById("aihg-lang-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      const dd = document.getElementById("aihg-lang-dd");
      const willOpen = !dd.classList.contains("aihg-menu-open");
      closeDropdowns();
      if (willOpen) dd.classList.add("aihg-menu-open");
    });
    document.getElementById("aihg-theme-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      const dd = document.getElementById("aihg-theme-dd");
      const willOpen = !dd.classList.contains("aihg-menu-open");
      closeDropdowns();
      if (willOpen) dd.classList.add("aihg-menu-open");
    });
    document.addEventListener("click", () => closeDropdowns());

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && state.open) closeChat();
    });

    // Keep widget theme in sync if the host site's own theme toggle changes
    const bodyObserver = new MutationObserver(() => {
      if (state.theme === "auto") applyTheme();
    });
    bodyObserver.observe(document.body, { attributes: true, attributeFilter: ["class"] });

    if (window.matchMedia) {
      window.matchMedia("(prefers-color-scheme: light)").addEventListener?.("change", () => {
        if (state.theme === "auto") applyTheme();
      });
    }
  }

  /* ------------------------------------------------------------------
     Init
     ------------------------------------------------------------------ */
  function init() {
    state.language = detectLanguage();
    state.theme = store.get("aihg-theme") || CFG.theme.default || "auto";

    buildMarkup();
    applyTheme();
    bindEvents();
    initVoiceInput();

    document.getElementById("aihg-input").placeholder = t("inputPlaceholder");
    document.getElementById("aihg-footer-note").textContent = t("footerNote");
    renderLangMenu();
    renderThemeMenu();

    if (CFG.features.notificationDot && !store.get("aihg-seen")) {
      document.getElementById("aihg-fab-dot").classList.add("aihg-show");
    }

    renderWelcome();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
