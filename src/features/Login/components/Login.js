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
  const [isLoading, setIsLoading] = useState(false);
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
    setIsLoading(true);

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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat px-4 font-inter"
      style={{ backgroundImage: `url(${BgImage})` }}
    >
      <div className="relative z-10 flex flex-col items-center max-w-md w-full">
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-xl border-2 border-indigo-100 w-full">
          <div className="flex flex-col items-center mb-6">
            <div className="bg-indigo-600 p-3 rounded-full shadow-md mb-4">
              <img src={Logo} alt="Logo" className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 text-center">
              Welcome
            </h2>
            <p className="text-gray-600 text-center text-sm mt-1">
              Enter your credentials to access your account
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white/90 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white/90 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center space-x-2 text-gray-700">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Remember me</span>
              </label>
              <a href="#" className="text-indigo-600 hover:text-indigo-800 font-medium">
                Forgot password?
              </a>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-4 rounded-md font-medium transition-colors duration-200 relative overflow-hidden shadow-md"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </span>
              ) : (
                "Login"
              )}
            </button>
          </form>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 bg-white/70 px-3 py-1 rounded-full inline-block shadow-sm">
            API Automation &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;