import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { browserName, deviceType, osName } from 'react-device-detect';
import { Eye, EyeOff } from 'lucide-react';

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [authMode, setAuthMode] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'reset' && params.get('token')) {
      return 'reset';
    }
    return 'login';
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  
  // States for password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const action = params.get('action');
    const token = params.get('token');

    if (action === 'reset' && token) {
      setAuthMode('reset');
    } else if (action === 'forgot') {
      setAuthMode('forgot');
    }
    
  }, [location.search]);

  const toggleMode = (mode) => {
    setAuthMode(mode);
    setError(null);
    setSuccessMsg(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error dynamically as user types
    if (error) setError(null);
  };

  const validateForm = () => {
    // Email Validation Regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (authMode !== 'reset' && !emailRegex.test(formData.email)) {
      setError("Please enter a valid email address.");
      return false;
    }

    // Password Length Validation
    if ((authMode === 'login' || authMode === 'signup' || authMode === 'reset') && formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return false;
    }

    // Confirm Password Validation
    if (authMode === 'reset' && formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }

    return true;
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    
    // Run frontend validation before making API calls
    if (!validateForm()) return;

    const deviceDetails = `${browserName} on ${osName} (${deviceType})`;
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    const baseUrl = import.meta.env.VITE_BUS_API_URL || "http://127.0.0.1:5000/api";
    let endpoint = '';
    let payload = {};

    try {
      if (authMode === 'login') {
        endpoint = '/auth/login';
        payload = { email: formData.email, password: btoa(formData.password), device: deviceDetails };
      } else if (authMode === 'signup') {
        endpoint = '/auth/register';
        payload = { name: formData.name, email: formData.email, password: btoa(formData.password) };
      } else if (authMode === 'forgot') {
        endpoint = '/auth/forgot';
        payload = { email: formData.email, device: deviceDetails };
      } else if (authMode === 'reset') {
        if (formData.password !== formData.confirmPassword) throw new Error("Passwords do not match");
        endpoint = '/auth/reset-password';
        const token = new URLSearchParams(location.search).get('token');
        payload = { token, password: btoa(formData.password) };
      }

      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || data.message || 'Operation failed');

      if (authMode === 'login') {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userName', data.name);
        window.dispatchEvent(new Event('authStateChange'));

        const returnUrl = sessionStorage.getItem('returnUrl');
        if (returnUrl) {
          sessionStorage.removeItem('returnUrl'); // Clean up
          navigate(returnUrl);
        } else {
          navigate('/');
        }
      } else if (authMode === 'signup') {
        setSuccessMsg("Registration successful! Logging you in...");
        setAuthMode('login');
      } else if (authMode === 'forgot') {
        setSuccessMsg("Reset link sent! Please check your email inbox.");
      } else if (authMode === 'reset') {
        alert("Password updated! You can now login with your new password.");
        setAuthMode('login');
        setFormData({ ...formData, password: '' });
        navigate('/auth'); 
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden min-h-[600px]">
        
        {/* LEFT PANEL */}
        <div className="md:w-5/12 bg-gradient-to-br from-red-600 to-red-800 text-white p-10 flex flex-col justify-center items-center text-center">
           <h2 className="text-4xl font-bold mb-4">
             {authMode === 'reset' ? "Security First" : "Travel with Ease"}
           </h2>
           <p className="text-red-100 mb-8">
             {authMode === 'forgot' ? "Don't worry, it happens to the best of us." : "Manage your bookings and explore new destinations."}
           </p>
           {authMode === 'login' && (
             <button onClick={() => toggleMode('signup')} className="px-8 py-2 border-2 border-white rounded-full hover:bg-white hover:text-red-600 transition-all">SIGN UP</button>
           )}
           {(authMode === 'signup' || authMode === 'forgot' || authMode === 'reset') && (
             <button onClick={() => toggleMode('login')} className="px-8 py-2 border-2 border-white rounded-full hover:bg-white hover:text-red-600 transition-all">BACK TO LOGIN</button>
           )}
        </div>

        {/* RIGHT PANEL */}
        <div className="md:w-7/12 p-10 flex flex-col justify-center bg-white relative">
          <Link to="/" className="absolute top-6 right-8 text-gray-400">✕ Close</Link>
          
          <div className="w-full max-w-sm mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
              {authMode === 'login' && "Sign In"}
              {authMode === 'signup' && "Create Account"}
              {authMode === 'forgot' && "Forgot Password"}
              {authMode === 'reset' && "Set New Password"}
            </h2>

            {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center">{error}</div>}
            {successMsg && <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg text-sm text-center">{successMsg}</div>}

            <form onSubmit={handleAuth} className="space-y-4">
              {authMode === 'signup' && (
                <input type="text" name="name" onChange={handleChange} placeholder="Full Name" required className="w-full px-4 py-3 bg-gray-50 border rounded-lg" />
              )}
              
              {(authMode !== 'reset') && (
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" required className="w-full px-4 py-3 bg-gray-50 border rounded-lg" />
              )}

              {(authMode === 'login' || authMode === 'signup' || authMode === 'reset') && (
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password" 
                    onChange={handleChange} 
                    placeholder={authMode === 'reset' ? "New Password" : "Password"} 
                    required 
                    className="w-full px-4 py-3 bg-gray-50 border rounded-lg pr-12" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-red-500 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              )}

              {authMode === 'reset' && (
                <div className="relative">
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    name="confirmPassword" 
                    onChange={handleChange} 
                    placeholder="Confirm New Password" 
                    required 
                    className="w-full px-4 py-3 bg-gray-50 border rounded-lg pr-12" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-red-500 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              )}

              {authMode === 'login' && (
                <div className="text-right">
                  <button type="button" onClick={() => toggleMode('forgot')} className="text-red-500 text-sm hover:underline">Forgot password?</button>
                </div>
              )}

              <button disabled={isLoading} className="w-full bg-red-500 text-white font-bold py-3 rounded-lg hover:bg-red-600 transition-all">
                {isLoading ? "Processing..." : (
                  authMode === 'login' ? "Sign In" : 
                  authMode === 'signup' ? "Register" : 
                  authMode === 'forgot' ? "Send Reset Link" : "Update Password"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;