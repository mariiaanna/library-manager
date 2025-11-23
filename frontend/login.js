const API_BASE_URL = 'https://localhost:7210/api'; 



const loginForm = document.getElementById('loginForm');
const messageElement = document.getElementById('message');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    messageElement.textContent = ' ';

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try{
        const response = await fetch(`${API_BASE_URL}/Auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({name: username, password: password})
        });
        if(!response.ok){
            throw new Error('Incorrect username or password.');
        }
        const jwtToken = await response.text();
        localStorage.setItem('jwtToken', jwtToken);
        window.location.href = 'index.html';
    } catch(error) {
        console.error("Login error: ", error);
        messageElement.textContent = error.message;
    }
})