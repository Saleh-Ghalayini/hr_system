import axios from "axios";

const baseApi = axios.create({
  baseURL: import.meta.env.VITE_Base_API,
  headers: {
    "ngrok-skip-browser-warning": "69420",
  },
});

export default baseApi;
