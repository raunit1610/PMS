import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../Styles/ForgotPassword.css';

import Heading1 from '../../../Utility/Elements/Heading1';
import Paragraph from '../../../Utility/Elements/Paragraph';
import Label from '../../../Utility/Elements/Label';
import Input from '../../../Utility/Elements/Input';
import Button from '../../../Utility/Elements/Button';
import Navigation from '../../../Utility/Elements/Navigation';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        // Clear error when email changes
        if (error && email) {
            setError('');
        }
    }, [email]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess(false);
        setPassword('');
        setShowPassword(false);

        // Validate email
        if (!email.trim()) {
            setError('Please enter your email address or username');
            setIsLoading(false);
            return;
        }

        // Basic email validation (allows username too as per backend)
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email.includes('@') && !emailPattern.test(email)) {
            setError('Please enter a valid email address');
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.post(`${API_BASE_URL}/auth/forgotPassword`, {
                data: email.trim()
            });

            if (response.data && response.data.password) {
                setSuccess(true);
                setPassword(response.data.password);
                setShowPassword(true);
            } else if (response.data && response.data.message) {
                setError(response.data.message);
            }
        } catch (err) {
            if (err.response?.status === 404) {
                setError('User not found. Please check your email or username and try again.');
            } else {
                setError(err.response?.data?.message || 'An error occurred. Please try again.');
            }
            console.error('Forgot password error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackToLogin = () => {
        navigate('/auth/login');
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <Heading1 class="auth-title" heading="Forgot Password"/>
                    <Paragraph class="auth-subtitle" para="Enter your email or username to recover your password"/>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <Label for="email" class="form-label" text="Email or Username"/>
                        <Input
                            type="text"
                            id="email"
                            name="email"
                            class="form-input"
                            holder="Enter your email or username"
                            auto="email"
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                            disabled={success && showPassword}
                        />
                    </div>

                    {error && (
                        <div className="error-message" style={{ color: 'red', marginBottom: '1rem', fontSize: '0.875rem' }}>
                            {error}
                        </div>
                    )}

                    {success && showPassword && (
                        <div className="success-container">
                            <div className="success-message" style={{ color: 'green', marginBottom: '1rem', fontSize: '0.875rem' }}>
                                User found! Your password is:
                            </div>
                            <div className="password-display">
                                <div className="password-value">{password}</div>
                                <Button
                                    type="button"
                                    class="copy-button"
                                    text="Copy Password"
                                    click={() => {
                                        navigator.clipboard.writeText(password);
                                        alert('Password copied to clipboard!');
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    <div className="button-group">
                        <Button 
                            type="submit" 
                            class="auth-button" 
                            text={isLoading ? 'Searching...' : 'Recover Password'}
                            disabled={isLoading || (success && showPassword)}
                        />
                        
                        {(success && showPassword) && (
                            <Button
                                type="button"
                                class="back-button"
                                text="Back to Login"
                                click={handleBackToLogin}
                            />
                        )}
                    </div>
                </form>

                <div className="auth-footer">
                    <p>
                        Remember your password?{' '}
                        <Navigation path="/auth/login" class="auth-link" text="Sign in"/>
                    </p>
                    <p style={{ marginTop: '0.5rem' }}>
                        Don't have an account?{' '}
                        <Navigation path="/auth/signup" class="auth-link" text="Sign up"/>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
