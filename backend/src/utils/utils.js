import crypto from "crypto";

export function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function getRandomId(bytes = 8) {
    return crypto.randomBytes(bytes).toString("hex");
}

export default {
    escapeRegex,
    getRandomId,
};
