import client from "./axios.js";

export const signupRequest = (data) => client.post("/auth/signup", data);
export const signinRequest = (data) => client.post("/auth/signin", data);
export const signoutRequest = () => client.post("/auth/signout");
export const profileRequest = () => client.get("/auth/profile");

// Tests de conexión
export const pingRequest = () => client.get("/health/ping");
export const dbRequest = () => client.get("/health/db");
