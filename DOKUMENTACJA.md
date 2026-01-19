# ZABEZPIECZENIE APLIKACJI - SECURE LOGIN SYSTEM
## Projekt z przedmiotu: Podstawy bezpieczeństwa systemów komputerowych

---

## 1. CEL PROJEKTU

Stworzenie aplikacji webowej demonstrującej kompleksowe zabezpieczenia systemu autentykacji użytkowników. Aplikacja implementuje 12 warstw ochrony przed najpopularniejszymi atakami.

---

## 2. ZASTOSOWANE ZABEZPIECZENIA

### ZABEZPIECZENIE #1: Hashowanie haseł - bcrypt
**Problem:** Przechowywanie haseł w czystej formie w bazie danych  
**Zagrożenie:** Kradzież bazy → natychmiastowy dostęp do wszystkich kont  
**Rozwiązanie:** bcrypt z salt (12 rund)

**Jak działa:**
- Hasło użytkownika + losowy salt → funkcja bcrypt → hash
- Hash zapisywany w bazie zamiast hasła
- Salt sprawia że identyczne hasła mają różne hashe
- 12 rund = ~300ms na hash (celowo wolno, utrudnia brute-force)

**Kod:**
```javascript
const salt = await bcrypt.genSalt(12);
this.password = await bcrypt.hash(this.password, salt);
```

---

### ZABEZPIECZENIE #2: Rate Limiting
**Problem:** Atakujący może wykonywać tysiące prób logowania na sekundę  
**Zagrożenie:** Brute-force attack (odgadywanie hasła)  
**Rozwiązanie:** express-rate-limit

**Parametry:**
- Logowanie: 5 prób / 15 minut z jednego IP
- Rejestracja: 3 próby / godzinę z jednego IP
- API: 100 requestów / 15 minut

**Kod:**
```javascript
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Zbyt wiele prób logowania'
});
```

---

### ZABEZPIECZENIE #3: Account Lockout
**Problem:** Atakujący może zmieniać IP i omijać rate limiting  
**Zagrożenie:** Distributed brute-force  
**Rozwiązanie:** Blokada konta na poziomie bazy danych

**Mechanizm:**
- Po 5 nieudanych próbach → konto blokuje się na 30 minut
- Licznik `loginAttempts` i timestamp `lockUntil` w bazie
- Reset licznika po udanym logowaniu
- Nawet ze 100 różnych IP → konto zablokowane

**Kod:**
```javascript
if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
  updates.$set = { lockUntil: Date.now() + (30 * 60 * 1000) };
}
```

---

### ZABEZPIECZENIE #4: JWT z krótkim czasem życia
**Problem:** Skradziony token może być użyty przez atakującego  
**Zagrożenie:** Session hijacking  
**Rozwiązanie:** Krótkotrwałe tokeny + refresh mechanism

**Implementacja:**
- Access Token: 15 minut (do API requests)
- Refresh Token: 7 dni (do odświeżania)
- Tokeny podpisane HMAC SHA256
- Automatyczne odświeżanie po wygaśnięciu

**Kod:**
```javascript
const accessToken = jwt.sign(
  { userId }, 
  process.env.JWT_SECRET,
  { expiresIn: '15m' }
);
```

---

### ZABEZPIECZENIE #5: HTTP-only Secure Cookies
**Problem:** JavaScript może odczytać tokeny z localStorage  
**Zagrożenie:** XSS attack może ukraść tokeny  
**Rozwiązanie:** Refresh token w HTTP-only cookie

**Flagi:**
- `httpOnly: true` → JavaScript NIE ma dostępu
- `secure: true` → tylko przez HTTPS (produkcja)
- `sameSite: 'strict'` → ochrona przed CSRF

**Kod:**
```javascript
res.cookie('refreshToken', refreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict'
});
```

---

### ZABEZPIECZENIE #6: Walidacja danych wejściowych
**Problem:** Użytkownik może wpisać nieprawidłowe/złośliwe dane  
**Zagrożenie:** SQL injection, XSS, buffer overflow  
**Rozwiązanie:** express-validator

**Sprawdza:**
- Format email (regex)
- Długość hasła
- Niebezpieczne znaki
- Sanityzacja (usuwanie tagów HTML)

**Kod:**
```javascript
body('email')
  .trim()
  .isEmail()
  .normalizeEmail()
```

---

### ZABEZPIECZENIE #7: Helmet.js - Security Headers
**Problem:** Brak odpowiednich HTTP headers  
**Zagrożenie:** Clickjacking, MIME sniffing, downgrade attacks  
**Rozwiązanie:** Helmet middleware

**Ustawia nagłówki:**
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Strict-Transport-Security`
- Ukrywa wersję Express

**Kod:**
```javascript
app.use(helmet());
```

---

### ZABEZPIECZENIE #8: CORS - Cross-Origin Resource Sharing
**Problem:** Każda strona może wysyłać requesty do API  
**Zagrożenie:** Nieautoryzowany dostęp z innych domen  
**Rozwiązanie:** CORS middleware

**Konfiguracja:**
- Tylko localhost:3000 może łączyć się z API
- credentials: true (pozwala na cookies)
- Blokuje requesty z innych źródeł

**Kod:**
```javascript
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

---

### ZABEZPIECZENIE #9: Mongoose ORM - Prepared Statements
**Problem:** Surowe zapytania SQL są podatne na injection  
**Zagrożenie:** SQL/NoSQL Injection  
**Rozwiązanie:** Mongoose automatycznie parametryzuje zapytania

**Przykład ataku:**
```
Email: admin' OR '1'='1
```

**Ochrona:**
- Mongoose traktuje input jako dane, NIE kod
- Automatyczne escapowanie
- Zapytania są budowane bezpiecznie

---

### ZABEZPIECZENIE #10: Password Strength Validator
**Problem:** Użytkownicy wybierają słabe hasła  
**Zagrożenie:** Łatwe do złamania przez brute-force  
**Rozwiązanie:** Wymuszanie silnych haseł

**Wymagania:**
- Minimum 8 znaków
- Przynajmniej 1 wielka litera
- Przynajmniej 1 cyfra
- Przynajmniej 1 znak specjalny (@$!%*?&#)
- Bez spacji

**Kod:**
```javascript
.matches(/[A-Z]/)
.matches(/[0-9]/)
.matches(/[@$!%*?&#]/)
```

---

### ZABEZPIECZENIE #11: Secure Session Management
**Problem:** Tokeny nie wygasają, nie można wylogować  
**Zagrożenie:** Skradziony token działa w nieskończoność  
**Rozwiązanie:** Kontrola sesji

**Implementacja:**
- Tokeny automatycznie wygasają
- Logout usuwa refresh token (server + client)
- Możliwość blacklisty tokenów (Redis)
- Auto-refresh transparentny dla użytkownika

---

### ZABEZPIECZENIE #12: Input Sanitization
**Problem:** Znaki specjalne mogą zmienić logikę zapytań  
**Zagrożenie:** NoSQL Injection przez operatory MongoDB  
**Rozwiązanie:** express-mongo-sanitize

**Usuwa:**
- Operatory MongoDB: `$`, `.`
- Białe znaki (trim)
- Normalizacja (toLowerCase dla email)

**Kod:**
```javascript
app.use(mongoSanitize());
```

---

## 3. ARCHITEKTURA APLIKACJI

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- JWT (jsonwebtoken)
- bcrypt, helmet, cors, express-rate-limit

**Frontend:**
- React + TypeScript
- Axios (HTTP client)
- Auto-refresh interceptor

**Komunikacja:**
- REST API
- JSON Web Tokens
- HTTP-only Cookies

---

## 4. TESTY ZABEZPIECZEŃ

### Test 1: Słabe hasło
Input: `password`  
Wynik: ❌ Odrzucone (brak wielkiej litery, cyfry, znaku)

### Test 2: Rate limiting
6 prób logowania  
Wynik: ❌ Zablokowane po 5. próbie (429 Too Many Requests)

### Test 3: Account lockout
5 błędnych prób logowania  
Wynik: ❌ Konto zablokowane na 30 minut

### Test 4: SQL Injection
Email: `admin' OR '1'='1`  
Wynik: ❌ Mongoose zabezpiecza, nie działa

### Test 5: XSS
Input: `<script>alert('XSS')</script>`  
Wynik: ❌ Sanityzacja usuwa tagi

---

## 5. WNIOSKI

**Osiągnięcia:**
- 12 warstw zabezpieczeń
- Ochrona przed najpopularniejszymi atakami
- Zgodność z OWASP Top 10
- Best practices z przemysłu

**Potencjalne rozszerzenia:**
- 2FA (Google Authenticator)
- Email verification
- Password reset flow
- Captcha
- Geolocation blocking
- Device fingerprinting

---

## 6. WYKORZYSTANE TECHNOLOGIE

| Technologia | Cel |
|------------|-----|
| bcryptjs | Hashowanie haseł |
| jsonwebtoken | JWT tokeny |
| express-rate-limit | Rate limiting |
| helmet | Security headers |
| cors | Cross-origin protection |
| express-validator | Walidacja inputów |
| express-mongo-sanitize | NoSQL injection protection |
| mongoose | ORM, prepared statements |

---

## BIBLIOGRAFIA

1. OWASP Top 10 - https://owasp.org/www-project-top-ten/
2. bcrypt documentation - https://www.npmjs.com/package/bcryptjs
3. JWT Best Practices - https://datatracker.ietf.org/doc/html/rfc8725
4. Express Security Best Practices - https://expressjs.com/en/advanced/best-practice-security.html
