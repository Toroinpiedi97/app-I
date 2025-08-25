# AIDesktop Image Suite

## Progetto
**Nome:** AIDesktop Image Suite  
**Descrizione:** App Electron con 3 sezioni verticali: creazione prompt (T2T), editor immagini con selezione regioni + inpainting, e commenti AI (T2T). Persistenza cloud via Supabase.  
**Versione:** 0.1.0

## Tech Stack
- **Frontend:** React 19 + TypeScript + TailwindCSS
- **Desktop:** Electron 30
- **Build:** Vite 6
- **AI:** Hugging Face Inference API
- **Backend:** Supabase (Auth + Storage + PostgreSQL)
- **UI:** react-resizable-panels, react-konva

## Architettura
- **Main Process:** Electron main + IPC handlers + HF API calls
- **Renderer Process:** React app con 3 colonne resizable
- **Communication:** IPC sicuro via preload script
- **State:** React hooks + servizi locali

## Flussi di Lavoro
### 1. Prompt Generation
**Obiettivo:** Trasforma idea grezza in prompt ottimizzato per editing immagini  
**Tool:** ipc:prompt/optimize, HF text_to_text  
**Flusso:**
1. Renderer raccoglie ideaText
2. Renderer invia ipc:prompt/optimize con {ideaText, temperature}
3. Main process valida e chiama HF API
4. Main process restituisce {optimizedPrompt}
5. Renderer mostra prompt e lo salva in cronologia

### 2. Image Inpainting
**Obiettivo:** Applica AI inpainting su regioni selezionate  
**Tool:** ipc:image/inpaint, HF stable-diffusion-2-inpainting  
**Flusso:**
1. Renderer carica immagine e crea maschera
2. Renderer invia ipc:image/inpaint con {imageBase64, maskBase64, prompt}
3. Main process chiama HF inpainting API
4. Main process restituisce {imageBufferBase64, meta}
5. Renderer aggiorna immagine con risultato

### 3. AI Commentary
**Obiettivo:** Genera descrizioni e commenti AI per immagini  
**Tool:** ipc:comment/generate, HF text_to_text  
**Flusso:**
1. Renderer raccoglie prompt utente
2. Renderer invia ipc:comment/generate con {prompt, context}
3. Main process chiama HF comment API
4. Main process restituisce {text}
5. Renderer mostra commento AI

## Obiettivi di Sviluppo (Cronologico)
### OBJ-01: Bootstrap Electron + React + Tailwind + 3 columns ✅
**Tipo:** setup  
**Tool:** Electron, Vite, Tailwind, react-resizable-panels  
**Dipendenze:** nessuna  
**Status:** COMPLETATO

### OBJ-02: Integrazione Hugging Face per prompt optimization ✅
**Tipo:** feature  
**Tool:** Hugging Face Inference API, IPC  
**Dipendenze:** OBJ-01  
**Status:** COMPLETATO
- ✅ Servizio HF API con retry logic e exponential backoff
- ✅ IPC handlers per prompt/optimize e comment/generate
- ✅ Sistema cronologia prompt con tracking utilizzo
- ✅ UI migliorata con feedback, validazione e error handling
- ✅ Gestione rate limiting e model loading automatica

### OBJ-03: Canvas + mask drawing con react-konva 🚧
**Tipo:** feature  
**Tool:** react-konva, Konva, canvas API  
**Dipendenze:** OBJ-02  
**Status:** PROSSIMO
- [ ] Implementare canvas Konva nella colonna Image Editor
- [ ] Gestione upload e preview immagini
- [ ] Tools per drawing (brush, select, erase, rectangle, lasso)
- [ ] Generazione maschere per inpainting
- [ ] Export maschere in formato PNG

### OBJ-04: Inpainting via HF API ⏳
**Tipo:** feature  
**Tool:** HF stable-diffusion-2-inpainting, sharp  
**Dipendenze:** OBJ-03  
**Status:** IN PIANIFICAZIONE

### OBJ-05: Download/export PNG/JPG/WebP ⏳
**Tipo:** feature  
**Tool:** sharp, electron dialog  
**Dipendenze:** OBJ-04  
**Status:** IN PIANIFICAZIONE

### OBJ-06: AI Commentator completo ⏳
**Tipo:** feature  
**Tool:** HF text_to_text, chat UI  
**Dipendenze:** OBJ-02  
**Status:** IN PIANIFICAZIONE

### OBJ-07: Supabase auth ⏳
**Tipo:** feature  
**Tool:** Supabase client, auth UI  
**Dipendenze:** OBJ-06  
**Status:** IN PIANIFICAZIONE

### OBJ-08: Supabase storage + DB persistence ⏳
**Tipo:** feature  
**Tool:** Supabase storage, PostgreSQL  
**Dipendenze:** OBJ-07  
**Status:** IN PIANIFICAZIONE

### OBJ-09: Gallery view ⏳
**Tipo:** feature  
**Tool:** Grid layout, lazy loading  
**Dipendenze:** OBJ-08  
**Status:** IN PIANIFICAZIONE

### OBJ-10: Distribuzione app Electron ⏳
**Tipo:** deployment  
**Tool:** electron-builder, code signing  
**Dipendenze:** OBJ-09  
**Status:** IN PIANIFICAZIONE

## Configurazione Ambiente
```env
# Hugging Face API Configuration
HF_API_KEY=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
HF_PROMPT_MODEL=google/flan-t5-base
HF_INPAINT_MODEL=stabilityai/stable-diffusion-2-inpainting
HF_COMMENT_MODEL=tiiuae/falcon-7b-instruct

# Supabase Configuration
SUPABASE_URL=your_supabase_project_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_BUCKET=images
```

## Comandi di Sviluppo
```bash
# Sviluppo web (solo React)
npm run dev

# Build main process Electron
npm run build:main

# Build completo (main + renderer)
npm run build:all

# Sviluppo Electron
npm run electron:dev

# Build produzione
npm run electron:build

# Distribuzione
npm run dist
```

## Struttura Progetto
```
src/
├── components/           # Componenti React UI
│   ├── PromptGenerator.tsx  ✅ Prompt generation + cronologia
│   ├── ImageEditor.tsx      🚧 Canvas + drawing tools
│   └── AICommentator.tsx    ✅ AI commentary + chat
├── services/             # Servizi business logic
│   ├── huggingface.ts       ✅ HF API integration
│   └── promptHistory.ts     ✅ Cronologia prompt
├── config/
│   └── env.ts              ✅ Configurazione ambiente
├── main.ts                 ✅ Electron main process
├── preload.ts              ✅ IPC bridge
└── renderer.tsx            ✅ React entry point
```

## Stato Attuale
- **Task 1-2:** ✅ Completati e testabili
- **Task 3:** 🚧 Prossimo: Canvas editing
- **Task 4-10:** ⏳ In pianificazione

L'app è ora completamente funzionale per prompt generation e AI commentary, pronta per l'implementazione del canvas editing!
