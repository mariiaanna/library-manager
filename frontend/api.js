const API_BASE_URL = 'https://localhost:7210/api'; 

async function fetchProtectedData(endpoint, method = 'GET', body = null, returnFullResponse = false) {
    const token = localStorage.getItem('jwtToken');
    
    if (!token) {
        window.location.href = 'login.html'; 
        throw new Error("Authentication token not found.");
    }

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
    };

    const config = {
        method: method,
        headers: headers,
    };
    
    if (body) {
        config.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, config);

    if (response.status === 401) {
        localStorage.removeItem('jwtToken');
        window.location.href = 'login.html';
        throw new Error("Token expired or invalid.");
    }

    if (response.status === 204 || response.status === 404) {
        return null; 
    }
    
    if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`API Error ${response.status}: ${errorData}`);
    }

    if (returnFullResponse) {
        return response; 
    }

    return await response.json(); 
}