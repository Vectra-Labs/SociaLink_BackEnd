
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const run = async () => {
    const email = `flow_test_${Date.now()}@example.com`;
    const password = 'password123';

    try {
        // 1. Register
        console.log("1. Registering...", email);
        const regRes = await fetch('http://localhost:3000/api/auth/register/worker', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email,
                password,
                first_name: 'Test',
                last_name: 'Flow',
                phone: '0600000000'
            })
        });
        console.log("Register Status:", regRes.status);
        if (!regRes.ok) {
            console.error(await regRes.text());
            return;
        }

        // 2. Get Code from DB
        console.log("2. Fetching code from DB...");
        // Wait a bit to ensure DB write
        await new Promise(r => setTimeout(r, 1000));

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            console.error("User not found in DB");
            return;
        }
        console.log("Code:", user.email_code);

        // 3. Verify
        console.log("3. Verifying Email...");
        const verRes = await fetch('http://localhost:3000/api/auth/verify-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code: user.email_code })
        });
        console.log("Verify Status:", verRes.status);
        if (!verRes.ok) console.error(await verRes.text());

        // 4. Login
        console.log("4. Logging in...");
        const loginRes = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const loginData = await loginRes.json();
        console.log("Login Status:", loginRes.status);

        if (loginData.token) {
            console.log("SUCCESS: Token received!");
        } else {
            console.log("FAILURE: No token received", loginData);
        }

    } catch (e) {
        console.error("Script Error:", e);
    } finally {
        await prisma.$disconnect();
    }
};

run();
