import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import tutorRoutes from "./routes/tutor.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import verificadorRoutes from "./routes/verificador.routes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Rutas
app.use("/tutor", tutorRoutes);
app.use("/admin", adminRoutes);
app.use("/verificador", verificadorRoutes);

app.listen(process.env.PORT || 3000, () => {
  console.log(`Servidor corriendo en puerto ${process.env.PORT || 3000}`);
});
