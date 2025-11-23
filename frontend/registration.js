const API_BASE_URL = 'https://localhost:7210/api'; 
const registerForm = document.getElementById('registrationForm');

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const messageElement = document.getElementById('messageElement');
    messageElement.textContent = ' ';

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try{

        const response = await fetch (`${API_BASE_URL}/Auth/register`,{
            method: 'POST',
            headers:{
                    'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: username, password: password })
        });
        const result = await response.text();
        if (!response.ok) {
                throw new Error(`Registration failed: ${result}`); 
            }
       alert("Registration successful! You can now log in.");
       window.location.href = 'login.html';
    } catch(error){
        console.error("Registration error: ", error);
        messageElement.textContent = error.message.includes('Registration failed') 
                                        ? "Registration failed. Username may already be taken."
                                        : "An unknown error occurred during registration.";
    }
})