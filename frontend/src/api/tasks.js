import client from "./axios.js";

export const getTasksRequest = () => client.get("/tasks");
export const getTaskRequest = (id) => client.get(`/tasks/${id}`);
export const createTaskRequest = (data) => client.post("/tasks", data);
export const updateTaskRequest = (id, data) => client.put(`/tasks/${id}`, data);
export const deleteTaskRequest = (id) => client.delete(`/tasks/${id}`);
