// Função serverless. A importação não abre porta nem cria SQLite na Vercel.
import { handler } from "../NutriVibe/servidor/server.js";
export default handler;
