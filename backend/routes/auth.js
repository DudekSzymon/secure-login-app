import express from 'express';
import User from '../models/User.js';
import { 
  generateAccessToken, 
  generateRefreshToken, 
  verifyRefreshToken,
  authenticateToken 
} from '../middleware/auth.js';
import { loginLimiter, registerLimiter } from '../middleware/rateLimiter.js';
import { 
  validateRegister, 
  validateLogin
} from '../middleware/validator.js';

const router = express.Router();

// POST /api/auth/register
router.post('/register', 
  registerLimiter, // Rate limiting dla rejestracji
  validateRegister, // Walidacja inputów
  async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Sprawdź czy user już istnieje
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Użytkownik z tym emailem już istnieje' });
      }
      
      // Utwórz nowego usera (hasło będzie zahashowane automatycznie)
      const user = new User({ email, password });
      await user.save();
      
      res.status(201).json({
        message: 'Rejestracja zakończona pomyślnie',
        user: {
          id: user._id,
          email: user.email,
          createdAt: user.createdAt
        }
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ error: 'Błąd podczas rejestracji' });
    }
  }
);

// POST /api/auth/login
router.post('/login',
  loginLimiter, // Rate limiting dla logowania
  validateLogin, // Walidacja inputów
  async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Znajdź usera
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: 'Nieprawidłowy email lub hasło' });
      }
      
      // Sprawdź czy konto jest zablokowane
      if (user.isLocked()) {
        const lockTimeLeft = Math.ceil((user.lockUntil - Date.now()) / 1000 / 60);
        return res.status(423).json({ 
          error: `Konto zablokowane. Spróbuj ponownie za ${lockTimeLeft} minut.` 
        });
      }
      
      // Sprawdź hasło
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        // Zwiększ licznik nieudanych prób
        await user.incLoginAttempts();
        return res.status(401).json({ error: 'Nieprawidłowy email lub hasło' });
      }
      
      // Resetuj licznik po udanym logowaniu
      await user.resetLoginAttempts();
      
      // Wygeneruj tokeny
      const accessToken = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);
      
      // ZABEZPIECZENIE 5: Ustaw refresh token w HTTP-only cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true, // Niedostępne dla JavaScript
        secure: process.env.NODE_ENV === 'production', // Tylko HTTPS w produkcji
        sameSite: 'strict', // Ochrona przed CSRF
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 dni
      });
      
      res.json({
        message: 'Zalogowano pomyślnie',
        accessToken,
        user: {
          id: user._id,
          email: user.email
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Błąd podczas logowania' });
    }
  }
);

// POST /api/auth/refresh - Odśwież access token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    
    if (!refreshToken) {
      return res.status(401).json({ error: 'Brak refresh tokenu' });
    }
    
    // Weryfikuj refresh token
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return res.status(401).json({ error: 'Nieprawidłowy refresh token' });
    }
    
    // Sprawdź czy user istnieje
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'Użytkownik nie istnieje' });
    }
    
    // Wygeneruj nowy access token
    const accessToken = generateAccessToken(user._id);
    
    res.json({ accessToken });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({ error: 'Błąd podczas odświeżania tokenu' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  // Usuń refresh token cookie
  res.clearCookie('refreshToken');
  res.json({ message: 'Wylogowano pomyślnie' });
});

// GET /api/auth/me - Pobierz dane zalogowanego usera
router.get('/me', authenticateToken, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        email: req.user.email,
        createdAt: req.user.createdAt
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

export default router;
