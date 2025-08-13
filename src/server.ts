import { createApp } from "./app-factory.js";
import { cleanupExpiredSessions } from "./lib/auth.js";

const start = async () => {
    const app = await createApp();

    try {
        const port = Number(process.env.PORT) || 3000;
        await app.listen({ port, host: "0.0.0.0" });
        console.info(`Server running on port ${port}`);

        cleanupExpiredSessions();
        setInterval(
            async () => {
                await cleanupExpiredSessions();
            },
            24 * 60 * 60 * 1000
        ); // Daily cleanup
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();
