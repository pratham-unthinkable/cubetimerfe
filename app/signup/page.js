// app/signup/page.jsx
"use client";
import { useState } from "react";

export default function Signup() {
  const [form, setForm] = useState({ name: "", username: "", password: "" });
  const [status, setStatus] = useState("");
  const [isError, setIsError] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Processing...");
    setIsError(false);

    const res = await fetch("https://cubetimerbackend.onrender.com/api/v1/user/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();

    setStatus(data.message);
    setIsError(!data.success);
    console.log(data);
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto" }}>
      <h2>Signup</h2>

      {status && (
        <p style={{ color: isError ? "red" : "green" }}>{status}</p>
      )}

      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Full Name" value={form.name} onChange={handleChange} required /><br /><br />
        <input type="username" name="username" placeholder="username" value={form.username} onChange={handleChange} required /><br /><br />
        <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required /><br /><br />
        <button type="submit">Signup</button>
      </form>
    </div>
  );
}
