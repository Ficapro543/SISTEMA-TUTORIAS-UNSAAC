async function testTutors() {
    try {
        const response = await fetch('http://localhost:3001/api/assignments/tutors');
        const data = await response.json();
        console.log("Status:", response.status);
        console.log("Data length:", data.length);
        console.log("First tutor:", data[0]);
    } catch (err) {
        console.error("Error:", err.message);
    }
}

testTutors();
