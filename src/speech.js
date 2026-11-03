import { SpeechRecognition } from '@capgo/capacitor-speech-recognition';
import { announce, setStatus, setTranscript } from './ui.js';

let lastTxt = '';
let stoppedResolve = null;

export async function ensureMic() {
  try {
    const s = await SpeechRecognition.checkPermissions();
    if (s.speechRecognition === 'granted') return true;
    
    const r = await SpeechRecognition.requestPermissions();
    if (r.speechRecognition === 'granted') return true;
    
    announce('Microphone permission denied. Please ask a sighted helper to enable Microphone permission for Echo AI in Android Settings.', { urgent: true });
    return false;
  } catch (_) {
    announce('Could not check microphone permission. Please restart.', { urgent: true });
    return false;
  }
}

export async function startListening(language = 'en-US') {
  try {
    const av = await SpeechRecognition.available();
    if (!av.available) { 
      announce('Speech recognition is not available. Please install Google Speech Services.', { urgent: true }); 
      return false; 
    }
    
    await SpeechRecognition.removeAllListeners();
    lastTxt = ''; // Reset text
    stoppedResolve = null;

    // 1. Capture text in real-time here
    await SpeechRecognition.addListener('partialResults', d => {
      const t = d.matches?.[0] || '';
      if (t) { 
        lastTxt = t; 
        setTranscript(t); 
      }
    });
    
    // 2. When the engine stops, resolve the promise with lastTxt
    await SpeechRecognition.addListener('listeningState', d => {
      if (d.status === 'stopped' && stoppedResolve) { 
        const r = stoppedResolve; 
        stoppedResolve = null; 
        r(lastTxt); // Use the variable we saved, not getLastPartialResult()
      }
    });
    
    await SpeechRecognition.start({
      language: language, 
      maxResults: 1, 
      prompt: 'Listening...',
      partialResults: true, 
      popup: false
    });
    
    setStatus('Listening... Tap to stop.');
    return true;
    
  } catch (_) {
    announce('Could not start listening. Please try again.', { urgent: true });
    return false;
  }
}

export async function stopListening() {
  try { 
    // forceStop tries to stop the engine. If it fails, the timeout in main.js 
    // or the listeningState listener should eventually catch it.
    await SpeechRecognition.forceStop({ timeout: 1000 }); 
  } catch (_) {}

  const txt = await new Promise(res => {
    // If the listeningState listener already fired, use lastTxt immediately
    if (!stoppedResolve) { 
      res(lastTxt); 
      return; 
    }
    // Otherwise, wait for the listener to fire
    stoppedResolve = t => { stoppedResolve = null; res(t); };
  });
  
  await SpeechRecognition.removeAllListeners();
  return txt;
}