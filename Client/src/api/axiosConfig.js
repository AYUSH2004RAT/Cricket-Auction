import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.PROD 
                ? 'https://cricket-auction-backend-vrq8.onrender.com/api' 
                : 'http://localhost:5000/api'
});

console.log("Current API Base URL:", API.defaults.baseURL);

// Request bhejte waqt localStorage se token nikal kar header mein daal do
API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

export default API;