import { Router } from 'express';
import { createTask, updateTask, listTasks, createOrReplaceSubmission, listSubmissionsByStudent, listSubmissionsByTask, feedbackUploadMiddleware, taskUploadMiddleware, updateSubmissionGrade } from '../controllers/feedback.controller.js';

const router = Router();

// Tasks
router.post('/feedback/tasks', taskUploadMiddleware, createTask);
router.put('/feedback/tasks/:id', taskUploadMiddleware, updateTask);
router.get('/feedback/tasks', listTasks);

// Submissions
router.post('/feedback/submissions', feedbackUploadMiddleware, createOrReplaceSubmission);
router.get('/feedback/submissions/student/:id_estudiante', listSubmissionsByStudent);
router.get('/feedback/submissions/task/:id_task', listSubmissionsByTask);
router.put('/feedback/submissions/:id/grade', updateSubmissionGrade);

export default router;
