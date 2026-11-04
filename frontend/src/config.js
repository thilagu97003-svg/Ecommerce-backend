import { API_BASE } from "./config"; 
export const API_BASE = (import.meta.env.VITE_API_BASE || `${API_BASE}`).replace(/\/$/, "");