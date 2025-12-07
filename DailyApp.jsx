import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, RotateCcw, CheckCircle2, Circle, 
  ChevronRight, ChevronLeft, Calendar, Clock, 
  BookOpen, Dumbbell, Youtube, Instagram, 
  Moon, Sun, Coffee, BrainCircuit, PartyPopper
} from 'lucide-react';


// --- تنظیمات برنامه هفتگی طبق فایل مارک‌داون ---
const WEEK_SCHEDULE = {
  saturday: {
    label: 'شنبه',
    tasks: [
      { id: 'sat-1', time: '07:00-07:30', title: 'توسعه فردی (کتاب)', detail: '۱۰ صفحه مطالعه عمیق', duration: 30, icon: BookOpen, type: 'reading' },
      { id: 'sat-2', time: '07:30-08:45', title: 'درمانگر کودک', detail: 'دوره بخش اول', duration: 75, icon: BrainCircuit, type: 'study' },
      { id: 'sat-3', time: '08:45-08:55', title: 'ورزش خانگی', detail: 'تمرین ۱۰ دقیقه‌ای', duration: 10, icon: Dumbbell, type: 'sport' },
      { id: 'sat-4', time: '14:00-14:20', title: 'اینستاگرام', detail: 'نوشتن درفت پست اضطراب', duration: 20, icon: Instagram, type: 'work' },
    ]
  },
  sunday: {
    label: 'یکشنبه',
    tasks: [
      { id: 'sun-1', time: '07:00-07:30', title: 'توسعه فردی (کتاب)', detail: '۱۰ صفحه مطالعه', duration: 30, icon: BookOpen, type: 'reading' },
      { id: 'sun-2', time: '07:30-08:00', title: 'مطالعه تخصصی', detail: 'درمان اضطراب نوجوانان', duration: 30, icon: BrainCircuit, type: 'study' },
      { id: 'sun-3', time: '16:00-17:00', title: 'یوتیوب', detail: 'سناریو نویسی ویدیو', duration: 60, icon: Youtube, type: 'work' },
    ]
  },
  monday: {
    label: 'دوشنبه',
    tasks: [
      { id: 'mon-1', time: '07:00-07:30', title: 'توسعه فردی (کتاب)', detail: '۱۰ صفحه مطالعه', duration: 30, icon: BookOpen, type: 'reading' },
      { id: 'mon-2', time: '07:30-07:40', title: 'ورزش خانگی', detail: 'تمرین ۱۰ دقیقه‌ای', duration: 10, icon: Dumbbell, type: 'sport' },
      { id: 'mon-3', time: '14:00-15:00', title: 'یوتیوب', detail: 'ضبط ویدیو لانگ', duration: 60, icon: Youtube, type: 'work' },
    ]
  },
  tuesday: {
    label: 'سه‌شنبه',
    tasks: [
      { id: 'tue-1', time: '07:00-07:30', title: 'توسعه فردی (کتاب)', detail: '۱۰ صفحه مطالعه', duration: 30, icon: BookOpen, type: 'reading' },
      { id: 'tue-2', time: '07:30-08:45', title: 'درمانگر کودک', detail: 'دوره بخش دوم', duration: 75, icon: BrainCircuit, type: 'study' },
      { id: 'tue-3', time: '18:00-18:30', title: 'اینستاگرام', detail: 'انتشار پست + استوری', duration: 30, icon: Instagram, type: 'work' },
    ]
  },
  wednesday: {
    label: 'چهارشنبه',
    tasks: [
      { id: 'wed-1', time: '07:00-07:30', title: 'توسعه فردی (کتاب)', detail: '۱۰ صفحه مطالعه', duration: 30, icon: BookOpen, type: 'reading' },
      { id: 'wed-2', time: '07:30-07:40', title: 'ورزش خانگی', detail: 'تمرین ۱۰ دقیقه‌ای', duration: 10, icon: Dumbbell, type: 'sport' },
      { id: 'wed-3', time: '16:00-17:30', title: 'یوتیوب', detail: 'ادیت و تامنیل', duration: 90, icon: Youtube, type: 'work' },
    ]
  },
  thursday: {
    label: 'پنج‌شنبه',
    tasks: [
      { id: 'thu-1', time: '07:00-07:30', title: 'توسعه فردی (کتاب)', detail: '۱۰ صفحه مطالعه', duration: 30, icon: BookOpen, type: 'reading' },
      { id: 'thu-2', time: '10:00-11:00', title: 'یوتیوب', detail: 'انتشار ویدیو + پاسخ کامنت', duration: 60, icon: Youtube, type: 'work' },
      { id: 'thu-3', time: '19:00-22:00', title: 'تفریح', detail: 'بیرون رفتن / شام', duration: 180, icon: PartyPopper, type: 'fun' },
    ]
  },
  friday: {
    label: 'جمعه',
    tasks: [
      { id: 'fri-1', time: '10:00-11:00', title: 'برنامه‌ریزی', detail: 'بازبینی هفته و پلن هفته بعد', duration: 60, icon: Calendar, type: 'planning' },
      { id: 'fri-2', time: 'Free', title: 'استراحت کامل', detail: 'ریکاوری برای هفته بعد', duration: 0, icon: Coffee, type: 'rest' },
    ]
  }
};


const DAYS_ORDER = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'];


const DailyApp = () => {
  const [currentDayKey, setCurrentDayKey] = useState('saturday');
  const [completedTasks, setCompletedTasks] = useState(() => {
    const saved = localStorage.getItem('daily-tracker-completed');
    return saved ? JSON.parse(saved) : {};
  });
  
  // Timer State
  const [activeTask, setActiveTask] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef(null);


  // Load completed tasks
  useEffect(() => {
    localStorage.setItem('daily-tracker-completed', JSON.stringify(completedTasks));
  }, [completedTasks]);


  // Timer Logic
  useEffect(() => {
    if (isTimerRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerRunning(false);
      if (activeTask && timeLeft === 0 && isTimerRunning) {
        // Timer finished naturally
        new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg').play().catch(e => {});
      }
    }
    return () => clearInterval(timerRef.current);
  }, [isTimerRunning, timeLeft, activeTask]);


  const toggleTask = (taskId) => {
    setCompletedTasks(prev => {
      const isCompleted = !!prev[taskId];
      const newState = { ...prev };
      if (isCompleted) {
        delete newState[taskId];
      } else {
        newState[taskId] = new Date().toISOString();
      }
      return newState;
    });
  };


  const startFocus = (task) => {
    if (activeTask?.id === task.id && isTimerRunning) {
      setIsTimerRunning(false);
    } else {
      setActiveTask(task);
      setTimeLeft(task.duration * 60);
      setIsTimerRunning(true);
    }
  };


  const resetTimer = () => {
    setIsTimerRunning(false);
    if (activeTask) setTimeLeft(activeTask.duration * 60);
  };


  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };


  // Navigation
  const changeDay = (direction) => {
    const currentIndex = DAYS_ORDER.indexOf(currentDayKey);
    let newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (newIndex < 0) newIndex = DAYS_ORDER.length - 1;
    if (newIndex >= DAYS_ORDER.length) newIndex = 0;
    setCurrentDayKey(DAYS_ORDER[newIndex]);
    setIsTimerRunning(false);
    setActiveTask(null);
  };


  const currentSchedule = WEEK_SCHEDULE[currentDayKey];
  const progress = Math.round(
    (currentSchedule.tasks.filter(t => completedTasks[t.id]).length / Math.max(currentSchedule.tasks.length, 1)) * 100
  );


  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 text-gray-800 font-sans pb-10">
      
      {/* Top Bar / Navigation */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => changeDay('prev')} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
            <ChevronRight />
          </button>
          <div className="text-center">
            <h1 className="text-xl font-bold text-indigo-900">{currentSchedule.label}</h1>
            <span className="text-xs text-gray-400 font-medium">برنامه روزانه</span>
          </div>
          <button onClick={() => changeDay('next')} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
            <ChevronLeft />
          </button>
        </div>
        {/* Daily Progress Bar */}
        <div className="w-full h-1 bg-gray-100">
          <div 
            className="h-full bg-green-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 mt-6">
        
        {/* Focus Timer Card */}
        <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-200 mb-8 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-indigo-200 text-sm mb-1">
                {activeTask ? 'در حال انجام:' : 'تسک را انتخاب کنید'}
              </p>
              <h2 className="text-2xl font-bold">
                {activeTask ? activeTask.title : 'آماده شروع؟'}
              </h2>
            </div>
            <Clock className="text-indigo-300 opacity-50" size={32} />
          </div>

          <div className="flex flex-col items-center justify-center py-4">
            <div className="text-6xl font-mono font-bold tracking-wider mb-6">
              {activeTask ? formatTime(timeLeft) : '--:--'}
            </div>
            
            <div className="flex gap-4">
              <button 
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                disabled={!activeTask}
                className="bg-white text-indigo-600 w-14 h-14 rounded-full flex items-center justify-center hover:bg-indigo-50 active:scale-95 transition-all disabled:opacity-50 shadow-lg"
              >
                {isTimerRunning ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="mr-1" />}
              </button>
              
              <button 
                onClick={resetTimer}
                disabled={!activeTask}
                className="bg-indigo-500/50 text-white w-14 h-14 rounded-full flex items-center justify-center hover:bg-indigo-500 active:scale-95 transition-all disabled:opacity-30"
              >
                <RotateCcw size={22} />
              </button>
            </div>
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-4">
          <h3 className="text-gray-500 font-bold text-sm px-2">لیست کارهای {currentSchedule.label}</h3>
          
          {currentSchedule.tasks.map((task, index) => {
            const isCompleted = !!completedTasks[task.id];
            const isActive = activeTask?.id === task.id;

            return (
              <div 
                key={task.id}
                className={`
                  relative bg-white p-4 rounded-xl border-2 transition-all duration-300
                  ${isActive ? 'border-indigo-500 shadow-md scale-[1.02]' : 'border-transparent shadow-sm hover:shadow-md'}
                  ${isCompleted ? 'opacity-70 bg-gray-50' : ''}
                `}
              >
                {/* Timeline Connector */}
                {index !== currentSchedule.tasks.length - 1 && (
                  <div className="absolute top-14 right-8 w-0.5 h-8 bg-gray-100 -z-10" />
                )}

                <div className="flex items-center gap-4">
                  {/* Checkbox */}
                  <button 
                    onClick={() => toggleTask(task.id)}
                    className={`flex-shrink-0 ${isCompleted ? 'text-green-500' : 'text-gray-300 hover:text-indigo-400'}`}
                  >
                    {isCompleted ? <CheckCircle2 size={28} className="fill-current bg-white rounded-full" /> : <Circle size={28} />}
                  </button>

                  {/* Content */}
                  <div 
                    className="flex-1 cursor-pointer" 
                    onClick={() => !isCompleted && startFocus(task)}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className={`font-bold ${isCompleted ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                        {task.title}
                      </span>
                      <span className="text-xs font-mono bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md">
                        {task.time}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{task.detail}</span>
                      <div className={`
                        p-1.5 rounded-lg
                        ${task.type === 'reading' ? 'bg-blue-100 text-blue-600' : ''}
                        ${task.type === 'sport' ? 'bg-orange-100 text-orange-600' : ''}
                        ${task.type === 'study' ? 'bg-purple-100 text-purple-600' : ''}
                        ${task.type === 'work' ? 'bg-red-100 text-red-600' : ''}
                        ${task.type === 'fun' ? 'bg-green-100 text-green-600' : ''}
                      `}>
                        <task.icon size={16} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Empty State for Rest Days */}
        {currentSchedule.tasks.length <= 2 && (
          <div className="mt-8 text-center p-8 bg-white/50 border-2 border-dashed border-gray-200 rounded-xl">
            <Coffee size={48} className="mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500">امروز برنامه سبکی دارید. لذت ببرید!</p>
          </div>
        )}


      </div>
    </div>
  );
};


export default DailyApp;
