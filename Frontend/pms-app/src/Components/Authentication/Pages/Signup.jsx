import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../Styles/Signup.css';

import Heading1 from '../../../Utility/Elements/Heading1';
import Paragraph from '../../../Utility/Elements/Paragraph';
import Label from '../../../Utility/Elements/Label';
import Input from '../../../Utility/Elements/Input';
import Button from '../../../Utility/Elements/Button';
import Navigation from '../../../Utility/Elements/Navigation';

const Signup = () => {
    const navigate = useNavigate();
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

    const [cred, setCred] = useState({
        name: '',
        email: '',
        password: ''
    });

    const [chkPass, isSamePass] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        // Check if user is already logged in (optional)
        const userId = localStorage.getItem('userId');
        if (userId) {
            // Optionally navigate to home if already logged in
            navigate('/auth/login');
        }
    }, [navigate]);

    useEffect(() => {
        // Clear error when password or confirm password changes
        if (error && (cred.password || chkPass)) {
            setError('');
        }
    }, [cred.password, chkPass]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess(false);

        // Validate password match
        if (cred.password !== chkPass) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        // Validate password strength (optional)
        if (cred.password.length < 6) {
            setError('Password must be at least 6 characters long');
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.post(`${API_BASE_URL}/auth/signup`, {
                name: cred.name,
                email: cred.email,
                password: cred.password
            });

            if (response.data && response.data.message) {
                setSuccess(true);
                // Navigate to login page after successful signup
                setTimeout(() => {
                    navigate('/auth/login');
                }, 1500);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Signup failed. Please try again.');
            console.error('Signup error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <Heading1 class="auth-title" heading="Create Account"/>
                    <Paragraph class="auth-subtitle" para="Sign up to get started"/>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <Label for="name" class="form-label" text="Full Name"/>
                        <Input
                            type="text"
                            id="name"
                            name="name"
                            class="form-input"
                            holder="Enter your full name"
                            auto="name"
                            onChange={(e) =>
                                setCred((prevState) => ({
                                    ...prevState,
                                    name: e.target.value
                                }))
                            }
                            value={cred.name}
                        />
                    </div>

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
                            holder="Create a password"
                            auto="new-password"
                            onChange={(e) =>
                                setCred((prevState) => ({
                                    ...prevState,
                                    password: e.target.value
                                }))
                            }
                            value={cred.password}
                        />
                    </div>

                    <div className="form-group">
                        <Label for="confirmPassword" class="form-label" text="Confirm Password"/>
                        <Input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            class={`form-input ${chkPass && chkPass !== cred.password ? 'form-input-error' : ''}`}
                            holder="Confirm your password"
                            auto="new-password"
                            value={chkPass}
                            onChange={(e) =>
                                isSamePass(e.target.value)
                            }
                        />
                    </div>

                    <div className="form-options">
                        <label className="checkbox-label">
                            <Input type="checkbox" class="checkbox-input" required />
                            <span>I agree to the Terms and Conditions</span>
                        </label>
                    </div>

                    {error && (
                        <div className="error-message" style={{ color: 'red', marginBottom: '1rem', fontSize: '0.875rem' }}>
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="success-message" style={{ color: 'green', marginBottom: '1rem', fontSize: '0.875rem' }}>
                            Account created successfully! Redirecting to login...
                        </div>
                    )}
                    <Button 
                        type="submit" 
                        class="auth-button" 
                        text={isLoading ? 'Creating Account...' : 'Sign Up'}
                        disabled={isLoading || success}
                    />
                </form>

                <div className="auth-footer">
                    <p>
                        Already have an account?{' '}
                        <Navigation path="/auth/login" class="auth-link" text="Sign in"/> 
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
