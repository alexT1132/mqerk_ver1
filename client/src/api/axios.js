import axios from "axios";

const instance = axios.create({
    baseURL: 'http://192.168.0.21:1002/api',
    withCredentials: true
});

export default instance