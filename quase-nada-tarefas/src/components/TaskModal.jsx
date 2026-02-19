import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function TaskModal({ task, onSave, onClose }) {
  const [name, setName] = useState(task?.name || '');
  const [priority, setPriority] = useState(task?.priority || 'medium');
  const [notes, setNotes] = useState(task?.notes || '');
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const priorityOptions = [
    { value: 'high', label: 'Alta', colorClass: 'text-red-400' },
    { value: 'medium', label: 'Média', colorClass: 'text-yellow-400' },
    { value: 'low', label: 'Baixa', colorClass: 'text-green-400' }
  ];

  const currentOption = priorityOptions.find(opt => opt.value === priority);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ name, priority, notes });
  };

  const inputFocusVariants = {
    rest: { 
      borderColor: '#4b5563', 
      boxShadow: '0 0 0 0px rgba(255, 130, 52, 0)',
      transition: { duration: 0.2 }
    },
    focus: { 
      borderColor: '#ff8234',
      boxShadow: '0 0 0 3px rgba(255, 130, 52, 0.3)',
      transition: { duration: 0.2, ease: 'easeInOut' }
    }
  };
  
  const baseInputClass = "w-full bg-gray-900 text-white p-3 rounded-lg border outline-none transition-colors";

  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, scaleY: 0.8, transition: { duration: 0.2 } },
    visible: { opacity: 1, y: 0, scaleY: 1, transition: { type: "spring", stiffness: 300, damping: 25 } }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <motion.div initial={{ scale: 0.8, opacity: 0, y: 50 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.8, opacity: 0, y: 50 }} transition={{ type: "spring", stiffness: 300, damping: 25 }} className="bg-gray-800 p-6 rounded-xl w-full max-w-md border border-gray-700 shadow-2xl">
        <h3 className="text-xl font-bold mb-4 text-laranja">{task ? 'Editar Tarefa' : 'Nova Tarefa'}</h3>
        
        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="mb-4">
            <label htmlFor="task-name" className="block text-sm font-medium text-gray-400 mb-1">Nome da Tarefa</label>
            <motion.input 
              variants={inputFocusVariants} initial="rest" whileFocus="focus"
              type="text" id="task-name" required autoComplete="off"
              className={baseInputClass}
              value={name} onChange={(e) => setName(e.target.value)}
            />
          </div>
          
          <div className="mb-4 relative z-20">
            <label className="block text-sm font-medium text-gray-400 mb-1">Prioridade</label>
            <motion.button
              type="button"
              variants={inputFocusVariants} initial="rest" whileFocus="focus" animate={isDropdownOpen ? "focus" : "rest"}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`${baseInputClass} flex justify-between items-center`}
            >
               <span className={`flex items-center gap-2 ${currentOption.colorClass}`}>
                 <span className={`w-3 h-3 rounded-full bg-current opacity-80`}></span>
                 {currentOption.label}
               </span>
               <motion.svg animate={{ rotate: isDropdownOpen ? 180 : 0 }} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                 <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
               </motion.svg>
            </motion.button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.ul variants={dropdownVariants} initial="hidden" animate="visible" exit="hidden" style={{ originY: 0 }} className="absolute mt-2 w-full bg-gray-900 rounded-lg shadow-xl border border-gray-700 overflow-hidden">
                  {priorityOptions.map((option) => (
                    <motion.li key={option.value} whileHover={{ backgroundColor: '#374151' }} onClick={() => { setPriority(option.value); setIsDropdownOpen(false); }} className={`p-3 cursor-pointer flex items-center gap-2 ${option.colorClass} ${priority === option.value ? 'bg-gray-800 font-bold' : ''}`}>
                      <span className={`w-3 h-3 rounded-full bg-current opacity-80`}></span>{option.label}
                    </motion.li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>

          <div className="mb-6 z-10 relative">
            <label htmlFor="task-notes" className="block text-sm font-medium text-gray-400 mb-1">Anotações</label>
            <motion.textarea 
              variants={inputFocusVariants} initial="rest" whileFocus="focus"
              id="task-notes" rows="3" autoComplete="off"
              className={`${baseInputClass} resize-none`}
              value={notes} onChange={(e) => setNotes(e.target.value)}
            ></motion.textarea>
          </div>

          <div className="flex gap-3 z-10 relative">
            <motion.button whileTap={{ scale: 0.95 }} type="submit" className="flex-1 bg-laranja hover:opacity-80 text-white font-bold py-3 px-4 rounded-lg transition-opacity">Salvar</motion.button>
            <motion.button whileTap={{ scale: 0.95 }} type="button" onClick={onClose} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors">Cancelar</motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default TaskModal;