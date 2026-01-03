import express from 'express';
import {config} from "dotenv";
import {disconnectDB, connectDB} from "./config/db.js";

//Import routes
import authRoutes from "./routes/authRoutes.js"
import workerRoutes from "./routes/workerRoutes.js"
import specialityRoutes from "./routes/specialityRoutes.js";

config();

connectDB();


const app = express();

// Body parsing middlwares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//API routes    
app.use("api/auth", authRoutes);
app.use("api/worker", workerRoutes);
app.use("/api/specialities", specialityRoutes);



const PORT = 5001;

const server = app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
})

// Hundle unhandled promise rejections
process.on("unhandledRejection", async (err) => {
    console.error("Unhandled Rejection:",err);
    server.close(async () => {
      await disconnectDB();
    process.exit(1);
    });
});

// Handle uncaught exceptions
process.on("uncaughtException", async (err) => {
    console.error("Uncaught Exception:",err);
   
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