// ZABEZPIECZENIE 2: Rate Limiting - własna implementacja dla Express 5.0

const requestStore = new Map();

// Czyszczenie co minutę
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of requestStore.entries()) {
    if (now > data.resetTime) {
      requestStore.delete(key);
    }
  }
}, 60000);

const createRateLimiter = (options) => {
  const {
    windowMs = 15 * 60 * 1000,
    max = 5,
    message = "Zbyt wiele requestów",
  } = options;

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const key = `${ip}-${req.path}`;
    const now = Date.now();

    let requestData = requestStore.get(key);

    if (!requestData || now > requestData.resetTime) {
      requestData = {
        count: 0,
        resetTime: now + windowMs,
      };
    }

    requestData.count++;
    requestStore.set(key, requestData);

    if (requestData.count > max) {
      const retryAfter = Math.ceil((requestData.resetTime - now) / 1000);
      return res.status(429).json({
        error: message,
        retryAfter: retryAfter,
      });
    }

    next();
  };
};

const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Zbyt wiele prób logowania. Spróbuj za 15 minut.",
});

const registerLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: "Zbyt wiele prób rejestracji. Spróbuj za godzinę.",
});

const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Zbyt wiele requestów. Spróbuj później.",
});

export { loginLimiter, registerLimiter, apiLimiter };
