import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { Device } from '@capacitor/device';
import { GroqClient } from './groq.js';
import { ensureMic, startListening, stopListening } from './speech.js';
import { initLanguages, getDeviceLang, getBestSpeechLanguage, isTTSLanguageSupported, promptTTSEngineDownload } from './language.js';
import * as ui from './ui.js';

let groq;
let listening = false;
let starting = false;
let currentRecLang = 'en-US';
const MAX_TTS_LEN = 500;
const HISTORY_KEY = 'echo_chat_history';
let chatHistory = [];

document.addEventListener('DOMContentLoaded', init);

async function init() {
  ui.initUI();
  loadHistory();

  try {
    const info = await Device.getInfo();
    console.log(`Device: ${info.manufacturer} ${info.model}, Android SDK: ${info.androidSDKVersion}`);
  } catch (_) {}

  await initLanguages();
  currentRecLang = getBestSpeechLanguage(getDeviceLang());

  groq = new GroqClient({
    onAnnounce: (m, o) => ui.announce(m, o),
    onUpdate: () => {} 
  });

  ui.getClickOverlay().addEventListener('click', handleTap);

  setTimeout(() => {
    const splash = document.getElementById('splashScreen');
    if (splash) splash.classList.add('hidden');
  }, 1200);

  ui.announce('Echo AI is ready. Tap anywhere to speak, and tap again to stop.');
}

async function handleTap() {
  if (listening) {
    await finishListening();
    return;
  }

  if (starting) return;
  starting = true;
  let ok = false;
  try {
    if (!await ensureMic()) { starting = false; return; }
    ok = await startListening(currentRecLang);
  } finally {
    starting = false;
  }
  
  if (ok) {
    listening = true;
    ui.setStatus('Listening... Tap to stop.');
  }
}

export function onSpeechResult() {}

async function finishListening() {
  if (!listening) return;
  listening = false;
  
  ui.setStatus('Thinking...');
  ui.announce('Thinking.');
  
  // This will now resolve quickly thanks to forceStop
  const txt = await stopListening();
  const finalTxt = txt || ui.getTranscriptText(); 
  
  if (!finalTxt || !finalTxt.trim()) {
    ui.setStatus('Tap anywhere to speak');
    ui.announce('Did not catch that. Tap again.', { urgent: true });
    return;
  }
  
  ui.setTranscript(finalTxt);
  await ask(finalTxt.trim());
}

async function ask(q) {
  try {
    const sysPrompt = `You are Echo AI, a voice assistant for blind users. 
Respond with ONLY a valid JSON object containing: "language" (the BCP-47 code) and "answer" (concise response, under 100 words). No visual references.`;

    const messages = [{ role: 'system', content: sysPrompt }, ...chatHistory, { role: 'user', content: q }];
    const response = await groq.chat(messages);
    
    saveToHistory(q, response.answer);
    
    ui.setStatus('Answer');
    ui.setAnswer(response.answer);
    ui.announce('Answer. ' + response.answer);
    
    const canSpeak = await isTTSLanguageSupported(response.language || 'en-US');
    if (canSpeak) {
      await speak(response.answer, response.language || 'en-US');
    } else {
      await promptTTSEngineDownload(response.language);
      await speak(response.answer, 'en-US'); 
    }
    
  } catch (e) {
    const m = e.message || String(e);
    ui.setStatus('Error');
    ui.announce('Error. ' + m, { urgent: true });
  } finally {
    ui.setStatus('Tap anywhere to speak');
  }
}

async function speak(text, lang) {
  const t = text.length > MAX_TTS_LEN ? text.slice(0, MAX_TTS_LEN) + '...' : text;
  
  // FORCE GOOGLE TTS: Fixes Samsung silence bug
  try {
    await TextToSpeech.speak({ 
      text: t, lang: lang, rate: 0.95, pitch: 1.0, volume: 1.0,
      engine: 'com.google.android.tts' 
    });
    return;
  } catch (_) {}

  // Fallback to default if Google is missing
  try {
    await TextToSpeech.speak({ text: t, lang: lang, rate: 0.95, pitch: 1.0, volume: 1.0 });
  } catch (_) {
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(t);
      u.lang = lang; window.speechSynthesis.speak(u);
    }
  }
}

function loadHistory() {
  const data = localStorage.getItem(HISTORY_KEY);
  if (data) {
    const parsed = JSON.parse(data);
    if (Date.now() - parsed.timestamp < 86400000) chatHistory = parsed.messages || [];
  }
}

function saveToHistory(u, a) {
  chatHistory.push({ role: 'user', content: u }, { role: 'assistant', content: a });
  if (chatHistory.length > 4) chatHistory = chatHistory.slice(-4); // Keep last 2 pairs
  localStorage.setItem(HISTORY_KEY, JSON.stringify({ timestamp: Date.now(), messages: chatHistory }));
}