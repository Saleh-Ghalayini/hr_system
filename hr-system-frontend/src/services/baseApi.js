import axios from "axios";

const baseApi = axios.create({
  baseURL: import.meta.env.VITE_Base_API,
});

export default baseApi;
