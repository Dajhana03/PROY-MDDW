"use client";

import { useState } from "react";
import { loginUser } from "../authService";

function Login() {
    const [email, setEmail]=useState("");
    const [password, setPassword]=useState("");
    
    const handleLogin = async(e) => {
        e.preventDefault();

        try {
            const user = await loginUser(email, password);
            console.log("Usuario: ",user);
            alert("Succesfull Login")
        } catch (error) {
            alert("Incorrect Credentials");
        }
    }

    return (
        <form className="loginForm" onSubmit={handleLogin}>
            <input type="email" placeholder="email" onChange={(e)=> setEmail(e.target.value)}/>
            <input type="password" placeholder="password" onChange={(e) => setPassword(e.target.value)}/>
            <button type="submit">Iniciar</button>
        </form>
    );
}

export default Login;
