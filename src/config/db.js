import { PrismaClient } from "@prisma/client";



const prisma = new PrismaClient({
    log:
    process.env.NODE_ENV === "development"
        ? ["query", "info", "warn", "error"]
        :  ["error"],
});


const connectDB = async () => {
    try {
        await prisma.$connect();    
    } catch (error) {
        console.error(`Error connecting to database:, ${error.message}`);
        process.exit(1);
    }
};


const disconnectDB = async () => {
    
    await prisma.$disconnect();
};

export {prisma, connectDB, disconnectDB};