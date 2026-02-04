import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { connectDB } from "../config/db.js";
import User from "../models/Users.js";

dotenv.config();

const DEFAULT_EMAIL = process.env.ADMIN_EMAIL || "admin@pasito.com";
const DEFAULT_PASSWORD = process.env.ADMIN_PASSWORD || "hdaniel1102";

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error("Falta MONGODB_URI en el .env");
    process.exit(1);
  }
  if (!process.env.JWT_SECRET) {
    console.error("Falta JWT_SECRET en el .env");
    process.exit(1);
  }

  await connectDB();

  const existing = await User.findOne({ email: DEFAULT_EMAIL });
  const hash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  const defaultBirthDate = new Date("1990-01-01");

  if (existing) {
    existing.password = hash;
    existing.rol = "admin";
    existing.fecha_nacimiento = defaultBirthDate;
    await existing.save();
    console.log(`Admin actualizado: ${existing.email}`);
  } else {
    const user = await User.create({
      nombre: "Administrador",
      email: DEFAULT_EMAIL,
      password: hash,
      rol: "admin",
      fecha_nacimiento: defaultBirthDate,
    });
    console.log(`Admin creado: ${user.email}`);
  }

  console.log("Credenciales:");
  console.log(`  email: ${DEFAULT_EMAIL}`);
  console.log(`  password: ${DEFAULT_PASSWORD}`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Error creando admin:", err);
  process.exit(1);
});
