export class ApiError extends Error {
    /**
     * @param {number} statusCode - HTTP status code
     * @param {string} message - Human-readable error description
     * @param {Object} [meta={}] - Additional contextual metadata
     */
    constructor(statusCode, message, meta = {}) {
        super(message);
        this.statusCode = statusCode;
        this.meta = meta;
        this.success = false;

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }

    static badRequest(message = "Bad request", meta = {}) {
        return new ApiError(400, message, meta);
    }

    static unauthorized(message = "Unauthorized", meta = {}) {
        return new ApiError(401, message, meta);
    }

    static forbidden(message = "Forbidden", meta = {}) {
        return new ApiError(403, message, meta);
    }

    static notFound(message = "Resource not found", meta = {}) {
        return new ApiError(404, message, meta);
    }

    static conflict(message = "Conflict", meta = {}) {
        return new ApiError(409, message, meta);
    }

    static validationError(message = "Validation error", meta = {}) {
        return new ApiError(400, message, meta);
    }

    static preconditionFailed(message = "Precondition failed", meta = {}) {
        return new ApiError(412, message, meta);
    }

    static internal(message = "Internal server error", meta = {}) {
        return new ApiError(500, message, meta);
    }
}

export default ApiError;
