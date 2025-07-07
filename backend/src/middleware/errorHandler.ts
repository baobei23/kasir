import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export interface ApiError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export class AppError extends Error implements ApiError {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  error: ApiError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  let { statusCode = 500, message } = error;

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    statusCode = 400;
    const errors = error.errors.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));

    res.status(statusCode).json({
      success: false,
      message: "Data yang dikirim tidak valid",
      errors,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Handle Prisma errors
  if (error.message.includes("Prisma")) {
    statusCode = 500;
    message = "Terjadi kesalahan pada database";
  }

  // Log error for debugging
  if (statusCode >= 500) {
    console.error(`🔴 Server Error [${statusCode}]:`, {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      url: req.url,
      method: req.method,
      ip: req.ip,
    });
  }

  res.status(statusCode).json({
    success: false,
    message: statusCode >= 500 ? "Terjadi kesalahan internal server" : message,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === "development" && {
      stack: error.stack,
      originalMessage: error.message,
    }),
  });
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.path} tidak ditemukan`,
    timestamp: new Date().toISOString(),
  });
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
