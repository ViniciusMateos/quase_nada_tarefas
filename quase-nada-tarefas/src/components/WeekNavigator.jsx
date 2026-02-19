import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function WeekNavigator({ currentDate, changeWeek, setAbsoluteDate }) {
  const [weekRangeText, setWeekRangeText] = useState("Carregando...");
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  
  // Estados para controlar em qual "camada" do painel estamos
  const [pickerView, setPickerView] = useState('weeks'); // 'weeks' | 'months' | 'years'
  const [pickerYear, setPickerYear] = useState(new Date().getFullYear());
  const [pickerMonth, setPickerMonth] = useState(new Date().getMonth());

  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const fullMonths = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  // Atualiza o texto do botão principal com base na semana atual
  useEffect(() => {
    const monday = new Date(currentDate);
    const day = monday.getDay();
    const diff = monday.getDate() - day + (day === 0 ? -6 : 1);
    monday.setDate(diff);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    const options = { month: 'short', day: 'numeric' };
    setWeekRangeText(`${monday.toLocaleDateString('pt-BR', options)} - ${sunday.toLocaleDateString('pt-BR', options)}`);
  }, [currentDate]);

  // Função para abrir o painel sempre focado no mês/ano que está na tela
  const openPicker = () => {
    setPickerYear(currentDate.getFullYear());
    setPickerMonth(currentDate.getMonth());
    setPickerView('weeks');
    setIsPickerOpen(true);
  };

  const handleSelectWeek = (monday) => {
    setAbsoluteDate(monday);
    setIsPickerOpen(false);
  };

  const handleSelectMonth = (monthIndex) => {
    setPickerMonth(monthIndex);
    setPickerView('weeks');
  };

  const handleSelectYear = (year) => {
    setPickerYear(year);
    setPickerView('months');
  };

  // Lógica pesada: Calcula exatamente quais semanas pertencem àquele mês e ano selecionados
  const getWeeksForMonth = (year, month) => {
    const weeks = [];
    const firstDay = new Date(year, month, 1);
    const firstDayOfWeek = firstDay.getDay() === 0 ? 7 : firstDay.getDay(); 
    const startMonday = new Date(year, month, 1 - firstDayOfWeek + 1);

    let currentMonday = new Date(startMonday);
    
    // Um mês nunca passa de 6 semanas
    for (let i = 0; i < 6; i++) {
      const sunday = new Date(currentMonday);
      sunday.setDate(currentMonday.getDate() + 6);

      // Se a segunda ou o domingo da semana cair no mês selecionado, ela pertence a ele
      if (currentMonday.getMonth() === month || sunday.getMonth() === month) {
        weeks.push({ monday: new Date(currentMonday), sunday: new Date(sunday) });
      }
      currentMonday.setDate(currentMonday.getDate() + 7);
    }
    return weeks;
  };

  // Renderiza o miolo do modal dependendo do que o usuário tá escolhendo
  const renderPickerContent = () => {
    if (pickerView === 'years') {
      const yearsList = Array.from({length: 12}, (_, i) => pickerYear - 4 + i);
      return (
         <motion.div key="years" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.2 }} className="grid grid-cols-3 gap-3">
           {yearsList.map(y => (
             <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} key={y} onClick={() => handleSelectYear(y)} className={`p-4 rounded-lg font-bold transition-colors ${y === pickerYear ? 'bg-laranja text-black' : 'bg-gray-700 text-white hover:bg-gray-600'}`}>
               {y}
             </motion.button>
           ))}
         </motion.div>
      );
    }

    if (pickerView === 'months') {
      return (
         <motion.div key="months" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.2 }} className="grid grid-cols-3 gap-3">
           {months.map((m, i) => (
             <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} key={m} onClick={() => handleSelectMonth(i)} className={`p-4 rounded-lg font-bold transition-colors ${i === pickerMonth ? 'bg-laranja text-black' : 'bg-gray-700 text-white hover:bg-gray-600'}`}>
               {m}
             </motion.button>
           ))}
         </motion.div>
      );
    }

    if (pickerView === 'weeks') {
      const weeks = getWeeksForMonth(pickerYear, pickerMonth);
      const options = { month: 'short', day: '2-digit' };
      return (
         <motion.div key="weeks" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.2 }} className="flex flex-col gap-3">
           {weeks.map((w, i) => {
             // Descobre qual é a semana do dia de hoje (para destacar)
             const today = new Date();
             const currentAppMonday = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - currentDate.getDay() + (currentDate.getDay() === 0 ? -6 : 1));
             const isSelected = w.monday.getTime() === currentAppMonday.getTime();
             
             return (
             <motion.button 
               whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
               key={i} 
               onClick={() => handleSelectWeek(w.monday)} 
               className={`p-4 rounded-lg font-bold flex justify-between items-center transition-colors ${isSelected ? 'border-2 border-laranja bg-gray-800' : 'bg-gray-700 hover:bg-gray-600'} text-white`}
             >
               <span className={isSelected ? 'text-laranja' : ''}>Semana {i + 1}</span>
               <span className="text-sm font-normal text-gray-300">
                 {w.monday.toLocaleDateString('pt-BR', options)} - {w.sunday.toLocaleDateString('pt-BR', options)}
               </span>
             </motion.button>
           )})}
         </motion.div>
      );
    }
  };

  return (
    <>
      {/* NAVEGAÇÃO SUPERIOR */}
      <div className="flex items-center justify-between bg-gray-800 p-4 rounded-lg mb-6 border border-gray-700">
        <motion.button whileTap={{ scale: 0.8, backgroundColor: "#ff8234", color: "#fff" }} onClick={() => changeWeek(-7)} className="p-2 rounded-full hover:bg-gray-700 transition-colors text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        </motion.button>
        
        <motion.h2 
          whileHover={{ scale: 1.05, color: "#ff8234" }} 
          whileTap={{ scale: 0.95 }} 
          onClick={openPicker}
          className="text-lg font-semibold text-center cursor-pointer select-none transition-colors"
        >
          {weekRangeText}
        </motion.h2>
        
        <motion.button whileTap={{ scale: 0.8, backgroundColor: "#ff8234", color: "#fff" }} onClick={() => changeWeek(7)} className="p-2 rounded-full hover:bg-gray-700 transition-colors text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
        </motion.button>
      </div>

      {/* MODAL CUSTOMIZADO DE SEMANAS */}
      <AnimatePresence>
        {isPickerOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <motion.div initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 50 }} transition={{ type: "spring", stiffness: 300, damping: 25 }} className="bg-gray-800 p-6 rounded-xl w-full max-w-sm border border-gray-700 shadow-2xl flex flex-col max-h-[90vh]">
              
              {/* HEADER DO MODAL - NAVEGAÇÃO DE NÍVEIS */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex gap-2 items-center">
                  
                  {/* Clicar no ano volta para o grid de Anos */}
                  {pickerView !== 'years' && (
                    <button onClick={() => setPickerView('years')} className="text-xl font-bold text-gray-400 hover:text-white transition-colors">
                      {pickerYear}
                    </button>
                  )}
                  {pickerView === 'years' && <span className="text-xl font-bold text-laranja">Selecione o Ano</span>}
                  
                  {pickerView === 'weeks' && <span className="text-xl text-gray-500">•</span>}
                  
                  {/* Clicar no mês volta para o grid de Meses */}
                  {pickerView === 'weeks' && (
                    <button onClick={() => setPickerView('months')} className="text-xl font-bold text-laranja hover:opacity-80 transition-opacity">
                      {fullMonths[pickerMonth]}
                    </button>
                  )}
                  {pickerView === 'months' && (
                     <>
                       <span className="text-xl text-gray-500">•</span>
                       <span className="text-xl font-bold text-laranja">Selecione o Mês</span>
                     </>
                  )}
                </div>
                
                <button onClick={() => setIsPickerOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {/* CORPO DO MODAL (Anima troca entre Ano/Mês/Semanas) */}
              <div className="flex-1 overflow-y-auto pr-1">
                <AnimatePresence mode="wait">
                  {renderPickerContent()}
                </AnimatePresence>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default WeekNavigator;