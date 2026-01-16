import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { fileURLToPath } from "url";
import { componentTagger } from "lovable-tagger";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
    server: {
        host: "::",
        port: 8080, // Return to 8080 to avoid conflict with backend 3069
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
            "@core": path.resolve(__dirname, "./src/core"),
            "@features": path.resolve(__dirname, "./src/features"),
            "@admin": path.resolve(__dirname, "./src/features/admin"),
            "@pmo": path.resolve(__dirname, "./src/features/pmo"),
            "@leader": path.resolve(__dirname, "./src/features/leader"),
            "@staff": path.resolve(__dirname, "./src/features/staff"),
            "@shared": path.resolve(__dirname, "./src/features/shared"),
        },
    },
}));
