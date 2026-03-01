# 🎵 Concert Seating - Sistem de Gestionare Bilete

Un sistem modern de gestionare a locurilor pentru concerte, construit cu Next.js, Supabase, și Tailwind CSS. Optimizat pentru mobile și desktop.

## 📋 Caracteristici

### 👨‍💼 Panoul Administrator
- Vizualizare completă a tuturor scaunelor din sala (2 zone × 17 rânduri × 12 scaune)
- Click pe scaune pentru a le dezactiva/activa
- Adăugare informații despre ocupanți
- Interface intuitiv cu highlight pentru scaunul selectat
- Mobile-friendly design

### 👁️ Panoul Viewer
- Vizualizare în timp real a disponibilității locurilor
- Actualizare automată la fiecare 5 secunde
- Statistici live (total, disponibile, ocupate, dezactivate)
- Design responsive pentru telefoane și tablete

### 🧠 Algoritm Inteligent de Alocare
- Grupează familiile împreună (părinții cooriștilor stau unul lângă altul)
- Plasează grupurile pe același rând pentru confort maxim
- Distribuie persoanele singure uniform pentru a balansa zonele
- Preferință pentru rândurile din mijloc (vizibilitate optimă)

## 🏗️ Arhitectură

```
cor/
├── app/
│   ├── admin/          # Pagina administrator
│   ├── viewer/         # Pagina viewer
│   ├── api/            # API routes
│   │   ├── seats/      # Gestionare scaune
│   │   └── allocate-seats/  # Algoritm alocare
│   ├── globals.css     # Stiluri globale
│   ├── layout.tsx      # Layout principal
│   └── page.tsx        # Pagina home
├── lib/
│   ├── supabase.ts     # Client Supabase + Types
│   └── seating-algorithm.ts  # Algoritm smart de alocare
├── supabase-schema.sql # Schema bazei de date
└── package.json
```

## 🚀 Setup & Instalare

### 1. Instalează dependențele

```bash
npm install
```

### 2. Configurare Supabase

1. Creează un cont pe [Supabase](https://supabase.com)
2. Creează un nou proiect
3. În SQL Editor, rulează conținutul din `supabase-schema.sql`
4. Copiază API URL și Anon Key din Settings > API

### 3. Configurare Environment Variables

Creează un fișier `.env.local` în root:

```bash
cp .env.local.example .env.local
```

Editează `.env.local` cu credențialele tale:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_PASSWORD=parola-ta-admin
```

### 4. Rulează aplicația local

```bash
npm run dev
```

Aplicația va fi disponibilă la `http://localhost:3000`

## 🌐 Deploy pe Vercel

### Opțiunea 1: Deploy prin CLI

```bash
npm install -g vercel
vercel
```

### Opțiunea 2: Deploy prin Git

1. Push codul pe GitHub
2. Conectează repository-ul la [Vercel](https://vercel.com)
3. Adaugă Environment Variables în Vercel Dashboard
4. Deploy automat!

### Environment Variables pe Vercel

În Vercel Dashboard > Settings > Environment Variables, adaugă:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_PASSWORD`

## 📱 Design Mobile-Friendly

Aplicația este complet responsive:
- **Desktop**: Layout pe 2 coloane pentru cele 2 zone
- **Tablet**: Layout adaptat cu scaune mai mici
- **Mobile**: Scaune 6x6 pixels, scrollable, optimizat pentru touch

## 🎯 Utilizare

### Pentru Administrator

1. Accesează `/admin`
2. Introdu parola (default: `admin123`)
3. Click pe scaune pentru:
   - Dezactivare/Activare
   - Adăugare informații ocupant
4. Scaunele sunt salvate automat în baza de date

### Pentru Viewer

1. Accesează `/viewer`
2. Vizualizează disponibilitatea în timp real
3. Pagina se actualizează automat la fiecare 5 secunde

### Algoritm de Alocare (API)

```javascript
// Exemplu de utilizare
const groups = [
  { size: 2, name: "Familie 1", info: "Părinți corist 1" },
  { size: 2, name: "Familie 2", info: "Părinți corist 2" },
  { size: 1, name: "Bunic", info: "Bunicul coristului 3" },
]

const response = await fetch('/api/allocate-seats', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ groups })
})

const { allocation } = await response.json()
// allocation = { "Familie 1": [1, 2], "Familie 2": [13, 14], ... }
```

## 🎨 Personalizare Design

Editează `tailwind.config.js` pentru a schimba culorile:

```javascript
theme: {
  extend: {
    colors: {
      primary: '#6366f1',  // Culoarea principală
      secondary: '#8b5cf6', // Culoarea secundară
    },
  },
}
```

## 📊 Schema Bazei de Date

### Tabelul `seats`
- `id`: ID unic
- `zone`: 'A' sau 'B'
- `row_number`: 1-17
- `seat_number`: 1-12
- `is_disabled`: Boolean
- `is_occupied`: Boolean
- `occupant_name`: Numele ocupantului
- `occupant_info`: Informații adiționale

### Tabelul `reservations`
- `id`: ID unic rezervare
- `name`: Numele persoanei
- `group_size`: Numărul de persoane
- `seat_ids`: Array cu ID-urile scaunelor
- `status`: 'confirmed', 'pending', 'cancelled'

## 🔒 Securitate

- Row Level Security (RLS) activat pe Supabase
- Autentificare simplă pentru admin (pentru producție, folosește autentificare reală)
- API Keys stocate în environment variables
- Validare pe server-side

## 🛠️ Tehnologii Folosite

- **Next.js 14** - Framework React
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling responsive
- **Supabase** - Backend și bază de date PostgreSQL
- **Vercel** - Hosting și deployment

## 📝 TODO pentru Producție

- [ ] Implementează autentificare reală (Supabase Auth)
- [ ] Adaugă sistem de rezervări online
- [ ] Implementează plăți online (Stripe)
- [ ] Adaugă export PDF pentru bilete
- [ ] Notificări email pentru confirmări
- [ ] Dashboard cu analytics
- [ ] Sistem de QR code pentru validare bilete

## 🐛 Troubleshooting

**Eroare: "Failed to load seats"**
- Verifică credențialele Supabase în `.env.local`
- Asigură-te că ai rulat `supabase-schema.sql`

**Scaunele nu se actualizează**
- Verifică consola browser pentru erori
- Asigură-te că RLS policies sunt configurate corect

**Probleme pe mobile**
- Clear cache browser
- Verifică că folosești HTTPS (necesar pentru unele features)

## 📧 Contact

Pentru întrebări sau sugestii, deschide un issue pe GitHub.

## 📄 Licență

MIT License - Folosește liber pentru proiectele tale!

---

Made with ❤️ for concert organizers
