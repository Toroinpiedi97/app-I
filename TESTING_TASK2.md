# Task 2 Testing Guide - Hugging Face Integration

## ✅ **Task 2 (OBJ-02) COMPLETATO**

L'integrazione Hugging Face per l'ottimizzazione dei prompt è stata completata con successo!

## 🚀 **Funzionalità Implementate**

### 1. **Servizio Hugging Face** (`src/services/huggingface.ts`)
- ✅ Client API completo per Hugging Face Inference API
- ✅ Retry logic con exponential backoff
- ✅ Gestione rate limiting (429) e model loading (503)
- ✅ Validazione input e output
- ✅ Error handling robusto
- ✅ Configurazione via environment variables

### 2. **IPC Handlers Migliorati** (`src/main.ts`)
- ✅ Handler `prompt/optimize` completamente implementato
- ✅ Handler `comment/generate` implementato
- ✅ Validazione input lato server
- ✅ Error handling e logging
- ✅ Controllo configurazione API key

### 3. **Storico Prompt** (`src/services/promptHistory.ts`)
- ✅ Gestione cronologia prompt (raw + optimized)
- ✅ Tracking utilizzo prompt
- ✅ Ricerca e filtri
- ✅ Persistenza in memoria (future: localStorage)
- ✅ Statistiche utilizzo

### 4. **UI Migliorata** (`src/components/PromptGenerator.tsx`)
- ✅ Feedback visivo (loading, success, error)
- ✅ Validazione input real-time
- ✅ Contatore caratteri (max 500)
- ✅ Cronologia prompt interattiva
- ✅ Gestione errori user-friendly
- ✅ Spinner di loading
- ✅ Messaggi di stato

### 5. **AI Commentator Aggiornato** (`src/components/AICommentator.tsx`)
- ✅ Integrazione reale con Hugging Face
- ✅ Error handling migliorato
- ✅ Feedback messaggi di errore dettagliati

## 🧪 **Come Testare**

### **Setup Prerequisiti**
1. **Ottieni API Key Hugging Face:**
   - Vai su https://huggingface.co/settings/tokens
   - Crea un nuovo token (Read access sufficiente)
   - Copia il token

2. **Configura Environment Variables:**
   ```env
   # Crea file .env nella root del progetto
   HF_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxxxxx
   HF_PROMPT_MODEL=google/flan-t5-base
   HF_INPAINT_MODEL=stabilityai/stable-diffusion-2-inpainting
   HF_COMMENT_MODEL=tiiuae/falcon-7b-instruct
   
   SUPABASE_URL=your_supabase_project_url_here
   SUPABASE_ANON_KEY=your_supabase_anon_key_here
   SUPABASE_BUCKET=images
   ```

### **Test 1: Prompt Generation**
1. Avvia l'app: `npm run electron:dev`
2. Nella **Colonna 1 (Prompt Generator)**:
   - Inserisci un'idea: "A magical forest with glowing trees"
   - Clicca "Generate Prompt"
   - Verifica che appaia il prompt ottimizzato
   - Controlla che appaia il messaggio di successo
   - Verifica che l'item appaia nella cronologia

### **Test 2: Error Handling**
1. **Test senza API Key:**
   - Rimuovi `HF_API_KEY` dal .env
   - Prova a generare un prompt
   - Verifica messaggio errore: "Hugging Face API key not configured"

2. **Test input invalido:**
   - Inserisci solo "a" (< 3 caratteri)
   - Verifica che il pulsante sia disabilitato
   - Inserisci testo > 500 caratteri
   - Verifica messaggio di errore

3. **Test rate limiting simulation:**
   - Genera multipli prompt rapidamente
   - Verifica retry automatico con backoff

### **Test 3: Prompt History**
1. Genera 3-4 prompt diversi
2. Clicca "Show" nella sezione "Recent Prompts"
3. Verifica che tutti i prompt appaiano
4. Clicca su un item della cronologia
5. Verifica che carichi l'idea e il prompt
6. Verifica il segno ✓ per prompt utilizzati
7. Testa "Clear" per pulire la cronologia

### **Test 4: AI Commentator**
1. Nella **Colonna 3 (AI Commentator)**:
   - Inserisci: "Describe this landscape image"
   - Clicca "Send" o "Generate"
   - Verifica che appaia una risposta AI
   - Testa i quick actions (Describe, Style, Improve)

### **Test 5: Integrazione UI**
1. Verifica spinner di loading durante generazione
2. Verifica messaggi di successo/errore
3. Verifica contatore caratteri real-time
4. Verifica footer status indicators
5. Verifica responsive design delle colonne

## 🔧 **Debug e Troubleshooting**

### **Console Logs da Monitorare:**
```bash
# Main Process (Electron DevTools Console)
[IPC] Prompt optimize request: {...}
[HF API] Calling google/flan-t5-base (attempt 1)
[IPC] Prompt optimization successful

# Renderer Process (Browser DevTools Console)
Using prompt: "optimized text here"
```

### **Errori Comuni:**

1. **"HF API Error (429): Rate limit exceeded"**
   - Normale con free tier HF
   - L'app retry automaticamente
   - Attendi qualche secondo

2. **"HF API Error (503): Model loading"**
   - Il modello sta caricando su HF
   - L'app retry automaticamente con delay

3. **"Network error"**
   - Verifica connessione internet
   - Verifica che l'API key sia valida

4. **"Generated prompt too short"**
   - Prova con un'idea più dettagliata
   - Alcuni modelli potrebbero avere output limitato

## 📊 **Metriche di Performance**

- **Tempo risposta medio:** 2-8 secondi (dipende da HF)
- **Rate limit free tier:** ~1000 requests/month
- **Max caratteri input:** 500
- **Max cronologia:** 50 prompt
- **Retry attempts:** 3 con exponential backoff

## 🎯 **Prossimi Step (Task 3)**

Con il Task 2 completato, il prossimo obiettivo è **OBJ-03: Canvas + mask drawing con react-konva**:

1. Implementare canvas Konva nella colonna Image Editor
2. Gestione upload e preview immagini
3. Tools per drawing (brush, select, erase)
4. Generazione maschere per inpainting
5. Export maschere in formato PNG

## ✅ **Stato Completamento**

- **Task 1 (OBJ-01):** ✅ Setup base Electron + React + Layout
- **Task 2 (OBJ-02):** ✅ Integrazione Hugging Face completata
- **Task 3 (OBJ-03):** 🚧 Prossimo: Canvas + mask drawing
- **Task 4-10:** ⏳ In pianificazione

L'app è ora pronta per l'implementazione del canvas editing e inpainting!
