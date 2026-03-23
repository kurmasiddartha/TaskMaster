import api from './axios';

export const getTasksByProject = async (projectId) => {
  const response = await api.get(`/api/tasks/project/${projectId}`);
  return response.data;
};

export const createTask = async (taskData) => {
  const response = await api.post('/api/tasks', taskData);
  return response.data;
};

export const updateTask = async (id, taskData) => {
  const response = await api.put(`/api/tasks/${id}`, taskData);
  return response.data;
};

export const deleteTask = async (id) => {
  const response = await api.delete(`/api/tasks/${id}`);
  return response.data;
};

export const getMyTasks = async () => {
  const response = await api.get('/api/tasks/my');
  return response.data;
};

export const reorderTasks = async (items) => {
  const response = await api.put('/api/tasks/reorder', { items });
  return response.data;
};
