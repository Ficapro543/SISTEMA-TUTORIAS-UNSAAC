const bcrypt = require('bcrypt');

async function checkHash() {
    const password = 'Admin123!';
    const hash = '$2b$10$wH3gL0N0Y0Fz8E1c4a3p1OZzHqW6F8pJrZ9m7Qk1L0fUuFZ6zYy3K';

    const match = await bcrypt.compare(password, hash);
    console.log(`Password '${password}' matches hash: ${match}`);

    if (!match) {
        console.log("Generating new hash for 'Admin123!'...");
        const newHash = await bcrypt.hash(password, 10);
        console.log("New Hash:", newHash);
    }
}

checkHash();
