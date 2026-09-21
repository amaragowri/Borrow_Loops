const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://borrow-loops.vercel.app',
  'https://www.borrow-loops.vercel.app',
];

// Dynamically include CLIENT_URL from environment if set
if (process.env.CLIENT_URL) {
  const envUrl = process.env.CLIENT_URL.trim().replace(/\/+$/, '');
  if (envUrl && !allowedOrigins.includes(envUrl)) {
    allowedOrigins.push(envUrl);
  }
}

const corsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server, health checks, curl, or tools without browser origin
    if (!origin) {
      return callback(null, true);
    }

    const normalizedOrigin = origin.trim().replace(/\/+$/, '');

    // In development mode, allow any localhost, 127.0.0.1, or local subnet origin
    if (process.env.NODE_ENV !== 'production') {
      if (
        /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?$/.test(
          normalizedOrigin
        )
      ) {
        return callback(null, true);
      }
    }

    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    // In non-production, be forgiving so developers are never blocked
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }

    return callback(new Error(`CORS policy does not allow access from origin: ${origin}`), false);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
  optionsSuccessStatus: 200,
};

module.exports = { corsOptions, allowedOrigins };
