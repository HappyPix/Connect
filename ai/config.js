/* =====================================================================
   AI HAPPY GURU — CONFIGURATION
   File: /ai/config.js

   Everything the chat widget shows or says lives in this one file —
   branding, links, quick actions, the Prompt Generator's tool list,
   the multi-language UI strings, and the future Gemini API hook.

   Load this BEFORE chat-widget.js:
     <script src="ai/config.js"></script>
     <script src="ai/chat-widget.js" defer></script>
===================================================================== */
window.AIHappyGuruConfig = {

  /* ---------------- Brand ---------------- */
  brand: {
    name: "AI Happy Guru",
    avatar: "🤖",
    tooltip: "Ask AI Happy Guru",
    subtitle: "Your AI Learning Assistant"
  },

  /* ---------------- Feature toggles ---------------- */
  features: {
    notificationDot: true,   // small dot on the launcher until first opened
    persistHistory: true,    // remember chat history in this browser
    voiceInput: true,        // microphone button (Web Speech API)
    voiceOutput: true        // speak bot replies aloud (SpeechSynthesis)
  },

  /* ---------------- Theme ---------------- */
  theme: {
    default: "auto"          // "dark" | "light" | "auto"
    // "auto" follows the host page's body.light / body.dark class first,
    // then falls back to the OS/browser color-scheme preference.
  },

  /* ---------------- Languages ---------------- */
  languages: {
    supported: ["en", "hi", "mr"],
    labels: { en: "English", hi: "हिंदी", mr: "मराठी" }
  },

  /* ---------------------------------------------------------------
     Site links used by the quick-reply buttons.
     Paths are relative to whichever page the widget is loaded on —
     same convention the rest of the site already uses. If you add
     the widget to a page inside a sub-folder, adjust these (or
     prefix with "../") for that page.
  ----------------------------------------------------------------*/
  links: {
    home:          "index.html",
    about:         "#about",
    courses:       "#courses",
    exams:         "#exams",
    aiTools:       "#tools",
    learningHub:   "#learning-hub",
    videos:        "#videos",
    founder:       "#founder",
    contact:       "#contact",
    aiMasterClass: "mock-exams/AI_Happy_Pixels_Certification_Exam.html",
    cmFellowship:  "mock-exams/CM_Fellowship_Program_2026_Quiz.html",
    mockTest:      "mock-exams/CM_Fellowship_Program_2026_Quiz.html",
    youtube:       "https://www.youtube.com/@AIhappypixels"
  },

  /* ---------------- Quick-reply buttons shown after the welcome message ---------------- */
  quickActions: [
    { action: "link:aiMasterClass", icon: "🎓", label: { en: "AI Master Class",  hi: "AI मास्टर क्लास",  mr: "AI मास्टर क्लास" } },
    { action: "link:cmFellowship",  icon: "🏛️", label: { en: "CM Fellowship",    hi: "CM फेलोशिप",       mr: "CM फेलोशिप" } },
    { action: "link:mockTest",      icon: "📝", label: { en: "Mock Test",        hi: "मॉक टेस्ट",         mr: "मॉक टेस्ट" } },
    { action: "tool:prompt",        icon: "✨", label: { en: "Prompt Generator", hi: "प्रॉम्प्ट जनरेटर",   mr: "प्रॉम्प्ट जनरेटर" } },
    { action: "link:aiTools",       icon: "🧰", label: { en: "AI Tools",         hi: "AI टूल्स",          mr: "AI टूल्स" } },
    { action: "link:youtube",       icon: "▶️", label: { en: "YouTube",          hi: "यूट्यूब",           mr: "यूट्यूब" } },
    { action: "link:contact",       icon: "✉️", label: { en: "Contact Us",       hi: "संपर्क करें",        mr: "संपर्क करा" } }
  ],

  /* ---------------- Welcome message bullet list ---------------- */
  welcomeMenu: [
    { en: "AI Master Class",      hi: "AI मास्टर क्लास",     mr: "AI मास्टर क्लास" },
    { en: "CM Fellowship",        hi: "CM फेलोशिप",          mr: "CM फेलोशिप" },
    { en: "Mock Tests",           hi: "मॉक टेस्ट",            mr: "मॉक टेस्ट" },
    { en: "AI Tools",             hi: "AI टूल्स",             mr: "AI टूल्स" },
    { en: "Prompt Engineering",   hi: "प्रॉम्प्ट इंजीनियरिंग", mr: "प्रॉम्प्ट इंजिनिअरिंग" },
    { en: "YouTube Videos",       hi: "यूट्यूब वीडियो",       mr: "यूट्यूब व्हिडिओ" },
    { en: "AI News",              hi: "AI समाचार",            mr: "AI बातम्या" },
    { en: "Contact",              hi: "संपर्क",               mr: "संपर्क" }
  ],

  /* ---------------- Prompt Generator: target AI platforms ---------------- */
  promptTools: [
    "ChatGPT", "Google Gemini", "Claude", "Suno AI", "Runway",
    "Kling", "MidJourney", "Leonardo AI", "Canva AI", "NotebookLM"
  ],

  /* ---------------------------------------------------------------
     UI strings — one object per language. Every key here is looked
     up by chat-widget.js via t("key"); missing keys fall back to
     English automatically, so partial translations are safe.
  ----------------------------------------------------------------*/
  strings: {
    en: {
      welcomeTitle: "Hello 👋",
      welcomeBody: "Welcome to AI Happy Pixels. I can help you with:",
      inputPlaceholder: "Type your message…",
      footerNote: "AI Happy Guru can make mistakes — please verify important info.",
      promptTitle: "Prompt Generator",
      promptToolLabel: "Which AI tool is this prompt for?",
      promptIdeaLabel: "What do you want to create?",
      promptIdeaPlaceholder: "e.g. a 60-second reel explaining prompt engineering for students",
      promptGenerate: "Generate Prompt",
      promptCopy: "Copy prompt",
      promptCopied: "Copied!",
      fallback: "I'm still learning that one! Try one of the quick options above, or ask about the AI Master Class, CM Fellowship, Mock Tests, AI Tools or our YouTube channel.",
      listening: "Listening…",
      voiceNotSupported: "Voice input isn't supported in this browser — try Chrome or Edge."
    },
    hi: {
      welcomeTitle: "नमस्ते 👋",
      welcomeBody: "AI Happy Pixels में आपका स्वागत है। मैं आपकी मदद कर सकता हूँ:",
      inputPlaceholder: "अपना संदेश लिखें…",
      footerNote: "AI Happy Guru से गलती हो सकती है — ज़रूरी जानकारी की पुष्टि कर लें।",
      promptTitle: "प्रॉम्प्ट जनरेटर",
      promptToolLabel: "यह प्रॉम्प्ट किस AI टूल के लिए है?",
      promptIdeaLabel: "आप क्या बनाना चाहते हैं?",
      promptIdeaPlaceholder: "जैसे: छात्रों के लिए प्रॉम्प्ट इंजीनियरिंग समझाने वाली 60-सेकंड की रील",
      promptGenerate: "प्रॉम्प्ट बनाएँ",
      promptCopy: "प्रॉम्प्ट कॉपी करें",
      promptCopied: "कॉपी हो गया!",
      fallback: "मैं अभी यह सीख रहा हूँ! ऊपर दिए गए विकल्पों में से कोई चुनें, या AI मास्टर क्लास, CM फेलोशिप, मॉक टेस्ट, AI टूल्स या हमारे यूट्यूब चैनल के बारे में पूछें।",
      listening: "सुन रहा हूँ…",
      voiceNotSupported: "इस ब्राउज़र में वॉइस इनपुट सपोर्ट नहीं है — Chrome या Edge आज़माएँ।"
    },
    mr: {
      welcomeTitle: "नमस्कार 👋",
      welcomeBody: "AI Happy Pixels मध्ये आपले स्वागत आहे. मी तुम्हाला मदत करू शकतो:",
      inputPlaceholder: "तुमचा संदेश टाइप करा…",
      footerNote: "AI Happy Guru कडून चूक होऊ शकते — महत्त्वाची माहिती स्वतः पडताळून पहा.",
      promptTitle: "प्रॉम्प्ट जनरेटर",
      promptToolLabel: "हा प्रॉम्प्ट कोणत्या AI टूलसाठी आहे?",
      promptIdeaLabel: "तुम्हाला काय तयार करायचे आहे?",
      promptIdeaPlaceholder: "उदा. विद्यार्थ्यांसाठी प्रॉम्प्ट इंजिनिअरिंग समजावणारी 60-सेकंदाची रील",
      promptGenerate: "प्रॉम्प्ट तयार करा",
      promptCopy: "प्रॉम्प्ट कॉपी करा",
      promptCopied: "कॉपी झाले!",
      fallback: "मी अजूनही हे शिकत आहे! वरील पर्यायांपैकी एक निवडा, किंवा AI मास्टर क्लास, CM फेलोशिप, मॉक टेस्ट, AI टूल्स किंवा आमच्या यूट्यूब चॅनेलबद्दल विचारा.",
      listening: "ऐकत आहे…",
      voiceNotSupported: "या ब्राउझरमध्ये व्हॉइस इनपुट सपोर्ट नाही — Chrome किंवा Edge वापरून पहा."
    }
  },

  /* ---------------------------------------------------------------
     FUTURE API INTEGRATION POINT — Google Gemini
     ---------------------------------------------------------------
     The assistant works fully offline out of the box (rule-based
     course FAQ in chat-widget.js + template-based Prompt Generator).
     To switch on live AI answers instead of / on top of the local
     FAQ:

       1. Get an API key: https://aistudio.google.com/app/apikey
          (For production, don't ship the key in client JS — proxy
          this call through a small server or a Cloudflare Worker
          that holds the key server-side instead.)

       2. Set useGeminiAPI to true below.

       3. Fill in gemini.generate() so it calls the Gemini API, e.g.:

            gemini: {
              generate: async function (userText, opts) {
                const key = "YOUR_API_KEY";
                const model = "gemini-1.5-flash";
                const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
                const res = await fetch(url, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    contents: [{ parts: [{ text: userText }] }],
                    systemInstruction: {
                      parts: [{ text: "You are AI Happy Guru, a friendly assistant for the AI Happy Pixels education website. Answer in " + opts.language + "." }]
                    }
                  })
                });
                const data = await res.json();
                return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
              }
            }

          chat-widget.js already calls this automatically (with a
          safe fallback to the local FAQ if the call fails) — no
          other code changes are needed.
  ----------------------------------------------------------------*/
  useGeminiAPI: false,
  gemini: {
    generate: null   // replace with the async function shown above
  }
};
