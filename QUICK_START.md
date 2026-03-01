# 🚀 GHID DE START RAPID

## Pasul 1: Instalare Dependențe

```bash
cd /home/micu/Desktop/cor
npm install
```

## Pasul 2: Configurare Supabase

### A. Creare Proiect Supabase
1. Mergi la https://supabase.com și creează cont
2. Click pe "New Project"
3. Alege un nume (ex: "concert-seating")
4. Alege o parolă pentru database
5. Alege regiunea (Europe/Frankfurt pentru best latency)
6. Așteaptă ~2 minute pentru setup

### B. Rulare Schema SQL
1. În dashboard Supabase, mergi la "SQL Editor"
2. Click "New Query"
3. Copiază tot conținutul din `supabase-schema.sql`
4. Paste în editor și click "Run"
5. ✅ Ar trebui să vezi mesajul "Success. No rows returned"

### C. Obține API Keys
1. Mergi la Settings > API
2. Copiază:
   - Project URL
   - anon (public) key
   - service_role key

## Pasul 3: Configurare .env.local

Editează fișierul `.env.local` și înlocuiește cu valorile tale:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
ADMIN_PASSWORD=admin123
```

## Pasul 4: Pornește Aplicația

```bash
npm run dev
```

Accesează: http://localhost:3000

## Pasul 5: Testare

### Test Admin:
1. Click "Administrator"
2. Parola: `admin123` (sau ce ai setat în .env.local)
3. Click pe scaune pentru a le modifica

### Test Viewer:
1. Click "Viewer"
2. Vezi statusul în timp real

### Test Alocare:
1. Click "Alocare Inteligentă"
2. Adaugă câteva grupuri (ex: 2 persoane, 1 persoană, 3 persoane)
3. Click "Alocă Locuri Inteligent"
4. Vezi sugestiile algoritmului

## Troubleshooting Rapid

### Eroare: "Failed to load seats"
```bash
# Verifică connection la Supabase
# Asigură-te că ai rulat supabase-schema.sql
```

### Eroare: Module not found
```bash
npm install
# sau
rm -rf node_modules package-lock.json
npm install
```

### Portul 3000 e ocupat
```bash
# Oprește procesul sau folosește alt port
npm run dev -- -p 3001
```

## Deploy pe Vercel (5 minute)

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel

# 4. Adaugă environment variables când îți cere
# Sau adaugă-le manual în dashboard
```

## Funcționalități Principale

✅ Panoul Administrator - Gestionare completă scaune
✅ Panoul Viewer - Vizualizare real-time
✅ Algoritm Inteligent - Alocare optimă pentru familii
✅ Mobile Responsive - Perfect pe telefon
✅ Auto-refresh - Actualizeză automat la 5s
✅ 408 locuri totale (2 zone × 17 rânduri × 12 scaune)

## Next Steps (Opțional)

1. Schimbă parola admin în `.env.local`
2. Personalizează culorile în `tailwind.config.js`
3. Adaugă logo-ul tău în `app/page.tsx`
4. Configurează custom domain pe Vercel

## Suport

Orice problemă? Verifică:
1. Console browser (F12) pentru erori JavaScript
2. Terminal pentru erori Node.js
3. Supabase Dashboard > Logs pentru erori database

---

🎉 Succes cu concertul!
