const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subjectController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware); // Apply middleware to all routes in this file

router.post('/add', subjectController.addSubject);
router.get('/all', subjectController.getAllSubjects);
router.put('/update/:id', subjectController.updateSubject);
router.delete('/delete/:id', subjectController.deleteSubject);

module.exports = router;