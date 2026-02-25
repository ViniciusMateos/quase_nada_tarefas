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

  const checkboxColors = {
    high: 'bg-red-500 border-red-500',
    medium: 'bg-yellow-500 border-yellow-500',
    low: 'bg-green-500 border-green-500'
  };

  return (
    <div className="space-y-3 pb-24">
      {tasks.map((task) => (
        <motion.div 
          layout 
          key={task.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
          /* 1. O CLIQUE AGORA ESTÁ NO CARD TODO E TEM CURSOR DE MÃO */
          onClick={() => onEdit(task)}
          className={`flex items-center p-4 rounded-lg border-l-4 ${priorityClasses[task.priority]} ${task.completed ? 'opacity-40' : ''} select-none cursor-pointer`}
        >
          {/* CHECKBOX PERSONALIZADO */}
          <label 
            className="relative flex items-center justify-center cursor-pointer flex-shrink-0 p-1"
            /* 2. TRAVA O CLIQUE AQUI PARA NÃO ABRIR O MODAL AO MARCAR CHECK */
            onClick={(e) => e.stopPropagation()} 
          >
            <input 
              type="checkbox" 
              className="sr-only" 
              checked={task.completed}
              onChange={() => onToggleComplete(task)} 
            />
            
            <div className={`w-6 h-6 rounded border flex items-center justify-center transition-all duration-200 
              ${task.completed 
                ? checkboxColors[task.priority] 
                : 'bg-gray-700 border-gray-600 hover:border-gray-500'
              }`}
            >
              {task.completed && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white font-bold" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </label>
          
          {/* Texto da Tarefa - Apenas visual agora */}
          <div className="flex-1 mx-4 self-stretch flex items-center">
            <span className={`text-gray-100 text-lg ${task.completed ? 'line-through text-gray-500' : ''}`}>
              {task.name}
            </span>
          </div>
          
          {/* Botões de Ação */}
          <div 
            className="flex items-center gap-3 flex-shrink-0" 
            /* 3. TRAVA O CLIQUE AQUI PARA NÃO ABRIR O MODAL AO CLICAR NOS BOTÕES */
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => onEdit(task)} className="text-white hover:text-laranja transition-colors p-1" title="Editar">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
              </svg>
            </button>
            
            <button onClick={() => onDelete(task)} className="text-white hover:text-red-500 transition-colors p-1" title="Excluir">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default TaskList;