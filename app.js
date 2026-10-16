(() => {
"use strict";
const cfg = window.CONNECT_HAPPYPIX_CONFIG || {};
const chat = document.getElementById("chat"), form = document.getElementById("chatForm");
const message = document.getElementById("message"), status = document.getElementById("status");
const lang = document.getElementById("language"), speakToggle = document.getElementById("speakToggle");
let speakReplies = true, recognition = null, busy = false;
const labels = {
 "en-IN": {hello:"Hello! Welcome to Connect Happypix. I can help with AI automation services, custom quotations, and free AI learning resources. What would you like to explore?",thinking:"Thinking…",fallback:"I’m having trouble reaching the AI service right now. Please try again, or contact us on WhatsApp at +91 9960641173.",mic:"Microphone ready. Speak now.",unsupported:"Speech recognition is not supported in this browser. Try a recent version of Chrome.",consent:"Please provide consent before sending your enquiry.",leadok:"Thank you! Your enquiry was sent. Our team will follow up.",leaderr:"Could not confirm submission. Please try again or contact us on WhatsApp.",setup:"AI is not configured yet. Please contact us on WhatsApp."},
 "mr-IN": {hello:"नमस्कार! Connect Happypix मध्ये आपले स्वागत आहे. AI ऑटोमेशन सेवा, कोटेशन आणि मोफत AI शिक्षण संसाधनांबद्दल मी मदत करू शकतो. आपण काय जाणून घेऊ इच्छिता?",thinking:"विचार करत आहे…",fallback:"सध्या AI सेवेशी संपर्क होत नाही. कृपया पुन्हा प्रयत्न करा किंवा +91 9960641173 वर WhatsApp करा.",mic:"मायक्रोफोन सुरू आहे. आता बोला.",unsupported:"या ब्राउझरमध्ये आवाज ओळख उपलब्ध नाही. अद्ययावत Chrome वापरून पहा.",consent:"चौकशी पाठवण्यापूर्वी संमती द्या.",leadok:"धन्यवाद! आपली चौकशी पाठवली आहे. आमची टीम संपर्क करेल.",leaderr:"चौकशी पाठवल्याची खात्री करता आली नाही. WhatsApp वर संपर्क करा.",setup:"AI अजून कॉन्फिगर केलेले नाही. कृपया WhatsApp वर संपर्क करा."},
 "hi-IN": {hello:"नमस्ते! Connect Happypix में आपका स्वागत है। मैं AI ऑटोमेशन सेवाओं, कोटेशन और मुफ्त AI सीखने के संसाधनों के बारे में मदद कर सकता हूँ। आप क्या जानना चाहेंगे?",thinking:"सोच रहा हूँ…",fallback:"अभी AI सेवा से संपर्क नहीं हो पा रहा है। फिर कोशिश करें या +91 9960641173 पर WhatsApp करें।",mic:"माइक्रोफ़ोन तैयार है। अब बोलें।",unsupported:"इस ब्राउज़र में स्पीच रिकग्निशन उपलब्ध नहीं है। नया Chrome आज़माएँ।",consent:"अपनी पूछताछ भेजने से पहले सहमति दें।",leadok:"धन्यवाद! आपकी पूछताछ भेज दी गई है। हमारी टीम संपर्क करेगी।",leaderr:"भेजने की पुष्टि नहीं हो सकी। कृपया WhatsApp पर संपर्क करें।",setup:"AI अभी कॉन्फ़िगर नहीं है। कृपया WhatsApp पर संपर्क करें."}
};
function t(k){return (labels[lang.value]||labels["en-IN"])[k]||labels["en-IN"][k]}
function add(text,who="bot"){const el=document.createElement("div");el.className="msg "+who;el.textContent=text;chat.appendChild(el);chat.scrollTop=chat.scrollHeight;return el}
function speak(text){if(!speakReplies||!("speechSynthesis" in window))return;window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang=lang.value;u.rate=1;window.speechSynthesis.speak(u)}
function setBusy(v){busy=v;document.getElementById("send").disabled=v;status.textContent=v?t("thinking"):"Ready to help."}
async function ask(text){
 if(!text.trim()||busy)return;add(text,"user");message.value="";setBusy(true);
 try{
   const endpoint=cfg.AI_ENDPOINT||"";
   if(!endpoint.startsWith("https://")){add(t("setup"));return;}
   const history=[...chat.querySelectorAll(".msg")].slice(-12).map(el=>({role:el.classList.contains("user")?"user":"assistant",content:el.textContent}));
   // Current user message is already in history; backend receives the compact conversation.
   const res=await fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"chat",language:lang.value,messages:history})});
   if(!res.ok)throw new Error("AI request failed");
   const data=await res.json();const reply=String(data.reply||"").slice(0,6000)||t("fallback");add(reply);speak(reply);
 }catch(e){add(t("fallback"));}finally{setBusy(false);}
}
form.addEventListener("submit",e=>{e.preventDefault();ask(message.value)});
document.getElementById("clear").addEventListener("click",()=>{chat.innerHTML="";add(t("hello"));status.textContent="Ready to help.";if(window.speechSynthesis)window.speechSynthesis.cancel()});
lang.addEventListener("change",()=>{add(t("hello"));});
speakToggle.addEventListener("click",()=>{speakReplies=!speakReplies;speakToggle.textContent=speakReplies?"🔊 Voice replies on":"🔇 Voice replies off";speakToggle.setAttribute("aria-pressed",String(speakReplies));if(!speakReplies&&window.speechSynthesis)window.speechSynthesis.cancel()});
function initRecognition(){
 const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(!SR){status.textContent=t("unsupported");return null;}
 const r=new SR();r.lang=lang.value;r.interimResults=false;r.continuous=false;
 r.onstart=()=>status.textContent=t("mic");
 r.onresult=e=>{const transcript=e.results[0][0].transcript;message.value=transcript;ask(transcript)};
 r.onerror=e=>{status.textContent="Voice input: "+e.error};
 r.onend=()=>{if(!busy)status.textContent="Ready to help."};
 return r;
}
document.getElementById("listen").addEventListener("click",()=>{recognition=initRecognition();if(recognition){try{recognition.start()}catch(e){status.textContent="Voice input is already active."}}});
document.getElementById("stopVoice").addEventListener("click",()=>{if(recognition)recognition.stop();if(window.speechSynthesis)window.speechSynthesis.cancel();status.textContent="Voice stopped."});
document.getElementById("leadForm").addEventListener("submit",async e=>{
 e.preventDefault();const out=document.getElementById("leadStatus");if(!document.getElementById("consent").checked){out.textContent=t("consent");return}
 const payload={action:"lead",language:lang.value,name:document.getElementById("name").value.trim(),phone:document.getElementById("phone").value.trim(),business:document.getElementById("business").value.trim(),city:document.getElementById("city").value.trim(),need:document.getElementById("need").value,details:document.getElementById("details").value.trim(),consent:true,source:"Connect Happypix website AI agent",submittedAt:new Date().toISOString()};
 if(!payload.name||!payload.phone){out.textContent="Please enter your name and mobile number.";return}
 const endpoint=(cfg.LEADS_ENDPOINT||"").trim();
 const worker=(cfg.AI_ENDPOINT||"").trim();
 const url=endpoint||worker;
 if(!url.startsWith("https://")){out.textContent=t("setup");return}
 const btn=document.getElementById("leadSubmit");btn.disabled=true;out.textContent="Sending…";
 try{
  const res=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(endpoint?payload:{...payload,action:"lead"})});
  if(!res.ok)throw new Error("Submit failed");
  const data=await res.json().catch(()=>({ok:true}));
  if(data.ok===false)throw new Error("Submit failed");
  out.textContent=t("leadok");out.classList.add("success");document.getElementById("leadForm").reset();
 }catch(err){out.textContent=t("leaderr")+" You can use WhatsApp below.";out.classList.remove("success")}
 finally{btn.disabled=false}
});
})();