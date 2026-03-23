import { useState, useEffect } from 'react';
import { getMyTasks, updateTask } from '../api/taskService';
import DashboardLayout from '../components/DashboardLayout';
import { Link } from 'react-router-dom';

function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyTasks();
  }, []);

  const loadMyTasks = async () => {
    try {
      setLoading(true);
      const data = await getMyTasks();
      setTasks(data);
    } catch (error) {
      console.error('Error loading my tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      await updateTask(taskId, { status: newStatus });
      setTasks(tasks.map((task) => 
        task._id === taskId ? { ...task, status: newStatus } : task
      ));
    } catch (error) {
      console.error('Error updating task status:', error);
      loadMyTasks(); // Revert on failure
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64 text-white">Loading your tasks...</div>
      </DashboardLayout>
    );
  }

  const groupedTasks = {
    'todo': tasks.filter(t => t.status === 'todo'),
    'in-progress': tasks.filter(t => t.status === 'in-progress'),
    'done': tasks.filter(t => t.status === 'done'),
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">My Tasks</h1>
        <p className="text-[var(--text-secondary)] mt-1">Tasks specifically assigned to you across all projects.</p>
      </div>

      {tasks.length === 0 ? (
        <section className="empty-state-card mt-0">
          <div className="empty-icon">🎉</div>
          <h3>You&apos;re all caught up!</h3>
          <p>You don&apos;t have any tasks assigned to you right now.</p>
        </section>
      ) : (
        <div className="flex flex-col xl:flex-row gap-6 h-full pb-8">
          {['todo', 'in-progress', 'done'].map((status) => (
            <div key={status} className="flex-1 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] p-4 min-h-[500px] flex flex-col">
              <div className="font-bold text-sm mb-4 text-white uppercase tracking-wide flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    status === 'todo' ? 'bg-gray-400' : status === 'in-progress' ? 'bg-orange-400' : 'bg-green-400'
                  }`}></span>
                  {status.replace('-', ' ')}
                </div>
                <span className="bg-[var(--bg-hover)] text-[var(--text-secondary)] text-xs py-1 px-2 rounded font-semibold">
                  {groupedTasks[status].length}
                </span>
              </div>
              
              <div className="flex flex-col gap-3 flex-1 overflow-y-auto pr-1">
                {groupedTasks[status].map((task) => (
                  <div key={task._id} className="bg-[var(--bg-card)] p-4 rounded-lg border border-[var(--border)] hover:border-[var(--border-focus)] transition-colors">
                    <div className="mb-2">
                      <h3 className="font-semibold text-white">{task.title}</h3>
                      {task.projectId?.title && (
                        <Link to={`/projects/${task.projectId._id}`} className="text-xs text-[var(--accent-light)] hover:underline mt-1 block">
                          📂 {task.projectId.title}
                        </Link>
                      )}
                    </div>
                    {task.description && (
                       <p className="text-[var(--text-secondary)] text-sm mb-4 line-clamp-2">{task.description}</p>
                    )}
                    {task.dueDate && (
                      <div className="text-xs font-medium px-2 py-1 rounded bg-[var(--bg-hover)] text-[var(--text-secondary)] inline-flex items-center mb-4">
                        <svg className="w-3 h-3 mr-1.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric'})}
                      </div>
                    )}
                    
                    <div className="mt-auto pt-3 border-t border-[var(--border)]">
                      <select
                        value={task.status}
                        onChange={(e) => handleUpdateStatus(task._id, e.target.value)}
                        className="text-xs font-medium border border-[var(--border)] rounded w-full py-1.5 px-2 bg-[var(--bg-secondary)] text-white focus:outline-none focus:border-[var(--accent)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer appearance-none"
                      >
                        <option value="todo">Move to To Do</option>
                        <option value="in-progress">Move to In Progress</option>
                        <option value="done">Move to Done</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

export default MyTasks;
