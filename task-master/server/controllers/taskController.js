const Task = require('../models/Task');
const Project = require('../models/Project');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');
const Reminder = require('../models/Reminder');

// Helper to calculate remindAt date
const calculateRemindAt = (dueDate, option) => {
  if (!dueDate || option === 'none' || !option) return null;
  const date = new Date(dueDate);
  switch (option) {
    case 'at_due_time': return date;
    case '10_min_before': return new Date(date.getTime() - 10 * 60000);
    case '30_min_before': return new Date(date.getTime() - 30 * 60000);
    case '1_hour_before': return new Date(date.getTime() - 60 * 60000);
    case '1_day_before': return new Date(date.getTime() - 24 * 60 * 60000);
    default: return null;
  }
};

// Helper to check admin status
const isProjectAdmin = (project, userId) => {
  if (!project) return false;
  const userStr = userId.toString();
  if (project.createdBy.toString() === userStr) return true;
  const member = project.members.find(m => m.user.toString() === userStr);
  return member && member.role === 'Admin';
};

// Helper to check member status
const isProjectMember = (project, userId) => {
  if (!project) return false;
  const userStr = userId.toString();
  if (project.createdBy.toString() === userStr) return true;
  return project.members.some(m => m.user.toString() === userStr);
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
  try {
    const { title, description, projectId, status, dueDate, assignedTo, priority, order, reminderOption } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (!isProjectMember(project, req.user._id)) {
      return res.status(403).json({ message: 'Not a member of this project' });
    }

    // Only admins can assign tasks to someone
    if (assignedTo && !isProjectAdmin(project, req.user._id)) {
      return res.status(403).json({ message: 'Only Admins can assign tasks' });
    }

    const task = await Task.create({
      title,
      description,
      projectId,
      createdBy: req.user._id,
      assignedTo: assignedTo || null,
      status: status || 'todo',
      dueDate,
      priority: priority || 'medium',
      order: order !== undefined ? order : 0,
    });

    await ActivityLog.create({
      action: 'TASK_CREATED',
      userId: req.user._id,
      projectId: task.projectId,
      taskId: task._id,
      details: `Created task "${task.title}"`,
    });

    if (dueDate && reminderOption && reminderOption !== 'none') {
      const remindAt = calculateRemindAt(dueDate, reminderOption);
      if (remindAt) {
        await Reminder.create({
          taskId: task._id,
          userId: assignedTo || req.user._id,
          remindAt
        });
      }
    }

    if (assignedTo && assignedTo.toString() !== req.user._id.toString()) {
      await Notification.create({
        userId: assignedTo,
        message: `You were assigned a new task: "${task.title}"`,
        link: `/projects/${projectId}`
      });
    }

    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all tasks for a project
// @route   GET /api/tasks/project/:projectId
// @access  Private
const getTasksByProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project || !isProjectMember(project, req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to view tasks' });
    }

    const tasks = await Task.find({ projectId: req.params.projectId })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ order: 1, createdAt: -1 });
      
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a task status or details
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const project = await Project.findById(task.projectId);
    
    const isAdmin = isProjectAdmin(project, req.user._id);
    const isAssignee = task.assignedTo && task.assignedTo.toString() === req.user._id.toString();

    if (!isAdmin && !isAssignee) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    const oldStatus = task.status;
    const oldAssignee = task.assignedTo ? task.assignedTo.toString() : null;

    let updates = req.body;
    // If not admin but user is assignee, only allow status update
    if (!isAdmin && isAssignee) {
      updates = {};
      if (req.body.status) updates.status = req.body.status;
    }

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    // Activity & Notification logic
    if (updatedTask.status !== oldStatus) {
      await ActivityLog.create({
        action: 'STATUS_UPDATED',
        userId: req.user._id,
        projectId: task.projectId,
        taskId: task._id,
        details: `Changed status from ${oldStatus} to ${updatedTask.status}`,
      });
      // Notify assignee if not the updater
      if (updatedTask.assignedTo && updatedTask.assignedTo._id.toString() !== req.user._id.toString()) {
        await Notification.create({
          userId: updatedTask.assignedTo._id,
          message: `Task "${updatedTask.title}" status changed to ${updatedTask.status}`,
          link: `/projects/${task.projectId}`
        });
      }
      // Notify task creator (Admin/Team Lead) if not the updater
      if (updatedTask.createdBy && updatedTask.createdBy._id.toString() !== req.user._id.toString()) {
        await Notification.create({
          userId: updatedTask.createdBy._id,
          message: `Task "${updatedTask.title}" status changed to ${updatedTask.status}`,
          link: `/projects/${task.projectId}`
        });
      }
    }

    if (updatedTask.assignedTo && updatedTask.assignedTo._id.toString() !== oldAssignee && updatedTask.assignedTo._id.toString() !== req.user._id.toString()) {
      await ActivityLog.create({
        action: 'TASK_ASSIGNED',
        userId: req.user._id,
        projectId: task.projectId,
        taskId: task._id,
        details: `Assigned task to a new user`,
      });
      await Notification.create({
        userId: updatedTask.assignedTo._id,
        message: `You were assigned to task: "${updatedTask.title}"`,
        link: `/projects/${task.projectId}`
      });
    }

    // Handle reminders on update
    if (req.body.dueDate !== undefined || req.body.reminderOption) {
      const remindAt = calculateRemindAt(updatedTask.dueDate, req.body.reminderOption);
      if (remindAt) {
        await Reminder.findOneAndUpdate(
          { taskId: updatedTask._id, status: 'pending' },
          { remindAt, status: 'pending', userId: updatedTask.assignedTo || updatedTask.createdBy },
          { upsert: true }
        );
      } else if (req.body.reminderOption === 'none' || !updatedTask.dueDate) {
        await Reminder.updateMany({ taskId: updatedTask._id }, { status: 'cancelled' });
      }
    }

    if (updatedTask.status === 'done') {
      await Reminder.updateMany({ taskId: updatedTask._id }, { status: 'cancelled' });
    }

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const project = await Project.findById(task.projectId);
    if (!isProjectAdmin(project, req.user._id)) {
      return res.status(403).json({ message: 'Only Admins can delete tasks' });
    }

    await Reminder.deleteMany({ taskId: task._id });
    await task.deleteOne();
    res.json({ message: 'Task removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get tasks assigned to the logged-in user
// @route   GET /api/tasks/my
// @access  Private
const getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id })
      .populate('projectId', 'title')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reorder tasks (drag and drop)
// @route   PUT /api/tasks/reorder
// @access  Private
const reorderTasks = async (req, res) => {
  try {
    const { items } = req.body;
    
    if (!items || !items.length) {
      return res.status(400).json({ message: 'No items provided' });
    }

    // Fetch existing tasks to compare status changes
    const itemIds = items.map(i => i.id);
    const existingTasks = await Task.find({ _id: { $in: itemIds } });

    const bulkOps = items.map(item => ({
      updateOne: {
        filter: { _id: item.id },
        update: { order: item.order, status: item.status }
      }
    }));

    await Task.bulkWrite(bulkOps);
    
    // Add specific activity logs and notifications for status changes via drag-drop
    for (const item of items) {
      const oldTask = existingTasks.find(t => t._id.toString() === item.id);
      if (oldTask && oldTask.status !== item.status) {
        // Status changed via drag
        await ActivityLog.create({
          action: 'STATUS_UPDATED',
          userId: req.user._id,
          projectId: oldTask.projectId,
          taskId: oldTask._id,
          details: `Moved task from ${oldTask.status} to ${item.status}`,
        });

        // Notify assignee if the person dragging isn't the assignee
        if (oldTask.assignedTo && oldTask.assignedTo.toString() !== req.user._id.toString()) {
          await Notification.create({
            userId: oldTask.assignedTo,
            message: `Task "${oldTask.title}" was moved to ${item.status}`,
            link: `/projects/${oldTask.projectId}`
          });
        }

        // Notify task creator (Admin/Team Lead) if the person dragging isn't the creator
        if (oldTask.createdBy && oldTask.createdBy.toString() !== req.user._id.toString()) {
          await Notification.create({
            userId: oldTask.createdBy,
            message: `Task "${oldTask.title}" was moved to ${item.status}`,
            link: `/projects/${oldTask.projectId}`
          });
        }
      }
    }

    // Generic board updated activity log
    if (items.length > 0) {
      const sampleTask = await Task.findById(items[0].id);
      if (sampleTask) {
        await ActivityLog.create({
          action: 'BOARD_REORDERED',
          userId: req.user._id,
          projectId: sampleTask.projectId,
          details: `Reordered tasks on the board`,
        });
      }
    }

    res.json({ message: 'Tasks reordered successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTask,
  getTasksByProject,
  updateTask,
  deleteTask,
  getMyTasks,
  reorderTasks,
};
