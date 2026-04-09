import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  
  // Form State - updated fullName to name
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  
  // API State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const toggleAuthMode = () => {
    setIsLogin((prev) => !prev);
    setError(null); 
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // 1. Construct the full URL using your env variable
    const baseUrl = import.meta.env.VITE_BUS_API_URL || "http://127.0.0.1:5000/api"; 
    const endpoint = isLogin ? '/auth/login' : '/auth/register';
    const url = `${baseUrl}${endpoint}`;
    
    // 2. Construct payload matching your API specs
    const payload = isLogin 
      ? { email: formData.email, password: formData.password }
      : { name: formData.name, email: formData.email, password: formData.password };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      // Catch non-200 HTTP responses
      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed. Please check your credentials.');
      }

      // 3. Handle specific responses based on mode
      if (isLogin) {
        if (data.token) {
            // Save all the returned details
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userId', data.userId);
            localStorage.setItem('userName', data.name);
            localStorage.setItem('userEmail', data.email);
            
            window.dispatchEvent(new Event('authStateChange'));

            // CHECK FOR PENDING REDIRECT
            const returnUrl = sessionStorage.getItem('returnUrl');
            if (returnUrl) {
                sessionStorage.removeItem('returnUrl');
                navigate(returnUrl); // Route back to seats
            } else {
                navigate('/'); 
            }
        } else {
            throw new Error("Invalid response from server.");
        }
      } else {
        // Registration Flow
        if (data.message === "User registered") {
          alert("Registration successful! Please sign in.");
          setIsLogin(true); 
          setFormData(prev => ({ ...prev, password: '' })); // Clear password for safety
        } else if (data.message === "User already exists") {
          throw new Error("User already exists. Please sign in instead.");
        } else {
          throw new Error(data.message || "Registration failed.");
        }
      }

    } catch (err) {
      console.error("API Error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gray-50 p-4 font-sans">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden min-h-[600px]">
        
        {/* LEFT PANEL - Decorative/Branding */}
        <div className="relative md:w-5/12 bg-gradient-to-br from-red-500 to-red-800 text-white p-10 flex flex-col justify-center items-center text-center overflow-hidden transition-all duration-500">
          <div className="absolute top-[-20%] left-[-20%] w-64 h-64 bg-white opacity-10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-48 h-48 bg-white opacity-10 rounded-full blur-xl"></div>
          
          <div className="relative z-10">
            <h2 className="text-4xl font-bold mb-4">
              {isLogin ? "Welcome Back!" : "Hello, Traveler!"}
            </h2>
            <p className="text-red-100 mb-8 leading-relaxed">
              {isLogin 
                ? "To keep connected with us please login with your personal info and manage your bookings."
                : "Enter your personal details and start your journey with the best bus booking experience."}
            </p>
            
            <div className="mt-8">
              <p className="text-sm text-red-200 mb-4">
                {isLogin ? "Don't have an account yet?" : "Already have an account?"}
              </p>
              <button 
                type="button"
                onClick={toggleAuthMode}
                className="px-8 py-3 border-2 border-white text-white rounded-full font-semibold tracking-wide hover:bg-white hover:text-red-600 transition-all duration-300 shadow-lg"
              >
                {isLogin ? "SIGN UP" : "SIGN IN"}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - Forms */}
        <div className="md:w-7/12 p-10 flex flex-col justify-center relative bg-white">
          
          <Link to="/" className="absolute top-6 right-8 text-sm font-medium text-gray-400 hover:text-red-500 transition-colors">
            ✕ Close
          </Link>

          <div className="w-full max-w-sm mx-auto">
            {/* Form Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {isLogin ? "Sign in to BusBooking" : "Create an Account"}
              </h2>
              
              <div className="mt-6 flex items-center justify-center space-x-2 text-gray-400">
                <span className="h-px w-16 bg-gray-200"></span>
                <span className="text-sm font-medium">use your email</span>
                <span className="h-px w-16 bg-gray-200"></span>
              </div>
            </div>

            {/* Error Message Display */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg text-center animate-pulse">
                {error}
              </div>
            )}

            {/* Main Form */}
            <form onSubmit={handleAuth} className="space-y-4 animate-fade-in">
              
              {/* Name (Only visible when Registering) */}
              {!isLogin && (
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Full Name" 
                  required={!isLogin}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all" 
                />
              )}

              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address" 
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all" 
              />
              
              <input 
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password" 
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all" 
              />

              {/* Extras for Login Mode */}
              {isLogin && (
                <div className="flex justify-between items-center mt-2 text-sm">
                  <label className="flex items-center text-gray-500 cursor-pointer">
                    <input type="checkbox" className="mr-2 rounded text-red-500 focus:ring-red-500" />
                    Remember me
                  </label>
                  <a href="#" className="text-red-500 font-medium hover:underline">Forgot password?</a>
                </div>
              )}

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full mt-4 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex justify-center items-center"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  isLogin ? "Sign In" : "Create Account"
                )}
              </button>
            </form>

            {/* Mobile Toggle */}
            <div className="mt-8 text-center md:hidden">
               <p className="text-gray-600">
                 {isLogin ? "Don't have an account?" : "Already have an account?"}
               </p>
               <button 
                 type="button"
                 onClick={toggleAuthMode}
                 className="mt-2 text-red-600 font-bold hover:underline"
               >
                 {isLogin ? "Sign Up here" : "Sign In here"}
               </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;