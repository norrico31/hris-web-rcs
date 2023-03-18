import axios from 'axios'

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL + '/api'
})

axiosClient.interceptors.request.use((req) => {
    let token = localStorage.getItem('t') as any satisfies string
    token &&= JSON.parse(token)
    req.headers.Authorization = 'Bearer ' + token
    return req
})

axiosClient.interceptors.response.use((res) => res, err => {
    if (err.response && err.response.status === 401) {
        console.log(401)
        localStorage.clear()
        window.location.reload()
        return err
    }
    return Promise.reject(err)
})

export default axiosClient