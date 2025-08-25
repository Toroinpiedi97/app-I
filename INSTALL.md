# AIDesktop Image Suite - Installation Guide

## Prerequisiti

- Node.js 18+ 
- npm 9+
- Git

## Installazione

1. **Clona il repository**
   ```bash
   git clone <repository-url>
   cd aidesktop-image-suite
   ```

2. **Installa le dipendenze**
   ```bash
   npm install
   ```

3. **Configura le variabili d'ambiente**
   
   Crea un file `.env` nella root del progetto con le seguenti variabili:
   ```env
   # Hugging Face API Configuration
   HF_API_KEY=your_huggingface_api_key_here
   HF_PROMPT_MODEL=google/flan-t5-base
   HF_INPAINT_MODEL=stabilityai/stable-diffusion-2-inpainting
   HF_COMMENT_MODEL=tiiuae/falcon-7b-instruct

   # Supabase Configuration
   SUPABASE_URL=your_supabase_project_url_here
   SUPABASE_ANON_KEY=your_supabase_anon_key_here
   SUPABASE_BUCKET=images
   ```

## Sviluppo

### Modalità Sviluppo (Web)
```bash
npm run dev
```
L'app sarà disponibile su `http://localhost:5173`

### Modalità Sviluppo (Electron)
```bash
npm run electron:dev
```
Questo avvia sia il server Vite che l'app Electron

### Build
```bash
npm run build
```

### Esecuzione Electron
```bash
npm run electron
```

## Distribuzione

### Build per distribuzione
```bash
npm run dist
```

Questo creerà gli eseguibili per Windows, macOS e Linux nella cartella `release/`.

## Struttura del Progetto

```
aidesktop-image-suite/
├── src/
│   ├── components/          # Componenti React
│   │   ├── PromptGenerator.tsx
│   │   ├── ImageEditor.tsx
│   │   └── AICommentator.tsx
│   ├── main.ts             # Processo principale Electron
│   ├── preload.ts          # Script preload per IPC
│   ├── renderer.tsx        # Entry point React
│   ├── App.tsx             # Componente principale
│   ├── index.css           # Stili Tailwind
│   └── config/
│       └── env.ts          # Configurazione ambiente
├── dist/                   # Build output
├── package.json            # Configurazione npm
├── vite.config.ts          # Configurazione Vite
├── tailwind.config.js      # Configurazione Tailwind
├── tsconfig.json           # Configurazione TypeScript
└── README.md               # Documentazione progetto
```

## Funzionalità Implementate

### ✅ Task 1 (OBJ-01): Setup Base
- [x] Progetto Electron + React + TypeScript
- [x] Layout a 3 colonne resizable
- [x] Styling con TailwindCSS
- [x] Componenti placeholder per tutte le colonne
- [x] Configurazione IPC tra renderer e main process
- [x] Build system con Vite

### 🚧 Prossimi Task
- [ ] Task 2: Integrazione Hugging Face per prompt optimization
- [ ] Task 3: Canvas + mask drawing con react-konva
- [ ] Task 4: Inpainting via HF API
- [ ] Task 5: Download/export immagini
- [ ] Task 6: AI Commentator
- [ ] Task 7: Supabase auth
- [ ] Task 8: Supabase storage + DB
- [ ] Task 9: Gallery view

## Troubleshooting

### Errori comuni

1. **"Cannot find module"**
   - Esegui `npm install` per installare le dipendenze

2. **Errori TypeScript**
   - Verifica che `tsconfig.json` sia configurato correttamente
   - Esegui `npm run build` per verificare la compilazione

3. **App Electron non si avvia**
   - Verifica che `main.ts` sia compilato correttamente
   - Controlla i log nella console per errori

4. **Problemi con TailwindCSS**
   - Verifica che `tailwind.config.js` sia configurato
   - Assicurati che `src/index.css` importi Tailwind

## Sviluppo

### Aggiungere nuovi componenti
1. Crea il file nella cartella `src/components/`
2. Esporta il componente come default
3. Importalo in `App.tsx` o nel componente padre

### Aggiungere nuovi IPC handlers
1. Aggiungi l'handler in `src/main.ts`
2. Esponi la funzione in `src/preload.ts`
3. Usa `window.electronAPI.functionName()` nel renderer

### Styling
- Usa le classi TailwindCSS predefinite
- Aggiungi stili personalizzati in `src/index.css` con `@layer components`

## Contribuire

1. Fork il repository
2. Crea un branch per la feature (`git checkout -b feature/nome-feature`)
3. Commit le modifiche (`git commit -am 'Aggiungi feature'`)
4. Push al branch (`git push origin feature/nome-feature`)
5. Crea una Pull Request

## Licenza

ISC License
