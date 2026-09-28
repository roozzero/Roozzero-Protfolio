import { Request, Response, NextFunction } from "express";

interface RateLimitStore {
  count: number;
  resetTime: number;
}

const stores = new Map<string, Map<string, RateLimitStore>>();

export function rateLimiter(options: { windowMs: number; max: number; message?: string }) {
  const { windowMs, max, message = "Too many requests. Please try again later." } = options;
  const storeKey = `${windowMs}_${max}`;

  if (!stores.has(storeKey)) {
    stores.set(storeKey, new Map());
  }

  const store = stores.get(storeKey)!;

  return (req: Request, res: Response, next: NextFunction) => {
    const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1";
    const now = Date.now();

    const record = store.get(ip);
    if (!record || now > record.resetTime) {
      store.set(ip, {
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }

    if (record.count >= max) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader("Retry-After", retryAfter);
      return res.status(429).json({
        success: false,
        error: {
          code: "TOO_MANY_REQUESTS",
          message,
          retryAfter
        }
      });
    }

    record.count++;
    next();
  };
}
