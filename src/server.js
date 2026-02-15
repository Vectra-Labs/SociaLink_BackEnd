import express from 'express';
import { config } from "dotenv";
import { disconnectDB, connectDB } from "./config/db.js";
import cors from "cors";
import cookieParser from "cookie-parser";

//Import routes
import authRoutes from "./routes/authRoutes.js"
import workerRoutes from "./routes/workerRoutes.js"
import specialityRoutes from "./routes/specialityRoutes.js";
import diplomaRoutes from "./routes/diplomaRoutes.js";
import missionRoutes from "./routes/missionRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import regionRoutes from "./routes/regionRoutes.js";
import cityRoutes from "./routes/cityRoutes.js";
import establishmentRoutes from "./routes/establishmentRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import availabilityRoutes from "./routes/availabilityRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";


config();
connectDB();


const app = express();


app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(cookieParser());
// Body parsing middlwares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//API routes    
app.use("/api/auth", authRoutes);
app.use("/api/worker", workerRoutes);
app.use("/api/specialities", specialityRoutes);
app.use("/api/diplomas", diplomaRoutes);
app.use("/api", missionRoutes);
app.use("/api/regions", regionRoutes);
app.use("/api", cityRoutes);
app.use("/api/establishment", establishmentRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/feedbacks", feedbackRoutes);
app.use("/api/chat", chatRoutes);


app.use("/api/admin", adminRoutes);




const PORT = 3000;

const server = app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
})

// Hundle unhandled promise rejections
process.on("unhandledRejection", async (err) => {
  console.error("Unhandled Rejection:", err);
  server.close(async () => {
    await disconnectDB();
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", async (err) => {
  console.error("Uncaught Exception:", err);

  await disconnectDB();
  process.exit(1);

});

// Graceful shutdown 

process.on("SIGTERM", async () => {
  console.log("SIGTERM received. Shutting down gracefully");
  server.close(async () => {
    await disconnectDB();
    process.exit(0);
  });
});