import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// ZABEZPIECZENIE 4: Middleware weryfikacji JWT
const authenticateToken = async (req, res, next) => {
  try {
    // Pobierz token z headera Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({ error: 'Brak tokenu dostępu' });
    }
    
    // Weryfikuj token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Sprawdź czy user jeszcze istnieje
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'Użytkownik nie istnieje' });
    }
    
    // Dodaj userId do requesta
    req.userId = decoded.userId;
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token wygasł' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Nieprawidłowy token' });
    }
    return res.status(500).json({ error: 'Błąd serwera' });
  }
};

// Generuj Access Token (krótki czas życia - 15 min)
const generateAccessToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
};

// Generuj Refresh Token (długi czas życia - 7 dni)
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};

// Weryfikuj Refresh Token
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    return null;
  }
};

export {
  authenticateToken,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken
};
