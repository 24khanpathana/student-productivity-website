import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaBookOpen, FaChartLine, FaSignOutAlt, FaUserCircle } from 'react-icons/fa';

const LandingPage = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();

    const handleNavigation = (path) => {
        if (isAuthenticated) {
            navigate(path);
        } else {
            navigate('/login', { state: { from: { pathname: path } } });
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-white text-center">
            {isAuthenticated && (
                <div className="absolute top-5 right-5 flex items-center space-x-4">
                    <div className="flex items-center space-x-2 glass-card p-2 px-4">
                       <FaUserCircle className="text-xl" />
                       <span>{user?.name}</span>
                    </div>
                    <button onClick={logout} className="glass-card p-3 hover:bg-red-500/30 transition-colors duration-300">
                        <FaSignOutAlt />
                    </button>
                </div>
            )}
            
            <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight">Student Productivity Hub</h1>
            <p className="text-lg md:text-xl text-gray-300 mb-12 max-w-2xl">
                Organize your subjects, track your progress, and visualize your success. All in one place.
            </p>

            <div className="flex flex-col md:flex-row gap-6">
                <button
                    onClick={() => handleNavigation('/papers')}
                    className="group flex items-center justify-center gap-3 text-xl font-semibold px-10 py-5 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-lg hover:bg-white/20 transform hover:-translate-y-1 transition-all duration-300"
                >
                    <FaBookOpen className="group-hover:rotate-[-5deg] transition-transform" />
                    <span>Papers</span>
                </button>
                <button
                    onClick={() => handleNavigation('/tracker')}
                    className="group flex items-center justify-center gap-3 text-xl font-semibold px-10 py-5 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-lg hover:bg-white/20 transform hover:-translate-y-1 transition-all duration-300"
                >
                    <FaChartLine className="group-hover:scale-110 transition-transform"/>
                    <span>Tracker</span>
                </button>
            </div>
        </div>
    );
};

export default LandingPage;