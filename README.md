# ep-router ⚡

> Puzzle game strategico di routing di rete, traffic engineering e mitigazione DDoS edge a 60 FPS, sviluppato in **Vue 3** e servito ad altissime prestazioni su **Cloudflare Pages**.

[![Live App](https://img.shields.io/badge/Live%20App-ep--router.pages.dev-f97316?style=flat&logo=cloudflare)](https://ep-router.pages.dev)
[![GitHub](https://img.shields.io/badge/GitHub-MCR300400%2Fep--router-181717?style=flat&logo=github)](https://github.com/MCR300400/ep-router)
[![Hosting](https://img.shields.io/badge/Hosting-Cloudflare%20Pages-orange?style=flat&logo=cloudflare)](https://pages.cloudflare.com/)

---

## 🚀 Caratteristiche Principali

- 🌐 **Traffic Routing all'Edge**: Traccia collegamenti in fibra ottica in tempo reale per instradare pacchetti tra PoP globali (Milano, Londra, Tokyo, Francoforte, Virginia) e destinazioni centrali.
- ⚡ **Edge Cache (Cloudflare KV/CDN)**: Assorbi le richieste statiche HTTP a 0ms di latenza originaria evitando il buffer overflow del server.
- 🛡️ **Mitigazione DDoS & Cloudflare WAF**: Riconosci i pacchetti maligni SYN Flood (rossi) e neutralizzali con le regole WAF prima che impattino l'SLA della rete.
- ⚖️ **Load Balancing & Sharding Protocolli**: Distribuisci il carico su cluster specializzati:
  - 🟢 **HTTP GET**: Web Origin Server & Edge Cache.
  - 🟣 **SQL Query**: Database Cluster D1.
  - 🟠 **Media Asset**: R2 Object Storage.
  - 🔴 **SYN Flood DDoS**: Cloudflare WAF.
- 🎮 **Motore Canvas 2D a 60 FPS**: Simulazione fluida con anelli di decadimento TTL, contatori di buffer bloat, testi di score fluttuanti ed effetti particellari.
- 📱 **Mobile & Touch-First Responsive**: Controlli touch unificati (tap-to-connect o drag), coordinate responsive percentuali adattive per qualsiasi risoluzione (mobile portrait, tablet, desktop 4K).
- 🔊 **Sintetizzatore Web Audio API**: Suoni ed effetti procedurali generati al volo via codice (nessun file audio esterno da scaricare, latenza zero).
- 🎨 **Design System Artigianale Esclusivamente Scuro**: Palette grafite minerale (`#121316`) con accento arancione artigianale (`#f97316` / `#ea580c`), perfettamente allineata alla suite `ep-portfolio`, `ep-board` ed `ep-algorithms`.
- 🔒 **Privacy-First Analytics**: Telemetria integrata con `ep-analytics` e contatore visitatori unici. Zero cookie, zero profilazione, conformità totale GDPR.

---

## 🛠️ Stack Tecnologico

- **Frontend**: [Vue 3](https://vuejs.org/) (Composition API con `<script setup>`)
- **Bundler & Build Tool**: [Vite 6](https://vite.dev/)
- **Grafica & Animazioni**: HTML5 Canvas 2D nativo ad alte prestazioni con calcolo Retina DPR
- **Audio Engine**: Web Audio API procedurale nativa
- **Hosting**: [Cloudflare Pages](https://pages.cloudflare.com/) (Edge globale a latenza minima)
- **Metriche**: Modulo telemetria integrato con SQLite Cloudflare D1 (`ep-analytics`)

---

## 💻 Sviluppo Locale

```bash
# 1. Clona il repository
git clone https://github.com/MCR300400/ep-router.git
cd ep-router

# 2. Installa le dipendenze
npm install

# 3. Avvia il server di sviluppo Vite
npm run dev

# 4. Compila per la produzione
npm run build
```

---

## ☁️ Deploy su Cloudflare Pages

### Deploy immediato tramite Wrangler CLI
```bash
# Compilazione asset statici
npm run build

# Deploy diretto sul progetto Pages
npx wrangler pages deploy dist --project-name=ep-router
```

### Deploy continuo tramite GitHub
Collegando il repository pubblico su Cloudflare Pages:
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Production branch**: `main`

---

## 👤 Autore

**Edoardo Pippi**
- Portfolio: [edoardopippi.dev](https://edoardopippi.dev)
- GitHub: [@MCR300400](https://github.com/MCR300400)
