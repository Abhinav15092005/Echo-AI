import { CapacitorHttp } from '@capacitor/core';
import { PRIMARY_MODEL } from './generated/env.js';

// Your secure Cloudflare Worker URL
const WORKER_URL = 'https://echo-ai-proxy.abhinavpandey068.workers.dev/';

export class GroqClient {
  constructor({ onAnnounce, onUpdate }) {
    this.onAnnounce = onAnnounce;
    this.model = PRIMARY_MODEL || 'openai/gpt-oss-120b';
    
    // Notify UI that the pool is ready (mocking 6 keys for the UI)
    if (onUpdate) {
      onUpdate([
        { name: 'Cloudflare Secure Proxy', remainingRequests: 6000, limitRequests: 6000, invalid: false, cooldownUntil: 0 }
      ]);
    }
  }

  async chat(messages, { maxTokens = 300, temperature = 0.3 } = {}) {
    try {
      // Send request directly to your Cloudflare Worker
      const res = await CapacitorHttp.post({
        url: WORKER_URL,
        headers: { 
          'Content-Type': 'application/json' 
        },
        data: { 
          model: this.model, 
          messages, 
          temperature, 
          max_tokens: maxTokens, 
          stream: false 
        },
        connectTimeout: 15000, // 15 seconds to connect
        readTimeout: 30000     // 30 seconds to wait for AI response
      });

      const st = +res.status;

      // Handle Errors
      if (st !== 200) {
        const errMsg = res.data?.error || `HTTP Error ${st}`;
        this.onAnnounce(`AI Error: ${errMsg}`, { urgent: true });
        throw new Error(errMsg);
      }

      // Parse successful response
      const txt = res.data?.choices?.[0]?.message?.content?.trim();
      if (!txt) throw new Error('The AI returned an empty response.');

      // Parse the JSON response (Language + Answer)
      try {
        const jsonStart = txt.indexOf('{');
        const jsonEnd = txt.lastIndexOf('}');
        
        if (jsonStart !== -1 && jsonEnd !== -1) {
          const cleanJson = txt.slice(jsonStart, jsonEnd + 1);
          return JSON.parse(cleanJson);
        }
        throw new Error('No JSON found');
      } catch (_) {
        // If the AI forgot to return JSON, fallback to English text
        console.warn('AI failed to return JSON, falling back.', txt);
        return { language: 'en-US', answer: txt };
      }

    } catch (e) {
      // Catch network timeouts or crashes
      if (e.message.includes('timeout')) {
        this.onAnnounce('Network timeout. Please check your internet connection.', { urgent: true });
      }
      throw e;
    }
  }
}