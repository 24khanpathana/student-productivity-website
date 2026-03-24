import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import toast from 'react-hot-toast';
import { FaPlus, FaFolderOpen, FaEdit, FaTrash, FaHome } from 'react-icons/fa';
import { inputStyle, buttonStyle } from './AuthStyles';

const PapersPage = () => {
    const [subjects, setSubjects] = useState([]);
    const [subjectName, setSubjectName] = useState('');
    const [driveLink, setDriveLink] = useState('');

    const fetchSubjects = async () => {
        try {
            const res = await api.get('/subjects/all');
            setSubjects(res.data);
        } catch (error) {
            toast.error("Failed to fetch subjects.");
        }
    };

    useEffect(() => {
        fetchSubjects();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/subjects/add', { subjectName, driveLink });
            toast.success('Subject added!');
            setSubjectName('');
            setDriveLink('');
            fetchSubjects();
        } catch (error) {
            toast.error('Failed to add subject.');
        }
    };
    
    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this subject?")) {
            try {
                await api.delete(`/subjects/delete/${id}`);
                toast.success('Subject deleted!');
                fetchSubjects();
            } catch (error) {
                toast.error('Failed to delete subject.');
            }
        }
    };

    return (
        <div>
            <Link to="/" className="inline-flex items-center gap-2 mb-8 text-purple-300 hover:text-white transition-colors">
                <FaHome /> Go Home
            </Link>
            <h1 className="text-4xl font-bold mb-8">My Papers</h1>
            
            <div className="glass-card p-8 mb-8">
                <h2 className="text-2xl font-semibold mb-4">Add New Subject</h2>
                <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
                    <input type="text" placeholder="Subject Name" value={subjectName} onChange={(e) => setSubjectName(e.target.value)} className={inputStyle} required />
                    <input type="url" placeholder="Google Drive Folder Link" value={driveLink} onChange={(e) => setDriveLink(e.target.value)} className={inputStyle} required />
                    <button type="submit" className={`${buttonStyle} md:w-auto px-6`}>
                        <FaPlus className="inline mr-2"/> Add
                    </button>
                </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subjects.map(subject => (
                    <div key={subject._id} className="glass-card p-6 flex flex-col justify-between hover:border-purple-400 transition-all duration-300 ease-in-out transform hover:-translate-y-1">
                        <h3 className="text-2xl font-bold mb-4">{subject.subjectName}</h3>
                        <div className="flex items-center justify-between mt-4">
                             <a href={subject.driveLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-blue-500/50 hover:bg-blue-500/80 rounded-lg transition-colors">
                                <FaFolderOpen /> Open Folder
                            </a>
                            <div className="flex gap-2">
                                <button onClick={() => alert('Edit functionality to be implemented!')} className="p-2 hover:text-yellow-400 transition-colors"><FaEdit/></button>
                                <button onClick={() => handleDelete(subject._id)} className="p-2 hover:text-red-400 transition-colors"><FaTrash/></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PapersPage;