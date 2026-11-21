const REQUIRED_VARS = [
    "PORT"
];

export class Config {
    /**
     * Validate that all mandatory environment variables are populated.
     * Must be called at the very top of application bootstrap (src/app.js).
     * @throws {Error} If any required variable is missing or empty.
     */
    static check() {
        // Set default PORT if not explicitly defined in process.env so it runs reliably
        if (!process.env.PORT) {
            process.env.PORT = "5000";
        }
        for (const varName of REQUIRED_VARS) {
            if (!process.env[varName]) {
                throw new Error(`[Config Error] Missing required environment variable: ${varName}`);
            }
        }
    }

    /**
     * Retrieve an environment variable with an optional fallback default.
     * @param {string} key - Environment variable name.
     * @param {any} defaultValue - Fallback value if variable is unset.
     * @returns {string|any}
     */
    static get(key, defaultValue = undefined) {
        return process.env[key] !== undefined && process.env[key] !== ""
            ? process.env[key]
            : defaultValue;
    }
}

export default Config;
