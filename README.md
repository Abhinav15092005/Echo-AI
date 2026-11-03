::: {align="center"}
# 👁️ Echo AI

### Voice Assistant for Blind & Visually Impaired Users

**Your voice. Your assistant. A more accessible digital experience.**

[![Platform](https://img.shields.io/badge/Platform-Android-3DDC84?logo=android&logoColor=white)](https://www.android.com/)
[![Capacitor](https://img.shields.io/badge/Capacitor-7-119EFF?logo=capacitor&logoColor=white)](https://capacitorjs.com/)
[![AI](https://img.shields.io/badge/AI-Groq%20API-F55036)](https://groq.com/)
[![Security](https://img.shields.io/badge/API%20Keys-Server--Side%20Only-success)](https://www.cloudflare.com/workers/)
:::

------------------------------------------------------------------------

## 📖 About

**Echo AI** is an accessible, voice-first Android application designed
specifically for blind and visually impaired users.

The app minimizes the need for visual interaction: **tap anywhere on the
screen to start speaking, then tap again to stop and hear the AI's
response.**

Built with Capacitor and Vanilla JavaScript, and powered by Groq's AI
API, Echo AI aims to provide a lightweight, battery-efficient, and
secure voice-assistant experience.

## ✨ Key Features

  -----------------------------------------------------------------------
  Feature                             What it does
  ----------------------------------- -----------------------------------
  **Zero Visual Dependency**          The screen works as one large
                                      interaction area. Tap once to start
                                      listening and tap again to stop.

  **Multi-Language Support**          Automatically detects the user's
                                      language and responds in the same
                                      language, including English, Hindi,
                                      and many more.

  **TalkBack Optimized**              Supports Android's native screen
                                      reader through ARIA live regions.

  **Secure API Handling**             Routes requests through a
                                      Cloudflare Worker proxy. The APK
                                      contains no Groq API keys.

  **Smart Memory**                    Keeps the last 2 exchanges (4
                                      messages) for conversational
                                      context and automatically clears
                                      them after 24 hours.

  **Graceful Error Handling**         If the text-to-speech engine is
                                      unavailable, the app provides
                                      spoken guidance to help resolve the
                                      issue.
  -----------------------------------------------------------------------

## 📱 Android Compatibility

  Requirement                   Details
  ----------------------------- ------------------------------------------------
  **Minimum Android version**   Android 8.0 (API level 26)
  **Recommended versions**      Android 10--Android 15
  **Hardware**                  Microphone and speaker
  **Software**                  Google Speech Services (usually pre-installed)

### ⚙️ First-Time Setup

Echo AI uses your phone's native speech engines. If voice output is not
working, check the following settings:

1.  Open **Settings** on your Android phone.
2.  Search for **Text-to-Speech Output**.
3.  Set the preferred engine to **Google Speech Services**.
4.  Make sure English or your preferred language's voice data is
    downloaded.

> **Note:** If the required text-to-speech engine or voice data is
> missing, the app is designed to guide you through the issue using
> voice prompts.

## 🧰 Technology Stack

  ---------------------------------------------------------------------------
  Layer                               Technology
  ----------------------------------- ---------------------------------------
  **Frontend**                        HTML5, Vanilla CSS, JavaScript (bundled
                                      with Esbuild)

  **Native framework**                Capacitor 7

  **Speech recognition**              `@capgo/capacitor-speech-recognition`

  **Text-to-speech**                  `@capacitor-community/text-to-speech`

  **Device integration**              `@capacitor/device`

  **AI backend**                      Groq API --- `openai/gpt-oss-120b`

  **Security layer**                  Cloudflare Workers proxy, with secure
                                      rotation of 6 Groq API keys
  ---------------------------------------------------------------------------

## 🏗️ Architecture at a Glance

``` text
Android Device
     │
     ▼
Echo AI App
(Capacitor + JavaScript)
     │
     ├── Speech Recognition
     │
     ▼
Cloudflare Worker Proxy
     │
     ├── Secure API-key injection
     ├── API-key rotation
     │
     ▼
Groq AI API
     │
     ▼
AI Response
     │
     ▼
Text-to-Speech on Device
```

## 🚀 Build the Android APK

> **No Android Studio required for the documented build workflow.** The
> project uses GitHub Actions to build the APK.

1.  **Fork or clone** this repository.
2.  Make your desired code changes.
3.  Commit and push your changes to the `main` branch.
4.  Open the repository's **Actions** tab on GitHub.
5.  Select the latest **Build Android APK** workflow.
6.  Find the **Artifacts** section and download `Echo-AI-APK.zip`.
7.  Extract the ZIP file to get `app-debug.apk`, then install it on your
    Android device.

## 🔐 Security

-   The APK does **not** contain Groq API keys.
-   Requests are routed through a **Cloudflare Worker**, which injects
    API keys on the server side.
-   The Worker is described as rotating 6 Groq API keys securely.

This keeps secret API credentials out of the publicly shared APK. Keep
the Worker configuration and API credentials private.

## 💙 Project

::: {align="center"}
**Built with ❤️ to make AI more accessible to everyone.**

[⬆ Back to top](#-echo-ai)
:::
