import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSwipeable } from 'react-swipeable';
import { motion, AnimatePresence } from 'framer-motion';

import WeekNavigator from './components/WeekNavigator';
import TaskList from './components/TaskList';
import TaskModal from './components/TaskModal';

const API_URL = import.meta.env.VITE_API_URL;

function DeleteConfirmModal({ task, onConfirm, onCancel }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <motion.div initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 50 }} transition={{ type: "spring", stiffness: 300, damping: 25 }} className="bg-gray-800 p-6 rounded-xl w-full max-w-sm border border-gray-700 shadow-2xl text-center">
        <h3 className="text-xl font-bold mb-3 text-red-500">Excluir Tarefa</h3>
        <p className="text-gray-300 mb-6">Tem certeza que deseja excluir a tarefa <br/><span className="text-white font-bold">"{task?.name}"</span>?</p>
        <div className="flex gap-3">
          <button onClick={onConfirm} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors">Excluir</button>
          <button onClick={onCancel} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors">Cancelar</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function App() {
  const [tasks, setTasks] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  function getWeekKey(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
  }

  const [currentWeekKey, setCurrentWeekKey] = useState(getWeekKey(new Date()));
  const [direction, setDirection] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);

  // --- SISTEMA DE SESSÃO E LOGIN ---
  const [session, setSession] = useState(null); 
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  // Novos estados para a senha
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);

  useEffect(() => {
    const savedAuth = localStorage.getItem('qnt_auth');
    if (savedAuth) {
      const { expiry } = JSON.parse(savedAuth);
      if (new Date().getTime() < expiry) {
        setSession({ type: 'admin', id: 'admin' });
        return;
      } else {
        localStorage.removeItem('qnt_auth');
      }
    }
    const demoId = sessionStorage.getItem('qnt_demo');
    if (demoId) {
      setSession({ type: 'demo', id: demoId });
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');
    try {
      await axios.post(`${API_URL}/api/login`, { password: passwordInput });
      const expiry = new Date().getTime() + (24 * 60 * 60 * 1000); 
      localStorage.setItem('qnt_auth', JSON.stringify({ expiry }));
      setSession({ type: 'admin', id: 'admin' });
    } catch (err) {
      setLoginError('Senha incorreta. Tente novamente.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleDemoMode = async () => {
    setIsLoggingIn(true);
    const newDemoId = 'demo_' + Math.random().toString(36).substr(2, 9);
    try {
      await axios.post(`${API_URL}/api/demo/setup`, { session_id: newDemoId, week_key: getWeekKey(new Date()) });
      sessionStorage.setItem('qnt_demo', newDemoId);
      setSession({ type: 'demo', id: newDemoId });
    } catch (err) {
      alert("Erro ao criar ambiente de demonstração.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const logoutDemo = () => {
    sessionStorage.removeItem('qnt_demo');
    setSession(null);
  };

  // Verifica o status do Caps Lock
  const checkCapsLock = (e) => {
    if (e.getModifierState) {
      setCapsLockOn(e.getModifierState('CapsLock'));
    }
  };

  const changeWeek = (days) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
    setCurrentWeekKey(getWeekKey(newDate));
    setDirection(days > 0 ? 1 : -1);
  };

  const setAbsoluteDate = (date) => {
    setCurrentDate(date);
    setCurrentWeekKey(getWeekKey(date));
    setDirection(0);
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => changeWeek(7),
    onSwipedRight: () => changeWeek(-7),
    preventScrollOnSwipe: true,
    trackMouse: false
  });

  const fetchTasks = (weekKey) => {
    if (!API_URL || !session) return;
    axios.get(`${API_URL}/api/tasks`, { params: { week: weekKey, session_id: session.id } })
      .then(response => {
        const priorityValues = { high: 1, medium: 2, low: 3 };
        const sortedTasks = response.data.sort((a, b) => {
           if (a.completed !== b.completed) return a.completed ? 1 : -1;
           return priorityValues[a.priority] - priorityValues[b.priority];
        });
        setTasks(sortedTasks);
      })
      .catch(error => console.error(error));
  };

  const handleSaveTask = (taskData) => {
    const taskPayload = { ...taskData, week_key: currentWeekKey, session_id: session.id };
    const request = editingTask 
      ? axios.put(`${API_URL}/api/tasks/${editingTask.id}`, taskPayload)
      : axios.post(`${API_URL}/api/tasks`, taskPayload);

    request.then(() => {
      fetchTasks(currentWeekKey);
      closeModal();
    });
  };

  const confirmDeleteTask = () => {
    if (!taskToDelete) return;
    setTasks(tasks.filter(t => t.id !== taskToDelete.id));
    axios.delete(`${API_URL}/api/tasks/${taskToDelete.id}`).catch(() => fetchTasks(currentWeekKey));
    setTaskToDelete(null);
  };

  const handleToggleComplete = (task) => {
    const isNowCompleted = !task.completed;
    const completedWeekKey = isNowCompleted ? currentWeekKey : null;

    const updatedTasks = tasks.map(t => 
      t.id === task.id ? { ...t, completed: isNowCompleted, completed_week_key: completedWeekKey } : t
    );
    const priorityValues = { high: 1, medium: 2, low: 3 };
    const sortedTasks = updatedTasks.sort((a, b) => {
       if (a.completed !== b.completed) return a.completed ? 1 : -1;
       return priorityValues[a.priority] - priorityValues[b.priority];
    });
    setTasks(sortedTasks);

    const updatedTask = { ...task, completed: isNowCompleted, completed_week_key: completedWeekKey };
    axios.put(`${API_URL}/api/tasks/${task.id}`, updatedTask).catch(() => fetchTasks(currentWeekKey));
  };

  const openModal = (task = null) => { setEditingTask(task); setIsModalOpen(true); };
  const closeModal = () => { setIsModalOpen(false); setEditingTask(null); };

  useEffect(() => { fetchTasks(currentWeekKey); }, [currentWeekKey, session]);

  const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? 100 : -100, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir < 0 ? 100 : -100, opacity: 0 })
  };

  // --- TELA DE LOGIN ---
  if (!session) {
    return (
      <div className="bg-gray-900 text-gray-100 min-h-screen flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-gray-800 p-8 rounded-2xl w-full max-w-sm border border-gray-700 shadow-2xl relative z-50">
          <h1 className="text-3xl font-bold text-center mb-8 text-laranja">Quase Nada Tarefas</h1>
          <form onSubmit={handleLogin} className="mb-6 relative z-50">
            
            <div className="relative mb-2">
              <input 
                id="password-input"
                type={showPassword ? "text" : "password"} 
                placeholder="Senha de Acesso" 
                required
                autoFocus
                autoComplete="current-password"
                value={passwordInput} 
                onChange={(e) => setPasswordInput(e.target.value)}
                onKeyUp={checkCapsLock}
                onKeyDown={checkCapsLock}
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                className="w-full bg-gray-900 text-white p-4 pr-12 rounded-lg border border-gray-600 focus:outline-none focus:border-laranja focus:ring-1 focus:ring-laranja"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white focus:outline-none"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                )}
              </button>
            </div>
            
            {/* Mensagens de Feedback */}
            <div className="h-6 mb-4 flex justify-center items-center">
              {capsLockOn ? (
                <p className="text-yellow-500 text-xs font-bold uppercase tracking-wider">⚠️ Caps Lock ativado</p>
              ) : loginError ? (
                <p className="text-red-500 text-sm">{loginError}</p>
              ) : null}
            </div>

            <motion.button whileTap={{ scale: 0.95 }} type="submit" disabled={isLoggingIn} className="w-full bg-laranja hover:opacity-80 text-white font-bold py-4 rounded-lg transition-opacity relative z-50">
              {isLoggingIn ? 'Carregando...' : 'Entrar'}
            </motion.button>
          </form>
          
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-700"></div>
            <span className="px-4 text-gray-400 text-sm">ou</span>
            <div className="flex-1 border-t border-gray-700"></div>
          </div>

          <motion.button whileTap={{ scale: 0.95 }} onClick={handleDemoMode} disabled={isLoggingIn} className="w-full bg-gray-900 hover:bg-gray-700 border border-gray-600 text-gray-300 font-bold py-4 rounded-lg transition-colors relative z-50">
            Ambiente de Demonstração
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // --- APP PRINCIPAL ---
  return (
    <div className="bg-gray-900 text-gray-100 h-screen flex flex-col antialiased overflow-hidden" {...handlers}>
      
      <div className="max-w-2xl mx-auto w-full p-4 md:p-8 md:pb-4 pb-2 flex-shrink-0 z-10 bg-gray-900 relative">
        {session.type === 'demo' && (
          <button onClick={logoutDemo} className="absolute top-4 right-4 md:top-8 md:right-8 text-sm text-red-400 hover:text-red-300">Sair da Demo</button>
        )}
        <h1 className="text-3xl font-bold text-center mb-6 text-laranja">Quase Nada Tarefas</h1>
        
        <WeekNavigator currentDate={currentDate} changeWeek={changeWeek} setAbsoluteDate={setAbsoluteDate} />

        <div className="mb-2 text-center">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => openModal()} className="bg-laranja hover:opacity-80 text-white font-bold py-3 px-8 rounded-lg w-full md:w-auto transition-opacity">
            + Nova Tarefa
          </motion.button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto w-full flex-1 overflow-y-auto px-4 md:px-8 pb-10">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div key={currentWeekKey} custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}>
            <TaskList tasks={tasks} onEdit={openModal} onDelete={(task) => setTaskToDelete(task)} onToggleComplete={handleToggleComplete} />
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isModalOpen && <TaskModal task={editingTask} onSave={handleSaveTask} onClose={closeModal} />}
      </AnimatePresence>

      <AnimatePresence>
        {taskToDelete && <DeleteConfirmModal task={taskToDelete} onConfirm={confirmDeleteTask} onCancel={() => setTaskToDelete(null)} />}
      </AnimatePresence>
    </div>
  );
}

export default App;