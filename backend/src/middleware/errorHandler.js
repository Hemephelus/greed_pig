import { ApiError } from "../utils/ApiError.js";

export function notFound(req, res, next) {
  next(new ApiError(404, "NOT_FOUND", `Route ${req.method} ${req.originalUrl} not found`));
}

export function errorHandler(err, req, res, next) {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      success: false,
      error: { code: "INVALID_INPUT", message: "Request body is not valid JSON." },
    });
  }

  if (err instanceof ApiError) {
    return res.status(err.status).json({
      success: false,
      error: { code: err.code, message: err.message },
    });
  }

  console.error(err);
  res.status(500).json({
    success: false,
    error: { code: "SERVER_ERROR", message: "Something went wrong on the server." },
  });
}
