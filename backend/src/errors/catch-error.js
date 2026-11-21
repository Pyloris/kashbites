/**
 * Wraps an async controller function to forward errors to the Express error handler
 * @param {Function} controller - Async controller function (req, res, next)
 * @returns {Function} Express middleware function
 */
export function catchError(controller) {
    return async (req, res, next) => {
        try {
            await controller(req, res, next);
        } catch (err) {
            next(err);
        }
    };
}

export default catchError;
