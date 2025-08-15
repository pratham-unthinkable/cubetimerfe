"use client";
import { useState } from "react";
import { login } from "../services/userServices";
import { useUser } from "../hooks/useUser";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [status, setStatus] = useState("");
  const [isError, setIsError] = useState(false);
  const { login: loginClient, user } = useUser();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Processing...");
    setIsError(false);

    let { message, success, data } = await login(form);
    if (success && data) {
      loginClient(data.token, data.user);
    }
    setStatus(message ?? "");
    setIsError(!success);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
        
        {user?.name && (
          <p className="text-center text-gray-600 mb-4">
            Logged in as <span className="font-semibold">{user.name}</span>
          </p>
        )}

        {status && (
          <p
            className={`text-center mb-4 ${
              isError ? "text-red-500" : "text-green-500"
            }`}
          >
            {status}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              name="username"
              placeholder="Enter your username"
              value={form.username}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
