
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Logo from "../../../assets/Logo.svg";
import { nanoid } from "nanoid";
import BgImage from "../../../assets/lp-bg.jpg";
import { api } from "../../../utils/api";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const rememberedUsername = localStorage.getItem("rememberedUsername");
    if (rememberedUsername) {
      setUsername(rememberedUsername);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const payload = {
      requestMetaData: {
        userId: "",
        transactionId: nanoid(),
        timestamp: new Date().toISOString()
      },
      data: {
        username,
        password
      }
    };

    try {
      const json = await api("/users/login", "POST", payload);

      const { code, message, data } = json.result;
      if (code === "200") {
        if (rememberMe) {
          localStorage.setItem("rememberedUsername", username);
        } else {
          localStorage.removeItem("rememberedUsername");
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.userId);
        toast.success(message);
        navigate("/dashboard");
      } else {
        setError(message);
        toast.error(message);
      }
    } catch (err) {
      setError("Login failed. Please try again.");
      toast.error("Login failed");
    }
  };

  return (
    <div
  className="flex flex-col items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat px-4 font-inter"
  style={{ backgroundImage: `url(${BgImage})` }}
>
      <img src={Logo} alt="Logo" className="mb-4 h-10 w-10" />
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Enter your login details
      </h2>
      <div className="w-full max-w-sm bg-white shadow-md rounded-xl p-6">
        <form onSubmit={handleLogin} className="space-y-5">
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center space-x-2 text-gray-700">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                className="h-4 w-4 rounded border-gray-300 focus:ring-blue-500"
              />
              <span>Remember me</span>
            </label>
            <a href="#" className="text-blue-600 hover:underline">Forgot your password?</a>
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md font-medium"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
