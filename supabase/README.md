# Supabase setup

Questa cartella contiene la migrazione iniziale proposta per SmileVision Pro.

Passi consigliati:

1. Crea un nuovo progetto su Supabase.
2. Recupera:
   - Project URL
   - anon public key
3. Imposta le variabili in `.env.local` e in Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Applica la migrazione SQL contenuta in `migrations/`.

Nota: il frontend al momento usa ancora uno stub in `src/lib/supabase/client.ts`, quindi il collegamento applicativo va attivato quando vuoi iniziare a usare auth/database reali.

