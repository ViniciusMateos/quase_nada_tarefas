import React from 'react';
import { motion } from 'framer-motion';

function TaskList({ tasks, onEdit, onDelete, onToggleComplete }) {
  if (tasks.length === 0) {
    return (
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-gray-500 text-center mt-10">
        Sem tarefas para esta semana.
      </motion.p>
    );
  }

  const priorityClasses = {
    high: 'bg-red-950/40 border-red-500',
    medium: 'bg-yellow-950/40 border-yellow-500',
    low: 'bg-green-950/40 border-green-500'
  };

  return (
    <div className="space-y-3 pb-24">
      {tasks.map((task) => (
        <motion.div 
          layout 
          key={task.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className={`flex items-center p-4 rounded-lg border-l-4 ${priorityClasses[task.priority]} ${task.completed ? 'opacity-40' : 'bg-gray-800'}`}
        >
          <input 
            type="checkbox" 
            className="form-checkbox h-5 w-5 bg-gray-900 border-gray-600 rounded text-laranja focus:ring-0 focus:ring-offset-0" 
            checked={task.completed}
            onChange={() => onToggleComplete(task)} 
          />
          <span 
            className={`flex-1 mx-4 cursor-pointer ${task.completed ? 'line-through text-gray-500' : 'text-gray-100'}`}
            onClick={() => onEdit(task)}
          >
            {task.name}
          </span>
          
          <div className="ml-4 space-x-2 flex">
            <button onClick={() => onEdit(task)} className="text-gray-400 hover:text-laranja" title="Editar">✏️</button>
            <button onClick={() => onDelete(task)} className="text-gray-400 hover:text-red-500" title="Excluir">❌</button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default TaskList;