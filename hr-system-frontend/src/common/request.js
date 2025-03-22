import axios from "axios";

export const baseApi = "http://127.0.0.1:8000/api/v1/";

export const request = async ({method,path,data,headers})=>{

try {
    const response = await axios({
        method,
        url: baseApi+path,
        data,
        headers,
    })
    return response.data;
} catch (error) {
    console.log(error);
}

}
