import mongoose from "mongoose";
import { config } from "./env";

export async function conectarMongo(): Promise<void> {
  if (!config.mongoUri) {
    console.warn("MONGO_URI não configurado — persistência desativada.");
    return;
  }

  try {
    await mongoose.connect(config.mongoUri);
    console.log("MongoDB conectado com sucesso");
  } catch (error) {
    console.error("Erro ao conectar no MongoDB:", error);
  }
}