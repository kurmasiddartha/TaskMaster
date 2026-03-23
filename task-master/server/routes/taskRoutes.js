const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasksByProject,
  updateTask,
  deleteTask,
  getMyTasks,
  reorderTasks,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router.route('/reorder').put(protect, reorderTasks);
router.route('/my').get(protect, getMyTasks);
router.route('/').post(protect, createTask);
router.route('/project/:projectId').get(protect, getTasksByProject);
router.route('/:id').put(protect, updateTask).delete(protect, deleteTask);

module.exports = router;
