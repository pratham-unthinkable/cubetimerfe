import { apiClient } from "../utils/fetch"

export const login = async ({ username, password }) => {
    return apiClient('https://cubetimerbackend.onrender.com/api/v1/user/auth/login', { method: "POST", data: { username, password } })
}
