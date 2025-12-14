import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../Styles/Login.css';

import Heading1 from '../../../Utility/Elements/Heading1';
import Paragraph from '../../../Utility/Elements/Paragraph';
import Label from '../../../Utility/Elements/Label';
import Input from '../../../Utility/Elements/Input';
import Button from '../../../Utility/Elements/Button';
import Navigation from '../../../Utility/Elements/Navigation';

const Login = () => {
    const navigate = useNavigate();
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

    const [cred, setCred] = useState({
        email: '',
        password: ''
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Check if user is already logged in (optional - check localStorage/session)
        const userId = localStorage.getItem('userId');
        if (userId) {
            // Optionally navigate to home if already logged in
            navigate(`/home/${userId}`);
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await axios.post(`${API_BASE_URL}/auth/login`, {
                email: cred.email,
                password: cred.password
            });

            if (response.data && response.data.uid) {
                // Store user ID in localStorage
                localStorage.setItem('userId', response.data.uid);
                localStorage.setItem('isLoggedIn', 'true');
                
                // Navigate to home page on successful login with user ID
                navigate(`/home/${response.data.uid}`);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
            console.error('Login error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <Heading1 class="auth-title" heading="Welcome Back To PMS"/>
                    <Paragraph class="auth-subtitle" para="Sign in to your account"/>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <Label for="email" class="form-label" text="Email Address"/>
                        <Input
                            type="email"
                            id="email"
                            name="email"
                            class="form-input"
                            holder="Enter your email"
                            auto="email"
                            onChange={(e) =>
                                setCred((prevState) => ({
                                    ...prevState,
                                    email: e.target.value
                                }))
                            }
                            value={cred.email}
                        />
                    </div>

                    <div className="form-group">
                        <Label for="password" class="form-label" text="Password"/>
                        <Input
                            type="password"
                            id="password"
                            name="password"
                            class="form-input"
                            holder="Enter your password"
                            auto="current-password"
                            onChange={(e) =>
                                setCred((prevState) => ({
                                    ...prevState,
                                    password: e.target.value
                                }))
                            }
                            value={cred.password}
                        />
                    </div>

                    <div className="form-options">
                        <Navigation path="/forgot-password" class="forgot-password-link" text="Forgot password?"/>
                    </div>

                    {error && (
                        <div className="error-message" style={{ color: 'red', marginBottom: '1rem', fontSize: '0.875rem' }}>
                            {error}
                        </div>
                    )}
                    <Button 
                        type="submit" 
                        class="auth-button" 
                        text={isLoading ? 'Signing In...' : 'Sign In'}
                        disabled={isLoading}
                    />
                </form>

                <div className="auth-footer">
                    <p>
                        Don't have an account?{' '}
                        <Navigation path="/auth/signup" class="auth-link" text="Sign up"/>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
