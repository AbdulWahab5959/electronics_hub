import api from "./api";

export const login = (data) => api.post("/login", data);
export const logout = () => api.post("/logout");
export const getUser = () => api.get("/api/user");