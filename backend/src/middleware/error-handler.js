import { ApiError } from "../errors/api-error.js";

export function errorHandler(err, req, res, next) {
    if (res.headersSent) {
        return next(err);
    }

    // 1. ApiError instances
    if (err instanceof ApiError) {
        if (err.statusCode >= 500) {
            console.error(`[ApiError ${err.statusCode}]`, err.message, err.stack);
        } else {
            console.warn(`[ApiError ${err.statusCode}]`, err.message);
        }

        return res.status(err.statusCode).json({
            status: 0,
            success: false,
            message: err.message,
            ...(err.meta && Object.keys(err.meta).length > 0 && { data: err.meta }),
        });
    }

    // 2. Mongoose / MongoDB Duplicate Key Error (E11000)
    if (err.code === 11000) {
        return res.status(409).json({
            status: 0,
            success: false,
            message: "Duplicate entry found",
            data: err.keyValue,
        });
    }

    // 3. Mongoose Validation Errors
    if (err.name === "ValidationError") {
        const messages = Object.values(err.errors || {}).map((e) => e.message);
        return res.status(400).json({
            status: 0,
            success: false,
            message: messages.join(", ") || "Validation error",
        });
    }

    // 4. JWT Errors
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
        return res.status(401).json({
            status: 0,
            success: false,
            message: "Invalid or expired token",
        });
    }

    // 5. Unhandled Generic Errors (500)
    console.error("[Unhandled Error]", err);
    return res.status(500).json({
        status: 0,
        success: false,
        message: err.message || "Internal server error",
    });
}

export default errorHandler;
