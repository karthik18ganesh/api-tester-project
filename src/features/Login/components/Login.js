// src/features/Login/components/Login.js - Updated with Zustand
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FiActivity, FiZap } from "react-icons/fi";
import { nanoid } from "nanoid";
import BgImage from "../../../assets/lp-bg.jpg";
import { userManagement } from "../../../utils/api";
import { useAuthStore } from "../../../stores/authStore";
import { useProjectStore } from "../../../stores/projectStore";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Zustand stores
  const { 
    login, 
    setLoading, 
    isLoading, 
    rememberMe, 
    rememberedUsername, 
    setRememberMe 
  } = useAuthStore();
  
  const { activeProject } = useProjectStore();

  useEffect(() => {
    // Initialize username from store if remembered
    if (rememberedUsername) {
      setUsername(rememberedUsername);
    }
  }, [rememberedUsername]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await userManagement.auth.login(username, password);

      const { code, message, data } = response.result;
      if (code === "200") {
        // Update remember me preference
        setRememberMe(rememberMe, rememberMe ? username : '');

        // Store token immediately
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.userId);

        // Make a follow-up API call to get complete user details including permissions and projects
        try {
          const userDetailsResponse = await userManagement.users.getById(data.userId);
          const userDetails = userDetailsResponse.result.data;
          
          // Store enhanced user data with permissions and assigned projects
          if (userDetails.permissions) {
            localStorage.setItem('permissions', JSON.stringify(userDetails.permissions));
          }
          if (userDetails.assignedProjects) {
            localStorage.setItem('assignedProjects', JSON.stringify(userDetails.assignedProjects));
          }

          // Login through Zustand store with complete user data
          login({
            user: userDetails,
            token: data.token,
            userId: data.userId,
            role: data.role,
          });
        } catch (userDetailsError) {
          console.warn('Failed to fetch complete user details:', userDetailsError);
          
          // Fallback: login with basic data from login response
          login({
            user: { userId: data.userId, role: data.role },
            token: data.token,
            userId: data.userId,
            role: data.role,
          });
        }

        toast.success(message);
        
        // Navigate based on active project status
        if (activeProject) {
          // User has an active project, navigate to dashboard
          navigate("/dashboard");
        } else {
          // No active project, navigate to dashboard (ProjectActivationGuard will handle project selection)
          navigate("/dashboard");
        }
      } else {
        setError(message);
        toast.error(message);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError("Login failed. Please try again.");
      toast.error("Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRememberMeChange = () => {
    setRememberMe(!rememberMe, !rememberMe ? username : '');
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat px-4 font-inter"
      style={{ backgroundImage: `url(${BgImage})` }}
    >
      <div className="relative z-10 flex flex-col items-center max-w-md w-full">
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-xl border-2 border-indigo-100 w-full">
          <div className="flex flex-col items-center mb-6">
            {/* Modern Logo with Icon + Text */}
            <div className="flex items-center mb-4">
              <div className="bg-indigo-600 p-2 rounded-lg shadow-md mr-3">
                <FiActivity className="h-8 w-8 text-white" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold text-gray-900">
                  API<span className="text-indigo-600">Tester</span>
                </h1>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                  Automation Platform
                </p>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 text-center">
              Welcome Back
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
                  onChange={handleRememberMeChange}
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