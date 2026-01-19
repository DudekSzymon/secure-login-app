# 🚀 QUICK START - Secure Login App

## NAJNOWSZE WERSJE 2026
- Node.js 20+
- Vite 6.0 (zamiast starego CRA)
- Express 5.0
- TypeScript 5.7
- React 18.3
- Mongoose 8.9

---

## 1️⃣ Rozpakuj projekt

```bash
tar -xzf secure-login-app-v2.tar.gz
cd secure-login-app
```

---

## 2️⃣ Uruchom backend

```bash
cd backend
npm install
npm start
```

✅ Backend: http://localhost:5000

**WAŻNE:** Musisz mieć MongoDB! 
- Lokalnie: `mongod` w osobnym terminalu
- Lub MongoDB Atlas (darmowy) i zmień `MONGODB_URI` w `.env`

---

## 3️⃣ Uruchom frontend (NOWY TERMINAL)

```bash
cd frontend
npm install
npm run dev
```

✅ Frontend: http://localhost:3000

**Vite startuje w 0.5s zamiast 30s!** 🔥

---

## 🎯 Testowanie

1. **Zarejestruj się** - email + silne hasło (min 8 znaków, wielka litera, cyfra, znak specjalny)
2. **Zaloguj się** - otrzymasz JWT token
3. **Dashboard** - zobaczysz listę zabezpieczeń

### Testy zabezpieczeń:
- **Słabe hasło**: `password` → ❌ Odrzucone
- **Brute force**: 6 prób logowania → ❌ Zablokowane (429)
- **Account lockout**: 5 błędnych prób → ❌ Konto na 30 min
- **SQL injection**: `admin' OR '1'='1` → ❌ Nie działa

---

## 📋 Co zostało zmienione vs stara wersja?

### Stare (CRA):
- ❌ react-scripts 5.0.1 (deprecated, konflikt TypeScript)
- ❌ Start: 30 sekund
- ❌ CommonJS (require/module.exports)
- ❌ Stare wersje pakietów

### Nowe (Vite):
- ✅ Vite 6.0 (najnowszy bundler)
- ✅ Start: 0.5 sekundy 🚀
- ✅ ES Modules (import/export)
- ✅ Wszystkie pakiety najnowsze 2026

---

## ⚠️ Troubleshooting

### Błąd: "Cannot find module"
→ Sprawdź czy masz Node.js 20+: `node --version`

### Błąd: MongoDB connection
→ Uruchom MongoDB: `mongod` lub użyj Atlas

### Frontend nie startuje
→ Usuń `node_modules` i `npm install` ponownie

### Port zajęty
→ Zmień w `vite.config.ts` (frontend) lub `.env` (backend)

---

## 🛡️ Zabezpieczenia (12 warstw)

1. ✅ Hashowanie haseł (bcrypt 12 rund)
2. ✅ Rate limiting (5 prób / 15 min)
3. ✅ Account lockout (30 min po 5 próbach)
4. ✅ JWT z auto-refresh (15 min access, 7 dni refresh)
5. ✅ HTTP-only secure cookies
6. ✅ Walidacja inputów (email, hasło)
7. ✅ Helmet security headers
8. ✅ CORS protection
9. ✅ Mongoose ORM (prepared statements)
10. ✅ Password strength validator
11. ✅ Secure session management
12. ✅ Input sanitization (NoSQL injection)

---

## 📝 Do dokumentacji na studia

Użyj pliku **DOKUMENTACJA.md** - gotowe 5-10 stron z:
- Opisem wszystkich zabezpieczeń
- Przykładami kodu
- Testami
- Architekturą
- Bibliografią

---

## 🎓 Na obronę pokaż:

1. **Live demo** - rejestracja, logowanie
2. **Rate limiting** - 6 prób → 429 error
3. **Account lockout** - 5 błędnych prób → blokada
4. **Kod** - fragmenty z hashowaniem, JWT
5. **Dashboard** - lista zabezpieczeń

---

**Autor**: Projekt na zajęcia Podstawy bezpieczeństwa systemów komputerowych
**Tech Stack**: Vite + React + TypeScript + Express + MongoDB + 12 zabezpieczeń
