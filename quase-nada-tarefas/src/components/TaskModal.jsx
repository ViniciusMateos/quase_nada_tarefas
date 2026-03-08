import { useState, useEffect } from 'react'; // Adicionei o useEffect aqui
import { motion, AnimatePresence } from 'framer-motion';

function TaskModal({ task, onSave, onClose }) {
  const [name, setName] = useState(task?.name || '');
  const [priority, setPriority] = useState(task?.priority || 'medium');
  const [notes, setNotes] = useState(task?.notes || '');
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // --- ATALHO PARA FECHAR NO ESC ---
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    
    // Limpa o evento quando o modal fecha para não pesar no navegador
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

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
    rest: { borderColor: '#4b5563', transition: { duration: 0.2 } },
    focus: { borderColor: '#ff8234', transition: { duration: 0.2 } }
  };
  
  const baseInputClass = "w-full bg-gray-900 text-white p-3 rounded-lg border border-gray-700 outline-none";

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
      className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[120] pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
    >
      <style>{`
        .modal-scroll::-webkit-scrollbar { width: 4px; }
        .modal-scroll::-webkit-scrollbar-thumb { background: #4b5563; border-radius: 10px; }
      `}</style>

      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-gray-800 p-6 rounded-2xl w-full max-w-3xl border border-gray-700 shadow-2xl overflow-y-auto max-h-full modal-scroll"
      >
        <h3 className="text-2xl font-bold mb-6 text-laranja">{task ? 'Editar Tarefa' : 'Nova Tarefa'}</h3>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Nome da Tarefa</label>
            <motion.input 
              variants={inputFocusVariants} initial="rest" whileFocus="focus"
              type="text" required value={name} onChange={(e) => setName(e.target.value)}
              className={baseInputClass}
              autoComplete="off"
            />
          </div>
          
          <div className="relative z-[130]">
            <label className="block text-sm font-medium text-gray-400 mb-1">Prioridade</label>
            <button
              type="button" onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`${baseInputClass} flex justify-between items-center`}
            >
              <span className={`flex items-center gap-2 ${currentOption.colorClass}`}>
                <span className="w-2 h-2 rounded-full bg-current"></span>
                {currentOption.label}
              </span>
              <span className={`transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}>▼</span>
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.ul initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute mt-2 w-full bg-gray-900 rounded-lg border border-gray-700 overflow-hidden shadow-xl z-[140]">
                  {priorityOptions.map((opt) => (
                    <li key={opt.value} onClick={() => { setPriority(opt.value); setIsDropdownOpen(false); }} className="p-3 hover:bg-gray-800 cursor-pointer text-gray-300">
                      {opt.label}
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Anotações</label>
            <textarea 
              rows="8" className={`${baseInputClass} resize-none modal-scroll`}
              value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Braddock dan, leall niink..."
            ></textarea>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 bg-laranja text-white font-bold py-4 rounded-xl hover:opacity-90 active:scale-95 transition-all">Salvar</button>
            <button type="button" onClick={onClose} className="flex-1 bg-gray-700 text-white font-bold py-4 rounded-xl hover:bg-gray-600 active:scale-95 transition-all">Cancelar</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default TaskModal;