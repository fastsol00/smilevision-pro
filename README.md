# SmileVision Pro

Applicazione frontend basata su Vite + React + TanStack Start.

## Setup locale

1. Installa le dipendenze:

```bash
npm install
```

2. Crea il file `.env.local` partendo da `.env.example` e inserisci le chiavi Supabase.

3. Avvia il progetto:

```bash
npm run dev
```

## Deploy su Vercel

Questa app usa TanStack Start con Nitro, che e' la configurazione consigliata da Vercel per questo stack.

- Framework preset: lasciare l'auto-detect di Vercel
- Install command: `npm install`
- Build command: `npm run build`
- Non impostare manualmente una output directory

Variabili ambiente da configurare in Vercel:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Supabase

Il client Supabase e' gia' presente nel progetto e si attiva automaticamente quando imposti:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Per completare il collegamento di autenticazione e database bisogna:

1. creare un progetto Supabase
2. impostare le env pubbliche nel frontend e in Vercel
3. applicare la migrazione iniziale contenuta in `supabase/migrations/`
4. collegare auth e query reali nelle schermate che oggi usano dati demo/locali
