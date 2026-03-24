const Subject = require('../models/Subject');

exports.addSubject = async (req, res) => {
    const { subjectName, driveLink } = req.body;
    try {
        const newSubject = new Subject({
            user: req.user.id,
            subjectName,
            driveLink,
        });
        const subject = await newSubject.save();
        res.json(subject);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getAllSubjects = async (req, res) => {
    try {
        const subjects = await Subject.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(subjects);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.updateSubject = async (req, res) => {
    const { subjectName, driveLink } = req.body;
    try {
        let subject = await Subject.findById(req.params.id);
        if (!subject) return res.status(404).json({ msg: 'Subject not found' });
        if (subject.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }
        subject = await Subject.findByIdAndUpdate(req.params.id, { $set: { subjectName, driveLink } }, { new: true });
        res.json(subject);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.deleteSubject = async (req, res) => {
    try {
        let subject = await Subject.findById(req.params.id);
        if (!subject) return res.status(404).json({ msg: 'Subject not found' });
        if (subject.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }
        await Subject.findByIdAndRemove(req.params.id);
        res.json({ msg: 'Subject removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};