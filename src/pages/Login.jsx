import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../reusable-Components/utils';
// import '../App.css';
import '../assets/css/login.css';
import Navbar from '../components/Navbar';
const backendUrl = import.meta.env.VITE_BACKEND_URL;

const Login = () => {
    const [loginInfo, setLoginInfo] = useState({
        email: '',
        password: '',
    });

    const navigate = useNavigate();

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setLoginInfo((prevState) => ({ ...prevState, [name]: value }));
    };

    // Handle login form submission
    const handleLogin = async (e) => {
        e.preventDefault();
        const { email, password } = loginInfo;

        if (!email || !password) {
            return handleError('Both email and password are required');
        }

        try {
            const url = `${backendUrl}/auth/login`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginInfo),
            });

            if (!response.ok) {
                const error = await response.json();
                return handleError(error.message || 'Login failed');
            }

            const result = await response.json();
            console.log(result); // Log the response to confirm the structure

            handleSuccess(result.message || 'Login Successful');

            // Save user ID to localStorage
            if (result.user && result.user.id) {
                localStorage.setItem('userId', result.user.id);
            }

            // Redirect to dashboard or homepage
            setTimeout(() => navigate('/profile'), 2000);
        } catch (err) {
            handleError(err.message || 'An unexpected error occurred');
        }
    };


    // Google OAuth login
    const handleGoogleLogin = () => {
        window.location.href = `${backendUrl}/auth/google/`;
        // setTimeout(() => navigate('/profile'), 2000);

    };

    return (
        <>
         <Navbar />
            <div className="login-main">
                <div className="containerr">
                    <div className="login-form">

                        <h1>Login</h1>
                        <form onSubmit={handleLogin}>
                            <div>
                                <label htmlFor="email">Email</label>
                                <input
                                    onChange={handleChange}
                                    type="email"
                                    name="email"
                                    placeholder="Enter Your Email..."
                                    value={loginInfo.email}
                                />
                            </div>
                            <div>
                                <label htmlFor="password">Password</label>
                                <input
                                    onChange={handleChange}
                                    type="password"
                                    name="password"
                                    placeholder="Enter Your Password..."
                                    value={loginInfo.password}
                                />
                            </div>
                            <button type="submit">Login</button>
                            <div>

                            <span>
                                Don't have an account?
                                <Link to="/signup"> Signup</Link>
                            </span>
                            </div>
                        </form>
                        <button onClick={handleGoogleLogin} className="google-login-button">
                            Login with Google
                        </button>
                        <ToastContainer />
                    </div>
                </div>
            </div>
        </>
    );
};

export default Login;
