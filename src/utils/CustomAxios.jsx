import axios from 'axios';

const CustomAxios = axios.create({
  baseURL: 'https://admin.sportsbuz.com/api', 
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, 
});

export default CustomAxios;