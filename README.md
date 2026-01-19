# 🔐 Secure Login System

Aplikacja demonstracyjna z pełnym zabezpieczeniem autentykacji - projekt na studia.

## 📋 Zastosowane zabezpieczenia

### 1. **Hashowanie haseł - bcrypt (ZABEZPIECZENIE #1)**
- Hasła NIE są przechowywane w czystej formie
- bcrypt z salt (12 rund) - wysoka trudność
- Nawet po kradzieży bazy danych → niemożliwe odczytanie haseł

### 2. **Rate Limiting (ZABEZPIECZENIE #2)**
- Maksymalnie 5 prób logowania / 15 minut z jednego IP
- 3 rejestracje / godzinę z jednego IP
- Blokuje ataki brute-force
- Zwraca błąd 429 "Too Many Requests"

### 3. **Account Lockout (ZABEZPIECZENIE #3)**
- Konto blokuje się na 30 minut po 5 nieudanych próbach
- Zapisane w bazie danych (loginAttempts, lockUntil)
- Zmiana IP nie pomaga atakującemu
- Auto-reset po udanym logowaniu

### 4. **JWT z krótkim czasem życia (ZABEZPIECZENIE #4)**
- Access token: 15 minut
- Refresh token: 7 dni
- Automatic token refresh
- Podpisane kluczem tajnym (HMAC SHA256)

### 5. **HTTP-only Secure Cookies (ZABEZPIECZENIE #5)**
- Refresh token w cookie z flagą `httpOnly`
- JavaScript nie ma dostępu → ochrona przed XSS
- Flaga `secure` = tylko HTTPS (w produkcji)
- `sameSite: strict` = ochrona przed CSRF

### 6. **Walidacja danych wejściowych (ZABEZPIECZENIE #6)**
- express-validator sprawdza format email
- Sanityzacja inputów
- Ochrona przed SQL/NoSQL Injection
- Ochrona przed XSS

### 7. **Helmet.js - Security Headers (ZABEZPIECZENIE #7)**
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY` → ochrona przed clickjacking
- `Strict-Transport-Security` → wymusza HTTPS
- Ukrywa informacje o technologii

### 8. **CORS - Cross-Origin Resource Sharing (ZABEZPIECZENIE #8)**
- Tylko frontend z localhost:3000 może łączyć się z API
- Blokuje requesty z innych źródeł
- credentials: true → pozwala na cookies

### 9. **Mongoose ORM - Prepared Statements (ZABEZPIECZENIE #9)**
- Automatyczna ochrona przed SQL/NoSQL Injection
- Zapytania są parametryzowane
- Input użytkownika = dane, NIE kod

### 10. **Password Strength Validator (ZABEZPIECZENIE #10)**
- Minimum 8 znaków
- Przynajmniej 1 wielka litera
- Przynajmniej 1 cyfra
- Przynajmniej 1 znak specjalny (@$!%*?&#)
- Bez spacji

### 11. **Secure Session Management (ZABEZPIECZENIE #11)**
- Tokeny wygasają automatycznie
- Auto-refresh mechanizm
- Logout usuwa tokeny (client + server)
- Możliwość blacklisty tokenów

### 12. **Input Sanitization (ZABEZPIECZENIE #12)**
- express-mongo-sanitize usuwa operatory MongoDB ($, .)
- Trim białych znaków
- Normalizacja email (toLowerCase)
- Ochrona przed NoSQL injection

---

## 🚀 Uruchomienie projektu

### Wymagania:
- Node.js (v20+) **← NAJNOWSZY**
- MongoDB (lokalnie lub Atlas)
- npm

### 1. Backend

```bash
cd backend
npm install
```

Uruchom MongoDB lokalnie lub użyj MongoDB Atlas.

Edytuj `.env` jeśli potrzeba:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/secure-auth
JWT_SECRET=zmien-to-na-produkcji
JWT_REFRESH_SECRET=zmien-to-na-produkcji
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

Uruchom serwer:
```bash
npm start
# lub w trybie dev z nodemon:
npm run dev
```

Backend działa na: `http://localhost:5000`

### 2. Frontend (Vite - SZYBKI!)

```bash
cd frontend
npm install
npm run dev
```

Frontend działa na: `http://localhost:3000`

**VITE startuje w 0.5s zamiast 30s jak stary CRA!** 🚀

---

## 📡 API Endpoints

### POST /api/auth/register
Rejestracja nowego użytkownika

**Body:**
```json
{
  "email": "test@example.com",
  "password": "Test123!@#",
  "confirmPassword": "Test123!@#"
}
```

**Response (201):**
```json
{
  "message": "Rejestracja zakończona pomyślnie",
  "user": {
    "id": "...",
    "email": "test@example.com",
    "createdAt": "2024-01-01T12:00:00.000Z"
  }
}
```

### POST /api/auth/login
Logowanie użytkownika

**Body:**
```json
{
  "email": "test@example.com",
  "password": "Test123!@#"
}
```

**Response (200):**
```json
{
  "message": "Zalogowano pomyślnie",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "test@example.com"
  }
}
```

+ Ustawia `refreshToken` cookie

### POST /api/auth/refresh
Odświeżenie access tokenu

**Cookies:**
- refreshToken (HTTP-only)

**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### POST /api/auth/logout
Wylogowanie użytkownika

**Response (200):**
```json
{
  "message": "Wylogowano pomyślnie"
}
```

### GET /api/auth/me
Pobierz dane zalogowanego użytkownika (wymaga tokenu)

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200):**
```json
{
  "user": {
    "id": "...",
    "email": "test@example.com",
    "createdAt": "2024-01-01T12:00:00.000Z"
  }
}
```

---

## 🧪 Testowanie zabezpieczeń

### Test 1: Password Strength
Spróbuj zarejestrować się z słabym hasłem:
- `password` → ❌ Brak wielkiej litery, cyfry, znaku specjalnego
- `Password` → ❌ Brak cyfry i znaku specjalnego
- `Password1` → ❌ Brak znaku specjalnego
- `Password1!` → ✅ Spełnia wszystkie wymagania

### Test 2: Rate Limiting
Spróbuj 6 razy się zalogować z błędnym hasłem:
- Przy 6. próbie dostaniesz błąd 429
- Musisz poczekać 15 minut

### Test 3: Account Lockout
Zaloguj się 5 razy z błędnym hasłem:
- Konto zablokuje się na 30 minut
- Nawet z innego IP → konto zablokowane

### Test 4: Token Expiration
- Access token wygasa po 15 minutach
- Frontend automatycznie odświeża token
- Sprawdź Network tab w DevTools

### Test 5: XSS Protection
Spróbuj wpisać w input:
```html
<script>alert('XSS')</script>
```
- Input zostanie zsanityzowany
- Skrypt się nie wykona

### Test 6: SQL Injection
Spróbuj wpisać w email:
```
admin' OR '1'='1
```
- Mongoose automatycznie zabezpiecza
- Nie zadziała

## 📦 Stack Technologiczny (NAJNOWSZE WERSJE 2026)

### Backend:
- **Express 5.0** (najnowszy)
- **Mongoose 8.9** (najnowszy)
- **Node.js ES Modules** (nowoczesny import/export)
- bcryptjs 2.4.3
- jsonwebtoken 9.0.2
- express-rate-limit 7.5
- helmet 8.0
- express-validator 7.2

### Frontend:
- **Vite 6.0** (najszybszy bundler, start w 0.5s)
- **React 18.3** (najnowszy)
- **TypeScript 5.7** (najnowszy)
- Axios 1.7

### Baza danych:
- MongoDB 8.0+

```
secure-login-app/
├── backend/
│   ├── models/
│   │   └── User.js              # Model użytkownika z hashowaniem
│   ├── middleware/
│   │   ├── rateLimiter.js       # Rate limiting
│   │   ├── auth.js              # JWT middleware
│   │   └── validator.js         # Walidacja inputów
│   ├── routes/
│   │   └── auth.js              # Endpointy autentykacji
│   ├── server.js                # Główny plik serwera
│   ├── .env                     # Konfiguracja
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── Login.tsx            # Komponent logowania
    │   ├── Register.tsx         # Komponent rejestracji
    │   ├── Dashboard.tsx        # Panel użytkownika
    │   ├── api.ts               # API client z interceptorami
    │   ├── App.tsx              # Główny komponent
    │   └── App.css              # Style
    ├── public/
    │   └── index.html
    ├── tsconfig.json
    └── package.json
```

---

## 🎯 Kluczowe fragmenty kodu

### Hashowanie hasła (User.js)
```javascript
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
```

### Rate Limiting (rateLimiter.js)
```javascript
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minut
  max: 5, // Maksymalnie 5 prób
  message: 'Zbyt wiele prób logowania'
});
```

### Account Lockout (User.js)
```javascript
if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
  updates.$set = { lockUntil: Date.now() + (30 * 60 * 1000) };
}
```

### JWT Generation (auth.js)
```javascript
const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, 
    { expiresIn: '15m' }
  );
};
```

### HTTP-only Cookie (auth.js)
```javascript
res.cookie('refreshToken', refreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000
});
```

---

## 📝 Dokumentacja do pracy

Wszystkie zastosowane zabezpieczenia są opisane w sekcji **"Zastosowane zabezpieczenia"** powyżej.

Do dokumentacji możesz dodać:
1. Krótki opis problemu (niezabezpieczone logowanie)
2. Listę zagrożeń (brute force, SQL injection, XSS, itd.)
3. Opis każdego zabezpieczenia (już jest powyżej)
4. Screenshoty z działania aplikacji
5. Fragmenty kodu (już są powyżej)
6. Wnioski

---

## 🛡️ Autor

Projekt na zajęcia: Podstawy bezpieczeństwa systemów komputerowych
