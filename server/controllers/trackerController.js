const Tracker = require('../models/Tracker');
const exceljs = require('exceljs');

// Add a new tracker entry
exports.addTrackerEntry = async (req, res) => {
    const { date, chapterNumber, topicName } = req.body;

    try {
        const newEntry = new Tracker({
            user: req.user.id,
            date,
            chapterNumber,
            topicName,
        });

        const entry = await newEntry.save();
        res.json(entry);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get all tracker entries for the user
exports.getAllTrackerEntries = async (req, res) => {
    try {
        const entries = await Tracker.find({ user: req.user.id }).sort({ date: -1 });
        res.json(entries);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get tracker stats
exports.getTrackerStats = async (req, res) => {
    try {
        const entries = await Tracker.find({ user: req.user.id });

        const chaptersCompleted = entries.reduce((acc, entry) => {
            acc[entry.chapterNumber] = (acc[entry.chapterNumber] || 0) + 1;
            return acc;
        }, {});

        const progressByDate = entries.reduce((acc, entry) => {
            const date = new Date(entry.date).toISOString().split('T')[0];
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {});

        const uniqueChapters = [...new Set(entries.map(e => e.chapterNumber))];
        const uniqueChaptersCompletedCount = uniqueChapters.length;
        const totalChapters = 35; // Assuming 35 chapters

        res.json({
            totalEntries: entries.length,
            chaptersCompleted,
            progressByDate,
            uniqueChaptersCompleted: uniqueChaptersCompletedCount,
            completionPercentage: ((uniqueChaptersCompletedCount / totalChapters) * 100).toFixed(2),
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Export tracker data to Excel
exports.exportTrackerData = async (req, res) => {
    try {
        const entries = await Tracker.find({ user: req.user.id }).sort({ date: -1 });

        const workbook = new exceljs.Workbook();
        workbook.creator = 'Student Productivity Hub';
        workbook.created = new Date();

        const worksheet = workbook.addWorksheet('Tracker Data');
        worksheet.addRow(['Date', 'Chapter Number', 'Topic Name']);
        worksheet.getRow(1).font = { bold: true };

        entries.forEach(entry => {
            worksheet.addRow([
                new Date(entry.date).toLocaleDateString(),
                entry.chapterNumber,
                entry.topicName,
            ]);
        });

        worksheet.columns = [
            { width: 15 },
            { width: 15 },
            { width: 50 },
        ];

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="tracker_data_${new Date().toISOString().split('T')[0]}.xlsx"`
        );

        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// ADD THIS NEW SUMMARY EXPORT FUNCTION
exports.exportTrackerSummary = async (req, res) => {
    try {
        const entries = await Tracker.find({ user: req.user.id });
        if (entries.length === 0) {
            return res.status(404).json({ msg: 'No data found to create a summary.' });
        }

        // --- 1. Calculate Stats (same logic as getTrackerStats) ---
        const chaptersCompleted = entries.reduce((acc, entry) => {
            acc[entry.chapterNumber] = (acc[entry.chapterNumber] || 0) + 1;
            return acc;
        }, {});
        
        const progressByDate = entries.reduce((acc, entry) => {
            const date = new Date(entry.date).toISOString().split('T')[0];
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {});
        
        const uniqueChapters = [...new Set(entries.map(e => e.chapterNumber))];
        const uniqueChaptersCompletedCount = uniqueChapters.length;
        const totalChapters = 35;

        // --- 2. Create Excel Workbook and Sheets ---
        const workbook = new exceljs.Workbook();
        workbook.creator = 'Student Productivity Hub';
        workbook.created = new Date();

        // --- Sheet 1: Overall Summary ---
        const summarySheet = workbook.addWorksheet('Overall Summary');
        summarySheet.addRow(['Metric', 'Value']);
        summarySheet.getRow(1).font = { bold: true };
        summarySheet.addRow(['Total Topics Logged', entries.length]);
        summarySheet.addRow(['Unique Chapters Completed', uniqueChaptersCompletedCount]);
        summarySheet.addRow(['Remaining Chapters', totalChapters - uniqueChaptersCompletedCount]);
        const completionPercentage = ((uniqueChaptersCompletedCount / totalChapters) * 100).toFixed(2);
        summarySheet.addRow(['Chapter Completion', `${completionPercentage}%`]);
        summarySheet.columns = [{ width: 25 }, { width: 15 }];
        
        // --- Sheet 2: Chapter Breakdown ---
        const chapterSheet = workbook.addWorksheet('Chapter Breakdown');
        chapterSheet.addRow(['Chapter', 'Topics Completed']);
        chapterSheet.getRow(1).font = { bold: true };
        const sortedChapters = Object.keys(chaptersCompleted).sort((a,b) => Number(a) - Number(b));
        sortedChapters.forEach(chapter => {
            chapterSheet.addRow([`Chapter ${chapter}`, chaptersCompleted[chapter]]);
        });
        chapterSheet.columns = [{ width: 15 }, { width: 20 }];
        
        // --- Sheet 3: Daily Progress ---
        const dailySheet = workbook.addWorksheet('Daily Progress');
        dailySheet.addRow(['Date', 'Topics Completed']);
        dailySheet.getRow(1).font = { bold: true };
        const sortedDates = Object.keys(progressByDate).sort();
        sortedDates.forEach(date => {
            dailySheet.addRow([date, progressByDate[date]]);
        });
        dailySheet.columns = [{ width: 20 }, { width: 20 }];


        // --- 3. Send the file to the client ---
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="progress_summary_${new Date().toISOString().split('T')[0]}.xlsx"`
        );

        await workbook.xlsx.write(res);
        res.end();

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};