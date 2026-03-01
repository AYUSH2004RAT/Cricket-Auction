import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000/api'
});

// Request bhejte waqt localStorage se token nikal kar header mein daal do
API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

export default API;