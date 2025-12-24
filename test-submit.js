const submitForm = async (data) => {
    try {
        const response = await fetch('http://localhost:3000/api/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                form_id: '6276c103-cd50-46ae-b36d-943ad6e9d159',
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
    name: 'Test User',
    email: 'test@example.com',
    message: 'This is a test submission from the agent.'
});
