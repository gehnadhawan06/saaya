# Saaya 🧭  
**An AI companion that guides elderly users step-by-step through their smartphone tasks via secure screen sharing and simple voice instructions.**  

---

## ✨ Features  

### 🔹 Core Functions  
- **Screen Sharing:** `ScreenShare.tsx`  
- **Tutorial Overlays:** `TutorialOverlay.tsx`  
- **AI Assistance:**  
  - `VoiceCommand.tsx`  
  - `geminiService.ts`  
- **Forms:** Built with **React Hook Form** in `Create` and `Settings`  
- **Styling:** Tailwind CSS utilities  
- **API Layer** for communication  

---

### 🔹 Backend (Node.js + Express, ESM)  
- **Server:** `server.ts` (boot, CORS, JSON)  
- **Routes:** GET, POST, CRUD endpoints  
- **Services:**  
  - `ai.service.ts` → wraps Gemini via `@google/generative-ai`  
  - `tutorials.service.ts` → in-memory or JSON-based storage  
- **Adapters:**  
  - `gemini.adapter.ts` → initializes Gemini model with API key  

---

## 📱 User-Centric Features  
- **Simple & Accessible Help**  
  - Big buttons  
  - Voice guidance  

---

- **Accessibility First:**  
  - Large fonts  
  - High contrast  
  - Voice prompts  
  - Optimized for low-end Android devices  

---
