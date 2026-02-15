
const register = async () => {
    const url = 'http://localhost:3000/api/auth/register/worker';
    const body = {
        email: `test_worker_${Date.now()}@example.com`,
        password: 'password123',
        first_name: 'Jean',
        last_name: 'Dupont',
        phone: '0612345678'
    };

    console.log("Sending request to:", url);
    console.log("Payload:", body);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Body:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
};

register();
