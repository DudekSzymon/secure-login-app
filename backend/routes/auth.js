import express from "express";
import User from "../models/User.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  authenticateToken,
} from "../middleware/auth.js";
import { loginLimiter, registerLimiter } from "../middleware/rateLimiter.js";
import { validateRegister, validateLogin } from "../middleware/validator.js";

const router = express.Router();

// POST /api/auth/register - Rejestracja nowego użytkownika
router.post(
  "/register",
  registerLimiter, // Rate limiting dla rejestracji
  validateRegister, // Walidacja siły hasła i formatu email
  async (req, res) => {
    try {
      const { email, password } = req.body;

      // Sprawdzenie, czy użytkownik już istnieje
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res
          .status(400)
          .json({ error: "Użytkownik z tym emailem już istnieje" });
      }

      // Utworzenie użytkownika (hasło zostanie zahashowane w modelu User.js)
      const user = new User({ email, password });
      await user.save();

      res.status(201).json({
        message: "Rejestracja zakończona pomyślnie",
        user: {
          id: user._id,
          email: user.email,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({ error: "Błąd podczas rejestracji" });
    }
  },
);

// POST /api/auth/login - Logowanie użytkownika
router.post(
  "/login",
  loginLimiter, // Zabezpieczenie przed Brute-force
  validateLogin,
  async (req, res) => {
    try {
      const { email, password } = req.body;

      // Znalezienie użytkownika w bazie
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: "Nieprawidłowy email lub hasło" });
      }

      // Sprawdzenie, czy konto jest obecnie zablokowane (Account Lockout)
      if (user.isLocked()) {
        const lockTimeLeft = Math.ceil(
          (user.lockUntil - Date.now()) / 1000 / 60,
        );
        return res.status(423).json({
          error: `Konto zablokowane. Spróbuj ponownie za ${lockTimeLeft} min.`,
        });
      }

      // Weryfikacja hasła przy użyciu bcrypt
      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        // Zwiększenie licznika nieudanych prób
        await user.incLoginAttempts();

        // Pobranie zaktualizowanego stanu użytkownika, aby sprawdzić czy nastąpiła blokada
        const updatedUser = await User.findById(user._id);

        if (updatedUser.isLocked()) {
          return res.status(423).json({
            error: `Przekroczono limit prób. Konto zostało zablokowane na 30 min.`,
          });
        }

        const remainingAttempts = 5 - updatedUser.loginAttempts;
        return res.status(401).json({
          error: `Nieprawidłowe hasło. Pozostało prób: ${remainingAttempts}`,
        });
      }

      // Reset licznika prób po udanym logowaniu
      await user.resetLoginAttempts();

      // Generowanie tokenów JWT
      const accessToken = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      // Przesłanie Refresh Tokena w bezpiecznym ciasteczku HTTP-only
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true, // Ochrona przed XSS
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict", // Ochrona przed CSRF
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dni
      });

      res.json({
        message: "Zalogowano pomyślnie",
        accessToken,
        user: {
          id: user._id,
          email: user.email,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Błąd podczas logowania" });
    }
  },
);

// POST /api/auth/refresh - Odświeżenie tokenu dostępowego
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({ error: "Brak refresh tokenu" });
    }

    // Weryfikacja podpisu Refresh Tokena
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return res
        .status(401)
        .json({ error: "Nieprawidłowy lub wygasły refresh token" });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: "Użytkownik nie istnieje" });
    }

    const accessToken = generateAccessToken(user._id);
    res.json({ accessToken });
  } catch (error) {
    console.error("Refresh error:", error);
    res.status(500).json({ error: "Błąd podczas odświeżania tokenu" });
  }
});

// POST /api/auth/logout - Wylogowanie i usunięcie ciasteczka
router.post("/logout", (req, res) => {
  res.clearCookie("refreshToken");
  res.json({ message: "Wylogowano pomyślnie" });
});

// GET /api/auth/me - Pobranie danych zalogowanego operatora
router.get("/me", authenticateToken, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        email: req.user.email,
        createdAt: req.user.createdAt,
      },
    });
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

export default router;
