let el = {};
export function initUI() {
  el = {
    polite: document.getElementById('lp'),
    assertive: document.getElementById('la'),
    status: document.getElementById('status'),
    transcript: document.getElementById('transcript'),
    answer: document.getElementById('answer'),
    overlay: document.getElementById('clickOverlay')
  };
}
export function announce(msg, { urgent = false } = {}) {
  const t = urgent ? el.assertive : el.polite;
  if (!t) return;
  t.textContent = ''; void t.offsetWidth; t.textContent = msg;
}
export function setStatus(s) { if (el.status) el.status.textContent = s; }
export function setTranscript(s) { if (el.transcript) el.transcript.textContent = s ? 'You: ' + s : ''; }
export function setAnswer(s) { if (el.answer) el.answer.textContent = s || ''; }
export function setBusy(b) { document.body.setAttribute('aria-busy', b ? 'true' : 'false'); }
export function isHandsFree() { return true; } 
export function isVoiceOn() { return true; }
export function getTranscriptText() {
  if (!el.transcript) return '';
  return el.transcript.textContent.replace('You: ', '').trim();
}
export function getClickOverlay() { return el.overlay; }