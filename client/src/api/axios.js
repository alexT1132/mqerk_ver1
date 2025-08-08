import axios from "axios";

const instance = axios.create({
    baseURL: 'http://192.168.0.14:1002/api',
    withCredentials: true
});

export default instance;