import { apiClient } from "../utils/fetch"

const { token } = JSON.parse(window.localStorage.getItem('token'));

export const login = async ({ username, password }) => {
    return apiClient('https://cubetimerbackend.onrender.com/api/v1/user/auth/login', { method: "POST", data: { username, password } })
}
