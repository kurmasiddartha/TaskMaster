import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProjectById } from '../api/projectService';
import { getTasksByProject, createTask, updateTask, deleteTask, reorderTasks } from '../api/taskService';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import CreateTaskModal from '../components/CreateTaskModal';
import ManageMembersModal from '../components/ManageMembersModal';
import DashboardLayout from '../components/DashboardLayout';
import ActivityTimeline from '../components/ActivityTimeline';

function ProjectDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);

  useEffect(() => {
    loadProjectAndTasks();
  }, [id]);

  const loadProjectAndTasks = async () => {
    try {
      setLoading(true);
      const [projectData, tasksData] = await Promise.all([
        getProjectById(id),
        getTasksByProject(id),
      ]);
      setProject(projectData);
      setTasks(tasksData);
    } catch (error) {
      console.error('Error loading project details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      // Find the max order for the target status column so it drops at the bottom
      const statusTasks = tasks.filter(t => t.status === taskData.status);
      const order = statusTasks.length;
      
      await createTask({ ...taskData, order });
      loadProjectAndTasks();
      setIsTaskModalOpen(false);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Delete this task?')) {
      try {
        await deleteTask(taskId);
        setTasks(tasks.filter((t) => t._id !== taskId));
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    // We do an optimistic UI update
    const sourceStatus = source.droppableId;
    const destStatus = destination.droppableId;

    // Reconstruct columns
    const columns = {
      'todo': tasks.filter(t => t.status === 'todo').sort((a,b) => a.order - b.order),
      'in-progress': tasks.filter(t => t.status === 'in-progress').sort((a,b) => a.order - b.order),
      'done': tasks.filter(t => t.status === 'done').sort((a,b) => a.order - b.order),
    };

    const sourceCol = Array.from(columns[sourceStatus]);
    const destCol = sourceStatus === destStatus ? sourceCol : Array.from(columns[destStatus]);
    
    // Remove from source
    const [movedTask] = sourceCol.splice(source.index, 1);
    
    // Add to dest
    movedTask.status = destStatus;
    destCol.splice(destination.index, 0, movedTask);

    // Update orders for affected columns
    const affectedTasks = [];
    
    const updateColumnOrders = (col) => {
      col.forEach((task, index) => {
        task.order = index;
        affectedTasks.push({ id: task._id, order: index, status: task.status });
      });
    };

    if (sourceStatus === destStatus) {
      updateColumnOrders(sourceCol);
    } else {
      updateColumnOrders(sourceCol);
      updateColumnOrders(destCol);
    }

    // Update the local state entirely
    const newTasks = [
      ...(sourceStatus === 'todo' || destStatus === 'todo' ? columns['todo'] : tasks.filter(t => t.status === 'todo')),
      ...(sourceStatus === 'in-progress' || destStatus === 'in-progress' ? columns['in-progress'] : tasks.filter(t => t.status === 'in-progress')),
      ...(sourceStatus === 'done' || destStatus === 'done' ? columns['done'] : tasks.filter(t => t.status === 'done'))
    ];

    setTasks(newTasks);

    // Fire API silently
    try {
      await reorderTasks(affectedTasks);
    } catch (error) {
      console.error('Error reordering tasks:', error);
      loadProjectAndTasks(); // Revert on failure
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64 text-white">Loading project details...</div>
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout>
        <div className="text-center mt-20 text-xl font-semibold text-white">Project not found</div>
      </DashboardLayout>
    );
  }

  const isAdmin = 
    project.createdBy._id === user._id || 
    project.members.some(m => m.user._id === user._id && m.role === 'Admin');

  // Ensure tasks are grouped and sorted by order
  const getSortedTasks = (status) => tasks.filter(t => t.status === status).sort((a, b) => a.order - b.order);
  const groupedTasks = {
    'todo': getSortedTasks('todo'),
    'in-progress': getSortedTasks('in-progress'),
    'done': getSortedTasks('done'),
  };

  const getPriorityColor = (p) => {
    switch (p) {
      case 'high': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'medium': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      case 'low': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      default: return 'text-[var(--text-secondary)] bg-[var(--bg-hover)] border-[var(--border)]';
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <Link to="/projects" className="text-[var(--accent-light)] hover:text-[var(--accent)] mb-4 inline-flex items-center gap-2 transition-colors">
            <span>&larr;</span> Back to Projects
          </Link>
          <h1 className="text-3xl font-bold text-white">{project.title}</h1>
          <p className="text-[var(--text-secondary)] mt-2 max-w-2xl">{project.description}</p>
          
          <div className="flex items-center gap-3 mt-4">
            <div className="flex -space-x-2">
              <div 
                className="w-8 h-8 rounded-full bg-[var(--accent)] border-2 border-[var(--bg)] flex items-center justify-center text-xs font-bold text-white relative z-10" 
                title={`${project.createdBy.name} (Creator)`}
              >
                {project.createdBy.name.charAt(0)}
              </div>
              {project.members.slice(0, 4).map((m, idx) => (
                <div 
                  key={m.user._id} 
                  className={`w-8 h-8 rounded-full bg-[var(--bg-secondary)] border-2 border-[var(--bg)] flex items-center justify-center text-xs font-bold text-white relative z-${9-idx}`}
                  title={`${m.user.name} (${m.role})`}
                >
                  {m.user.name.charAt(0)}
                </div>
              ))}
              {project.members.length > 4 && (
                <div className="w-8 h-8 rounded-full bg-[var(--bg-card)] border-2 border-[var(--bg)] flex items-center justify-center text-xs font-bold text-[var(--accent-light)]">
                  +{project.members.length - 4}
                </div>
              )}
            </div>
            
            {isAdmin && (
               <button onClick={() => setIsMemberModalOpen(true)} className="text-xs font-bold text-[var(--accent-light)] hover:text-white bg-[var(--bg-hover)] px-3 py-1.5 rounded-lg transition">
                 Manage Team
               </button>
            )}
          </div>
        </div>
        
        <button
          onClick={() => setIsTaskModalOpen(true)}
          className="btn-primary whitespace-nowrap"
        >
          + Add Task
        </button>
      </div>

      {/* Kanban Board using dnd-kit */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex flex-col xl:flex-row gap-6 h-full pb-8">
          {['todo', 'in-progress', 'done'].map((status) => (
            <div key={status} className="flex-1 flex flex-col h-full min-h-[500px]">
              <div className="font-bold text-sm mb-4 text-white uppercase tracking-wide flex justify-between items-center px-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    status === 'todo' ? 'bg-gray-400' : status === 'in-progress' ? 'bg-orange-400' : 'bg-green-400'
                  }`}></span>
                  {status.replace('-', ' ')}
                </div>
                <span className="bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)] text-xs py-1 px-2.5 rounded-full font-semibold">
                  {groupedTasks[status].length}
                </span>
              </div>
              
              <Droppable droppableId={status}>
                {(provided, snapshot) => (
                  <div 
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`flex-1 rounded-xl p-3 border ${
                      snapshot.isDraggingOver ? 'bg-[var(--bg-hover)] border-[var(--accent)]' : 'bg-[var(--bg-secondary)] border-[var(--border)]'
                    } transition-colors flex flex-col gap-3 min-h-[150px]`}
                  >
                    {groupedTasks[status].map((task, index) => {
                      const isAssignee = task.assignedTo?._id === user._id;
                      const canDrag = isAdmin || isAssignee;

                      return (
                        <Draggable key={task._id} draggableId={task._id} index={index} isDragDisabled={!canDrag}>
                          {(provided, snapshot) => (
                            <div 
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`bg-[var(--bg-card)] p-4 rounded-lg border ${
                                snapshot.isDragging ? 'border-[var(--accent)] shadow-[0_10px_30px_rgba(0,0,0,0.3)] scale-[1.02] z-50 transform cursor-grabbing' : 'border-[var(--border)] hover:border-[var(--border-focus)] cursor-grab'
                              } transition-all group relative`}
                              style={provided.draggableProps.style}
                            >
                              <div className="flex justify-between items-start mb-2 gap-2">
                                <h3 className="font-semibold text-white leading-tight">{task.title}</h3>
                                {isAdmin && (
                                  <button onClick={() => handleDeleteTask(task._id)} className="text-[var(--text-muted)] hover:text-[var(--error)] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                  </button>
                                )}
                              </div>
                              
                              {task.description && (
                                 <p className="text-[var(--text-secondary)] text-sm mb-4 line-clamp-2">{task.description}</p>
                              )}
                              
                              <div className="flex flex-wrap items-center gap-2 mt-auto pt-2">
                                {task.priority && (
                                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getPriorityColor(task.priority)}`}>
                                    {task.priority}
                                  </span>
                                )}

                                {task.dueDate && (
                                  <div className="text-xs font-medium px-2 py-0.5 rounded bg-[var(--bg-hover)] text-[var(--text-secondary)] inline-flex items-center">
                                    <svg className="w-3 h-3 mr-1 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric'})}
                                  </div>
                                )}
                                
                                {task.assignedTo && (
                                  <div 
                                    className="w-6 h-6 rounded-full bg-[#3b82f6] border border-[#2563eb] flex items-center justify-center text-[10px] font-bold text-white ml-auto"
                                    title={`Assigned to ${task.assignedTo.name}`}
                                  >
                                     {task.assignedTo.name.charAt(0)}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      <ActivityTimeline projectId={id} />

      {isTaskModalOpen && (
        <CreateTaskModal
          projectId={id}
          isAdmin={isAdmin}
          members={[
            { user: project.createdBy, role: 'Admin' },
            ...project.members
          ]}
          onClose={() => setIsTaskModalOpen(false)}
          onSubmit={handleCreateTask}
        />
      )}

      {isMemberModalOpen && (
        <ManageMembersModal
          project={project}
          onClose={() => setIsMemberModalOpen(false)}
          onUpdate={loadProjectAndTasks}
        />
      )}
    </DashboardLayout>
  );
}

export default ProjectDetails;
