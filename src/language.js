import { SpeechRecognition } from '@capgo/capacitor-speech-recognition';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { announce } from './ui.js';

let supportedSpeechLangs = [];
let supportedTTSLangs = [];
let deviceLang = 'en-US';

export async function initLanguages() {
  // 1. Detect the phone's default language (fallback to English if unknown)
  deviceLang = navigator.language || 'en-US';
  
  // 2. Try to get Speech Recognition languages (fails on Android 10, safely handled)
  try {
    const speechRes = await SpeechRecognition.getSupportedLanguages();
    supportedSpeechLangs = speechRes.languages || [];
  } catch (_) {
    console.warn('Could not fetch speech recognition languages (Normal on Android 10/13+)');
  }

  // 3. Try to get Text-to-Speech languages
  try {
    const ttsRes = await TextToSpeech.getSupportedLanguages();
    supportedTTSLangs = ttsRes.languages || [];
  } catch (_) {
    console.warn('Could not fetch TTS languages');
  }
}

export function getDeviceLang() {
  return deviceLang;
}

export async function isTTSLanguageSupported(lang) {
  if (!lang) return false;
  if (supportedTTSLangs.includes(lang)) return true;
  
  // Real-time check if the list was empty
  try {
    const res = await TextToSpeech.isLanguageSupported({ lang });
    return res.supported;
  } catch (_) {
    return false;
  }
}

export async function promptTTSEngineDownload(lang) {
  const msg = `Your phone does not have the voice data for ${lang}. Please go to Settings, search for Text-to-Speech, and install voice data for this language.`;
  announce(msg, { urgent: true });
  
  try {
    // Open the Android TTS install screen automatically
    await TextToSpeech.openInstall();
  } catch (_) {
    console.warn('Could not open TTS install screen');
  }
}

export function getBestSpeechLanguage(requestedLang) {
  if (supportedSpeechLangs.includes(requestedLang)) return requestedLang;
  if (supportedSpeechLangs.includes(deviceLang)) return deviceLang;
  return supportedSpeechLangs[0] || 'en-US';
}