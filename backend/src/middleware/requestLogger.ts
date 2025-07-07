import { Request, Response, NextFunction } from "express";

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();

  // Log incoming request
  console.log(`📥 ${req.method} ${req.path}`, {
    query: Object.keys(req.query || {}).length > 0 ? req.query : undefined,
    body:
      req.method !== "GET" && Object.keys(req.body || {}).length > 0
        ? req.body
        : undefined,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });

  // Capture response
  const originalSend = res.send;
  res.send = function (body) {
    const duration = Date.now() - start;
    const statusColor =
      res.statusCode < 400 ? "✅" : res.statusCode < 500 ? "⚠️" : "❌";

    console.log(
      `📤 ${statusColor} ${res.statusCode} ${req.method} ${req.path} - ${duration}ms`
    );

    return originalSend.call(this, body);
  };

  next();
};
