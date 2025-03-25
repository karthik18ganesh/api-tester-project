import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockLogin } from '../utils/mockApi';
import Logo from '../assets/Logo.svg'; // You can replace this with your actual logo path

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    const rememberedUsername = localStorage.getItem('rememberedUsername');
    if (rememberedUsername) {
      setUsername(rememberedUsername);
      setRememberMe(true);
    }
  }, []);
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
  
    try {
      await mockLogin({ username, password });
  
      if (rememberMe) {
        localStorage.setItem('rememberedUsername', username);
      } else {
        localStorage.removeItem('rememberedUsername');
      }
  
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };
  

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 font-inter">
      {/* Logo */}
      <img src={Logo} alt="Logo" className="mb-4 h-10 w-10" />

      {/* Title */}
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Enter your login details
      </h2>

      {/* Card */}
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

            <a href="#" className="text-blue-600 hover:underline">
              Forgot your password?
            </a>
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
