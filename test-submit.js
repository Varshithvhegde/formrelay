const submitForm = async (data) => {
    try {
        const response = await fetch('http://localhost:3000/api/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                form_id: 'b79def04-291f-421c-8a95-7cc9dc685ab5',
                ...data
            }),
        })

        console.log('Status:', response.status);
        const text = await response.text();
        console.log('Raw Response:', text);

        try {
            const json = JSON.parse(text);
            console.log('JSON:', json);
        } catch (e) {
            console.log('Response is not JSON');
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

submitForm({
    name: 'Test UserRRR',
    email: 'test@example.com',
    message: 'This is a test submission from the agent.ss'
});
