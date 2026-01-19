import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email jest wymagany'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Podaj poprawny adres email']
  },
  password: {
    type: String,
    required: [true, 'Hasło jest wymagane'],
    minlength: [8, 'Hasło musi mieć minimum 8 znaków']
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  }
}, {
  timestamps: true
});

// ZABEZPIECZENIE 1: Hashowanie hasła przed zapisem (bcrypt + salt)
userSchema.pre('save', async function(next) {
  // Hashuj tylko jeśli hasło zostało zmodyfikowane
  if (!this.isModified('password')) return next();
  
  try {
    // Generuj salt (12 rund - wysoka trudność)
    const salt = await bcrypt.genSalt(12);
    // Hashuj hasło z solą
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Metoda do weryfikacji hasła
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// ZABEZPIECZENIE 3: Account Lockout - sprawdź czy konto jest zablokowane
userSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// ZABEZPIECZENIE 3: Zwiększ licznik nieudanych prób
userSchema.methods.incLoginAttempts = function() {
  // Jeśli poprzednia blokada wygasła, resetuj licznik
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  const maxAttempts = 5;
  const lockTime = 30 * 60 * 1000; // 30 minut
  
  // Zablokuj konto po 5 próbach
  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + lockTime };
  }
  
  return this.updateOne(updates);
};

// Resetuj licznik po udanym logowaniu
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 }
  });
};

// Nie zwracaj hasła w JSON
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.loginAttempts;
  delete user.lockUntil;
  return user;
};

export default mongoose.model('User', userSchema);
