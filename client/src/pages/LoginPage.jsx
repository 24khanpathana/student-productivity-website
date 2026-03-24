import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { formContainerStyle, inputStyle, buttonStyle, linkStyle } from './AuthStyles'; // Create this file or inline styles

const LoginPage = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/";

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(formData.email, formData.password);
            toast.success('Logged in successfully!');
            navigate(from, { replace: true });
        } catch (error) {
            toast.error(error.response?.data?.msg || 'Failed to login');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className={formContainerStyle}>
                <h2 className="text-3xl font-bold text-center">Login</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className={inputStyle} required />
                    <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} className={inputStyle} required />
                    <button type="submit" className={buttonStyle}>Login</button>
                </form>
                <p className="text-center text-gray-300">
                    Don't have an account? <Link to="/signup" className={linkStyle}>Sign Up</Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;