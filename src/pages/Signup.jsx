import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../reusable-Components/utils';
import '../App.css';
import '../assets/css/login.css';
import Navbar from '../components/Navbar';
const backendUrl = import.meta.env.VITE_BACKEND_URL;

const Signup = () => {
    const [signupInfo, setSignupInfo] = useState({
        name: '',
        email: '',
        password: '',
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSignupInfo((prevState) => ({ ...prevState, [name]: value }));
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        const { name, email, password } = signupInfo;
    
        if (!name || !email || !password) {
            return handleError('Name, email, and password are required');
        }
    
        try {
            const url = `${backendUrl}/auth/signup`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(signupInfo),
            });
    
            if (!response.ok) {
                const error = await response.json();
                return handleError(error.message || 'Signup failed');
            }
    
            const result = await response.json();
            console.log(result); // Log the response to confirm the structure
    
            handleSuccess(result.message || 'Signup Successful');
    
            // Save user ID to localStorage
            if (result.user && result.user.id) {
                localStorage.setItem('userId', result.user.id);
            }
    
            // Redirect to login page
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            handleError(err.message || 'An unexpected error occurred');
        }
    };
    

    const handleGoogleSignup = () => {
        // Redirect to the Google OAuth route
        // window.location.href = 'http://localhost:8080/auth/google/';
        // setTimeout(() => navigate('/profile'), 2000);

            window.location.href = `${backendUrl}/auth/google`;
      
        
    };

    return (
        <>
         <Navbar />
        <div className="login-main">
        <div className="containerr">
            <h1>Signup</h1>
            <form onSubmit={handleSignup}>
                <div>
                    <label htmlFor="name">Name</label>
                    <input
                        onChange={handleChange}
                        type="text"
                        name="name"
                        autoFocus
                        placeholder="Enter Your Name...."
                        value={signupInfo.name}
                    />
                </div>
                <div>
                    <label htmlFor="email">Email</label>
                    <input
                        onChange={handleChange}
                        type="email"
                        name="email"
                        placeholder="Enter Your Email...."
                        value={signupInfo.email}
                    />
                </div>
                <div>
                    <label htmlFor="password">Password</label>
                    <input
                        onChange={handleChange}
                        type="password"
                        name="password"
                        placeholder="Enter Your Password...."
                        value={signupInfo.password}
                    />
                </div>
                <button type="submit">Signup</button>
                <span>
                    Already have an account?
                    <Link to="/login"> Login</Link>
                </span>
            </form>
            <button onClick={handleGoogleSignup} className="google-signup-button">
                Signup with Google
            </button>
            <ToastContainer />
        </div>
        </div>
        </>
    );
};

export default Signup;
