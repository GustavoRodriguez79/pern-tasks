import axios from "axios";

// Instancia única de Axios. "withCredentials" envía la cookie del JWT en cada petición.
const client = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

export default client;
