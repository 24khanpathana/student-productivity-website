import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { formContainerStyle, inputStyle, buttonStyle, linkStyle } from './AuthStyles';

const SignupPage = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            return toast.error("Passwords do not match!");
        }
        try {
            await signup(formData.name, formData.email, formData.password, formData.confirmPassword);
            toast.success('Account created successfully!');
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.msg || 'Failed to sign up');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className={formContainerStyle}>
                <h2 className="text-3xl font-bold text-center">Create Account</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} className={inputStyle} required />
                    <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className={inputStyle} required />
                    <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} className={inputStyle} required />
                    <input type="password" name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} className={inputStyle} required />
                    <button type="submit" className={buttonStyle}>Sign Up</button>
                </form>
                <p className="text-center text-gray-300">
                    Already have an account? <Link to="/login" className={linkStyle}>Login</Link>
                </p>
            </div>
        </div>
    );
};

export default SignupPage;