import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import toast from 'react-hot-toast';
import { FaHome, FaSave, FaDownload, FaFileExcel } from 'react-icons/fa';
import { inputStyle, buttonStyle } from './AuthStyles';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement, ArcElement, Colors } from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement, ArcElement, Colors);

const TrackerPage = () => {
    const today = new Date().toISOString().split('T')[0];
    const [date, setDate] = useState(today);
    const [chapterNumber, setChapterNumber] = useState('1');
    const [topicName, setTopicName] = useState('');
    const [stats, setStats] = useState(null);
    const [entries, setEntries] = useState([]);
    const [isExporting, setIsExporting] = useState(false);
    const [isSummaryExporting, setIsSummaryExporting] = useState(false);

    const fetchData = async () => {
        try {
            const [statsRes, entriesRes] = await Promise.all([
                api.get('/tracker/stats'),
                api.get('/tracker/all')
            ]);
            setStats(statsRes.data);
            setEntries(entriesRes.data);
        } catch (error) {
            toast.error("Failed to load tracker data.");
        }
    };
    
    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/tracker/add', { date, chapterNumber: parseInt(chapterNumber), topicName });
            toast.success('Progress saved!');
            setTopicName('');
            setChapterNumber('1');
            fetchData();
        } catch (error) {
            toast.error('Failed to save progress.');
        }
    };

    const handleExport = async (exportType) => {
        const isSummary = exportType === 'summary';
        const endpoint = isSummary ? '/tracker/export-summary' : '/tracker/export';
        const setLoading = isSummary ? setIsSummaryExporting : setIsExporting;
        const toastId = `export-toast-${exportType}`;
        const filename = isSummary 
            ? `progress_summary_${new Date().toISOString().split('T')[0]}.xlsx`
            : `progress_tracker_${new Date().toISOString().split('T')[0]}.xlsx`;

        setLoading(true);
        toast.loading('Generating Excel file...', { id: toastId });

        try {
            const response = await api.get(endpoint, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success('Download started!', { id: toastId });
        } catch (error) {
            console.error('Export failed:', error);
            toast.error('Failed to export data.', { id: toastId });
        } finally {
            setLoading(false);
        }
    };
    
    const chartData = useMemo(() => {
        if (!stats) return null;
        const sortedChapterKeys = Object.keys(stats.chaptersCompleted).sort((a, b) => Number(a) - Number(b));
        const barData = {
            labels: sortedChapterKeys.map(key => `Chapter ${key}`),
            datasets: [
                {
                    label: 'Topics Completed',
                    data: sortedChapterKeys.map(key => stats.chaptersCompleted[key]),
                    backgroundColor: 'rgba(99, 102, 241, 0.8)',
                    borderRadius: 4,
                }
            ]
        };
        const sortedDates = Object.keys(stats.progressByDate).sort();
        const lineData = {
            labels: sortedDates,
            datasets: [
                {
                    label: 'Progress over time',
                    data: sortedDates.map(date => stats.progressByDate[date]),
                    borderColor: 'rgba(56, 189, 248, 1)',
                    backgroundColor: 'rgba(56, 189, 248, 0.2)',
                    fill: true,
                    tension: 0.3
                }
            ]
        };

        const pieData = {};
        return { barData, lineData, pieData };
    }, [stats]);


    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <Link to="/" className="inline-flex items-center gap-2 text-purple-300 hover:text-white transition-colors">
                        <FaHome /> Go Home
                    </Link>
                    <h1 className="text-4xl font-bold mt-2">Progress Tracker</h1>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => handleExport('summary')} disabled={isSummaryExporting} className="flex items-center gap-2 px-4 py-2 bg-blue-600/60 hover:bg-blue-600/90 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        <FaFileExcel />
                        {isSummaryExporting ? '...' : 'Summary'}
                    </button>
                    <button onClick={() => handleExport('raw')} disabled={isExporting} className="flex items-center gap-2 px-4 py-2 bg-green-600/50 hover:bg-green-600/80 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        <FaDownload />
                        {isExporting ? '...' : 'Export Log'}
                    </button>
                </div>
            </div>

            {/* Log Progress Card */}
            <div className="glass-card p-8 mb-8">
                <h2 className="text-2xl font-semibold mb-6">Log Your Progress</h2>
                <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex flex-col flex-grow w-full md:w-auto">
                        <label htmlFor="date" className="mb-2 text-sm text-slate-400">Date</label>
                        <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputStyle} required />
                    </div>
                    <div className="flex flex-col flex-grow w-full md:w-auto">
                        <label htmlFor="chapter" className="mb-2 text-sm text-slate-400">Chapter</label>
                        <select id="chapter" value={chapterNumber} onChange={(e) => setChapterNumber(e.target.value)} className={inputStyle} required>
                            {[...Array(35).keys()].map(n => <option key={n + 1} value={n + 1}>{n + 1}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col w-full md:w-1/2">
                        <label htmlFor="topic" className="mb-2 text-sm text-slate-400">Topic</label>
                        <input id="topic" type="text" placeholder="e.g., React Hooks" value={topicName} onChange={(e) => setTopicName(e.target.value)} className={inputStyle} required />
                    </div>
                    <button type="submit" className={`${buttonStyle} md:w-auto px-6 flex items-center justify-center gap-2`}>
                        <FaSave /> Save
                    </button>
                </form>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* NEW: Summary Card */}
                    <div className="glass-card p-6">
                        <h2 className="text-2xl font-semibold mb-4">Summary</h2>
                        {stats ? (
                            <div className="space-y-4">
                                <div className="flex justify-between text-lg">
                                    <span className="text-slate-400">Total Topics Logged:</span>
                                    <span className="font-bold">{entries.length}</span>
                                </div>
                                <div className="flex justify-between text-lg">
                                    <span className="text-slate-400">Chapters Completed:</span>
                                    <span className="font-bold">{stats.UniqueChaptersCompleted} / 35</span>
                                </div>
                                <hr className="border-slate-700"/>
                                <h3 className="font-semibold text-slate-300 pt-2">Chapter Breakdown</h3>
                                <div className="max-h-48 overflow-y-auto pr-2">
                                     <table className="w-full text-left text-sm">
                                        <tbody>
                                            {Object.keys(stats.chaptersCompleted).sort((a, b) => Number(a) - Number(b)).map(chapter => (
                                                <tr key={chapter} className="border-b border-slate-800">
                                                    <td className="py-2 text-slate-400">Chapter {chapter}</td>
                                                    <td className="py-2 text-right">{stats.chaptersCompleted[chapter]} topics</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : <p className="text-slate-400">No summary data available.</p>}
                    </div>

                    {/* Recent Entries Card */}
                    <div className="glass-card p-6">
                        <h2 className="text-2xl font-semibold mb-4">Recent Entries</h2>
                        <div className="max-h-96 overflow-y-auto pr-2">
                            {entries.length > 0 ? (
                                <table className="w-full text-left">
                                    <thead className="sticky top-0 bg-slate-900/50 backdrop-blur-sm">
                                        <tr>
                                            <th className="p-3 text-sm font-semibold text-slate-400">Date</th>
                                            <th className="p-3 text-sm font-semibold text-slate-400">Ch.</th>
                                            <th className="p-3 text-sm font-semibold text-slate-400">Topic</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {entries.slice(0, 20).map(entry => ( // Show latest 20
                                            <tr key={entry._id} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                                                <td className="p-3 text-sm">{new Date(entry.date).toLocaleDateString()}</td>
                                                <td className="p-3 text-sm text-center">{entry.chapterNumber}</td>
                                                <td className="p-3">{entry.topicName}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : <p className="text-center text-slate-400 py-4">No entries yet.</p>}
                        </div>
                    </div>
                </div>

                {/* Visualization Card */}
                <div className="lg:col-span-3 glass-card p-8">
                    <h2 className="text-2xl font-semibold mb-6">Visualization</h2>
                    {stats && chartData ? (
                        <div className="space-y-10">
                            <div>
                                <h3 className="text-lg font-semibold mb-2 text-center text-slate-300">Topics per Chapter</h3>
                                <Bar data={chartData.barData} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2 text-center text-slate-300">Progress Over Time</h3>
                                <Line data={chartData.lineData} />
                            </div>
                        </div>
                    ) : <p className="text-center text-slate-400 py-20">No data to display. Start tracking your progress!</p>}
                </div>
            </div>
        </div>
    );
};

export default TrackerPage;