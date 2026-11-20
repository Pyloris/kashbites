import { createApp } from './app.js';
const PORT = 4000;
async function startServer() {
    const app = createApp();
    app.listen(Number(PORT), '0.0.0.0', () => {
        console.log(`[KashBites Backend] Running on http://0.0.0.0:${PORT}`);
    });
}
startServer().catch((err) => {
    console.error('Failed to start server:', err);
});
