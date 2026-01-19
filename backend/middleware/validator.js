// ZABEZPIECZENIE 6 i 10: Walidacja i Password Strength
// Własna implementacja bez express-validator (kompatybilna z Express 5.0)

const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^\S+@\S+\.\S+$/;
  return emailRegex.test(email.trim()) && email.length <= 100;
};

const validatePassword = (password) => {
  const errors = [];
  
  if (!password || typeof password !== 'string') {
    errors.push('Hasło jest wymagane');
    return errors;
  }
  
  if (password.length < 8) {
    errors.push('Hasło musi mieć minimum 8 znaków');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Hasło musi zawierać wielką literę');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Hasło musi zawierać małą literę');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Hasło musi zawierać cyfrę');
  }
  
  if (!/[@$!%*?&#]/.test(password)) {
    errors.push('Hasło musi zawierać znak specjalny (@$!%*?&#)');
  }
  
  if (/\s/.test(password)) {
    errors.push('Hasło nie może zawierać spacji');
  }
  
  return errors;
};

const validateRegister = (req, res, next) => {
  const { email, password, confirmPassword } = req.body;
  const errors = [];
  
  // Walidacja email
  if (!validateEmail(email)) {
    errors.push('Podaj poprawny adres email');
  }
  
  // Walidacja hasła
  const passwordErrors = validatePassword(password);
  errors.push(...passwordErrors);
  
  // Sprawdź czy hasła są identyczne
  if (password !== confirmPassword) {
    errors.push('Hasła muszą być identyczne');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Błąd walidacji',
      details: errors
    });
  }
  
  // Sanityzacja - normalizacja email
  req.body.email = email.trim().toLowerCase();
  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];
  
  // Walidacja email
  if (!validateEmail(email)) {
    errors.push('Podaj poprawny adres email');
  }
  
  // Sprawdź czy hasło istnieje
  if (!password || typeof password !== 'string') {
    errors.push('Hasło jest wymagane');
  } else if (password.length > 100) {
    errors.push('Hasło za długie');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Błąd walidacji',
      details: errors
    });
  }
  
  // Sanityzacja
  req.body.email = email.trim().toLowerCase();
  next();
};

export {
  validateRegister,
  validateLogin
};
