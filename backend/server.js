import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";

// Importy Twoich plików (upewnij się, że ścieżki są poprawne)
import authRoutes from "./routes/auth.js";
import { apiLimiter } from "./middleware/rateLimiter.js";

const app = express();

// ==========================================
// 1. GLOBALNE ZABEZPIECZENIA (SECURITY HEADERS)
// ==========================================

// ZABEZPIECZENIE 7: Helmet - ustawia 15 bezpiecznych nagłówków HTTP
app.use(helmet());

// ZABEZPIECZENIE 8: CORS - kontrola dostępu (tylko Twój frontend)
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true, // Kluczowe dla przesyłania ciasteczek z JWT
  }),
);

// ==========================================
// 2. PARSOWANIE DANYCH I LIMITOWANIE ROZMIARU
// ==========================================

// Ograniczenie rozmiaru body (Ochrona przed atakami typu "Large Payload")
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// ==========================================
// 3. ZABEZPIECZENIE 12: INPUT SANITIZATION (NoSQL Injection Fix)
// ==========================================
// To rozwiązuje błąd TypeError w Express 5, zastępując bibliotekę express-mongo-sanitize
app.use((req, res, next) => {
  const sanitize = (obj) => {
    if (obj instanceof Object) {
      for (const key in obj) {
        if (/^\$/.test(key) || /\./.test(key)) {
          // Usuwa klucze zaczynające się od $ lub zawierające kropki
          delete obj[key];
        } else {
          sanitize(obj[key]);
        }
      }
    }
    return obj;
  };

  if (req.body) sanitize(req.body);
  if (req.params) sanitize(req.params);
  // req.query w Express 5 jest tylko do odczytu, więc go nie nadpisujemy
  next();
});

// ==========================================
// 4. RATE LIMITING (ZABEZPIECZENIE 2)
// ==========================================

// Ograniczenie liczby requestów na całe API
app.use("/api/", apiLimiter);

// Ważne dla poprawnego wykrywania IP użytkownika za proxy (np. na hostingu)
app.set("trust proxy", 1);

// ==========================================
// 5. ŚCIEŻKI APLIKACJI (ROUTES)
// ==========================================

app.use("/api/auth", authRoutes);

// Test zdrowia serwera
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    node_version: process.version,
  });
});

// ==========================================
// 6. OBSŁUGA BŁĘDÓW I 404
// ==========================================

// Middleware dla nieistniejących ścieżek
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint nie został znaleziony" });
});

// Globalny handler błędów (ZABEZPIECZENIE: Nie pokazuje stack trace na produkcji)
app.use((err, req, res, next) => {
  console.error("❌ Error log:", err.message);

  res.status(err.status || 500).json({
    error:
      process.env.NODE_ENV === "production"
        ? "Wystąpił błąd wewnętrzny"
        : err.message,
  });
});

// ==========================================
// 7. POŁĄCZENIE Z BAZĄ I START (ZABEZPIECZENIE 9)
// ==========================================

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ Połączono pomyślnie z MongoDB");
    app.listen(PORT, () => {
      console.log(`🚀 Serwer bezpiecznie działa na porcie ${PORT}`);
      console.log(
        `🌍 Zezwolony Origin: ${process.env.FRONTEND_URL || "http://localhost:3000"}`,
      );
    });
  })
  .catch((err) => {
    console.error("❌ Błąd krytyczny połączenia z bazą:", err.message);
    process.exit(1);
  });

// Wyłapywanie błędów poza pętlą Expressa
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  process.exit(1);
});
