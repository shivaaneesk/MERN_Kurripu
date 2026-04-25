"use client";

import { useState, useEffect } from 'react';
import { Trash2, Clock, Calendar, Check, Plus, LogOut, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/ThemeToggle';

interface Note {
  _id: string;
  title: string;
  content: string;
  color: string;
  label: string;
  dueDate?: string;
  reminder?: string;
  createdAt: string;
  owner: string;
}

const COLORS = [
  { name: 'Default', value: 'default' },
  { name: 'Pastel Pink', value: 'pink' },
  { name: 'Pastel Blue', value: 'blue' },
  { name: 'Pastel Green', value: 'green' },
  { name: 'Pastel Purple', value: 'purple' },
];

const getPickerColor = (val: string) => {
  switch (val) {
    case 'pink': return '#ffb3ba';
    case 'blue': return '#bae1ff';
    case 'green': return '#baffc9';
    case 'purple': return '#e2cbfe';
    default: return 'transparent';
  }
};

const getNoteThemeClasses = (colorValue: string) => {
  if (colorValue && colorValue.startsWith('rgba')) colorValue = 'default';

  switch (colorValue) {
    case 'pink':
      return 'bg-[#2a0e18] dark:bg-[#ffb3ba] text-[#ffb3ba] dark:text-zinc-900 border-[#ffb3ba]/30 shadow-[0_8px_32px_0_rgba(255,179,186,0.15)]';
    case 'blue':
      return 'bg-[#0e1a2a] dark:bg-[#bae1ff] text-[#bae1ff] dark:text-zinc-900 border-[#bae1ff]/30 shadow-[0_8px_32px_0_rgba(186,225,255,0.15)]';
    case 'green':
      return 'bg-[#0e2a18] dark:bg-[#baffc9] text-[#baffc9] dark:text-zinc-900 border-[#baffc9]/30 shadow-[0_8px_32px_0_rgba(186,255,201,0.15)]';
    case 'purple':
      return 'bg-[#1d0e2a] dark:bg-[#e2cbfe] text-[#e2cbfe] dark:text-zinc-900 border-[#e2cbfe]/30 shadow-[0_8px_32px_0_rgba(226,203,254,0.15)]';
    case 'transparent':
    case 'default':
    default:
      return 'glass-card text-zinc-900 dark:text-zinc-50 border-black/10 dark:border-white/20';
  }
};

export default function Home() {
  const [userName, setUserName] = useState<string | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0].value);
  const [label, setLabel] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [reminder, setReminder] = useState('');

  const router = useRouter();
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedName = localStorage.getItem('userName');
    if (!token) {
      router.push('/login');
    } else {
      fetchNotes();
      setUserName(storedName || 'GUEST');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    router.push('/login');
  };

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/notes`);
      const data = await res.json();
      if (res.status === 401) {
        handleLogout();
      } else if (data.success) {
        setNotes(data.data);
        triggerClientReminders(data.data);
      }
    } catch (error) {
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const triggerClientReminders = (fetchedNotes: Note[]) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const notifiedKey = `notified_${todayStr}`;
    
    let notifiedSet: string[] = [];
    try {
      const stored = localStorage.getItem(notifiedKey);
      if (stored) notifiedSet = JSON.parse(stored);
    } catch (e) {}

    fetchedNotes.forEach(note => {
      if (note.reminder) {
        const reminderStr = new Date(note.reminder).toISOString().split('T')[0];
        if (reminderStr === todayStr && !notifiedSet.includes(note._id)) {
          // Trigger Popup!
          toast.custom((t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-sm w-full bg-white dark:bg-[#1a0a2a] shadow-xl rounded-2xl pointer-events-auto flex ring-1 ring-black/5 dark:ring-purple-500/30 border border-black/10 dark:border-white/10 overflow-hidden`}>
              <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 pt-0.5">
                    <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
                      <Clock size={20} className="text-purple-600 dark:text-purple-400 stroke-[2.5]" />
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-heading font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">
                      Reminder Today!
                    </p>
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 font-sans font-medium">
                      {note.title} is scheduled for today.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex border-l border-black/5 dark:border-white/10">
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="w-full border border-transparent rounded-none rounded-r-2xl p-4 flex items-center justify-center text-sm font-bold text-purple-600 dark:text-purple-400 hover:bg-black/5 dark:hover:bg-white/5 focus:outline-none transition-colors uppercase tracking-widest"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ), { duration: 8000, position: 'top-center' });

          notifiedSet.push(note._id);
        }
      }
    });

    localStorage.setItem(notifiedKey, JSON.stringify(notifiedSet));
  };

  const showExtensionGuidelines = () => {
    toast.custom((t) => (
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-sm w-full bg-white dark:bg-[#1a0a2a] shadow-2xl rounded-2xl pointer-events-auto flex flex-col ring-1 ring-black/5 dark:ring-purple-500/30 overflow-hidden`}>
        <div className="p-6">
          <h3 className="text-xl font-heading font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-4">Installation Guide</h3>
          <p className="text-sm font-sans text-zinc-600 dark:text-zinc-300 mb-4 leading-relaxed font-medium">
            Your ZIP is downloading! To install it:
          </p>
          <ol className="text-sm font-sans text-zinc-700 dark:text-zinc-400 space-y-3 font-medium mb-6 ml-4 list-decimal">
            <li>Type <code className="bg-black/5 dark:bg-white/10 px-2 py-1 rounded text-purple-600 dark:text-purple-300 font-mono">chrome://extensions</code> in a new tab.</li>
            <li>Enable <strong>Developer mode</strong> in the top right.</li>
            <li>Drag and drop the downloaded ZIP directly into the page!</li>
          </ol>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-colors uppercase tracking-widest text-sm active:scale-95 border border-transparent shadow-md"
          >
            I Got It
          </button>
        </div>
      </div>
    ), { duration: 15000 });
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      toast.error('Title and content are required');
      return;
    }

    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          color: selectedColor,
          label,
          dueDate: dueDate || undefined,
          reminder: reminder || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setNotes([data.data, ...notes]);
        resetForm();
        toast.success('Note saved successfully');
      }
    } catch (error) {
      toast.error('Could not save note');
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      const res = await fetch(`/api/notes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setNotes(notes.filter(note => note._id !== id));
        toast.success('Note deleted');
      }
    } catch (error) {
      toast.error('Failed to delete note');
    }
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setLabel('');
    setDueDate('');
    setReminder('');
  };

  if (loading) {
    return (
      <main className="min-h-[100dvh] flex items-center justify-center relative z-10 w-full overflow-hidden p-4">
        <div className="animate-pulse flex items-center gap-4 text-purple-700 dark:text-purple-400 font-heading font-black tracking-widest text-glow">
          <div className="w-4 h-4 bg-purple-500 rounded-full animate-ping"></div>
          INITIALIZING...
        </div>
      </main>
    );
  }

  return (
    <main className="w-full max-w-6xl mx-auto p-4 md:p-10 mb-12 flex flex-col gap-10 relative z-10 overflow-hidden min-h-[100dvh]">
      
      {/* App Header */}
      <header className="glass p-6 md:p-8 rounded-[2rem] flex flex-col md:flex-row justify-between items-center gap-6 border-t border-white/50 dark:border-purple-500/30">
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-heading font-black tracking-tighter text-zinc-900 dark:text-zinc-50 drop-shadow-sm dark:text-glow">
            Kurripu
          </h1>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-600 dark:text-zinc-400 mt-2 font-sans">Your Centralized Notebook</p>
        </div>
        <div className="flex items-center gap-3 md:gap-4 flex-wrap justify-center">
          <a href="/kurripu_extension.zip" download="kurripu_extension.zip" onClick={showExtensionGuidelines} className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-400 hover:opacity-90 transition-opacity text-white px-4 py-2 rounded-full font-bold text-[10px] uppercase tracking-widest shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            <Download size={14} className="stroke-[3]" /> Download Extension
          </a>
          <ThemeToggle />
          <span className="font-sans font-bold tracking-widest uppercase text-[10px] md:text-xs text-purple-700 dark:text-purple-300 bg-purple-500/10 px-4 py-2 rounded-full border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.15)] dark:text-glow hidden sm:inline-block">
            USER: {userName}
          </span>
          <button onClick={handleLogout} className="p-3 rounded-full text-zinc-600 dark:text-zinc-400 hover:text-red-500 hover:bg-black/5 dark:hover:bg-white/5 transition-all active:scale-95 border border-transparent hover:border-red-500/30" title="Log Out">
            <LogOut size={20} className="stroke-[2.5]" />
          </button>
        </div>
      </header>

      {/* Note Creator Section */}
      <section className="glass rounded-[2.5rem] p-6 md:p-10 relative border-t border-white/50 dark:border-white/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[100px] pointer-events-none rounded-full"></div>
        <form onSubmit={handleCreateNote} className="max-w-4xl mx-auto flex flex-col gap-8 relative z-10">
          
          <div className="flex flex-col gap-4 bg-white/50 dark:bg-black/30 p-6 rounded-[2rem] border border-black/5 dark:border-white/10 shadow-inner">
            <input
              type="text"
              placeholder="Title of your note..."
              className="w-full bg-transparent border-none text-2xl font-heading font-black outline-none placeholder:text-zinc-500 dark:placeholder:text-zinc-500 text-zinc-900 dark:text-zinc-50 tracking-wide"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <div className="h-px w-full bg-gradient-to-r from-purple-500/50 via-black/10 dark:via-white/10 to-transparent"></div>
            <textarea
              placeholder="Start writing..."
              className="w-full bg-transparent border-none text-base font-sans outline-none min-h-[140px] resize-y placeholder:text-zinc-500 dark:placeholder:text-zinc-500 text-zinc-800 dark:text-zinc-300 leading-relaxed font-medium"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400/80 ml-2">Tag Label</label>
              <div className="bg-white/60 dark:bg-black/40 border border-black/5 dark:border-white/10 rounded-full px-5 py-3 flex items-center gap-3 focus-within:border-purple-500/50 transition-colors shadow-sm">
                <Plus size={16} className="text-purple-600 dark:text-purple-400" />
                <input
                  type="text"
                  placeholder="e.g. Work, Study"
                  className="w-full bg-transparent border-none text-sm font-medium outline-none placeholder:text-zinc-500 dark:placeholder:text-zinc-500 text-zinc-900 dark:text-zinc-100"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400/80 ml-2">Due Date</label>
              <div className="bg-white/60 dark:bg-black/40 border border-black/5 dark:border-white/10 rounded-full px-5 py-3 flex items-center gap-3 focus-within:border-cyan-500/50 transition-colors shadow-sm">
                <Calendar size={16} className="text-cyan-600 dark:text-cyan-400" />
                <input
                  type="date"
                  min={today}
                  className="w-full bg-transparent border-none text-sm font-medium outline-none text-zinc-900 dark:text-zinc-300 cursor-pointer [color-scheme:light] dark:[color-scheme:dark]"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-pink-600 dark:text-pink-400/80 ml-2">Reminder</label>
              <div className="bg-white/60 dark:bg-black/40 border border-black/5 dark:border-white/10 rounded-full px-5 py-3 flex items-center gap-3 focus-within:border-pink-500/50 transition-colors shadow-sm">
                <Clock size={16} className="text-pink-600 dark:text-pink-400" />
                <input
                  type="date"
                  min={today}
                  className="w-full bg-transparent border-none text-sm font-medium outline-none text-zinc-900 dark:text-zinc-300 cursor-pointer [color-scheme:light] dark:[color-scheme:dark]"
                  value={reminder}
                  onChange={(e) => setReminder(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-4">
            <div className="flex flex-col gap-3 w-full md:w-auto items-center md:items-start font-sans">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-400 ml-2">Color Code</label>
              <div className="bg-white/60 dark:bg-black/40 border border-black/5 dark:border-white/10 p-2 rounded-full flex gap-3 backdrop-blur-md shadow-sm">
                {COLORS.map((color) => (
                  <div
                    key={color.value}
                    className={`w-10 h-10 rounded-full cursor-pointer transition-all duration-300 ${selectedColor === color.value ? 'ring-2 ring-black/40 dark:ring-white/50 scale-90 shadow-[0_0_15px_rgba(0,0,0,0.1)] dark:shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'hover:scale-110 border border-black/10 dark:border-white/10'} relative overflow-hidden flex items-center justify-center bg-white/50 dark:bg-transparent`}
                    onClick={() => setSelectedColor(color.value)}
                    title={color.name}
                  >
                    <div className="absolute inset-0 rounded-full" style={{ backgroundColor: getPickerColor(color.value) }}></div>
                    {(color.value === 'transparent' || color.value === 'default') && <span className="text-zinc-900/40 dark:text-white/30 text-xs font-bold leading-none select-none relative z-10 mix-blend-difference">-</span>}
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" className="glass-card hover:bg-black/5 dark:hover:bg-white/10 text-zinc-900 dark:text-zinc-50 flex items-center gap-3 text-sm py-4 px-10 rounded-[1.5rem] font-heading font-black uppercase tracking-widest active:scale-95 w-full md:w-auto justify-center group overflow-hidden relative border border-black/10 dark:border-white/10 shadow-sm">
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-black/5 dark:via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
              <Check size={20} className="stroke-[3] text-purple-600 dark:text-purple-400 group-hover:text-glow transition-all relative z-10" /> 
              <span className="relative z-10">Pin Note</span>
            </button>
          </div>
        </form>
      </section>

      {/* Logic Gates Display Section */}
      <section className="flex flex-col gap-6 mt-4">
        <div className="flex items-center justify-between px-4 font-sans">
          <h2 className="text-xl md:text-2xl font-heading font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-300 drop-shadow-sm dark:text-glow">Your Collection</h2>
          <span className="bg-white/60 dark:bg-white/5 border border-black/10 dark:border-white/10 px-4 py-2 rounded-full text-xs font-bold text-zinc-700 dark:text-zinc-400 tracking-wider backdrop-blur-sm shadow-sm">
            {notes.length} NOTE{notes.length !== 1 ? 'S' : ''}
          </span>
        </div>
        
        {notes.length === 0 ? (
          <div className="glass flex flex-col items-center justify-center py-20 rounded-[3rem] border border-dashed border-black/30 dark:border-white/20">
            <p className="text-2xl font-heading font-black text-zinc-500 dark:text-zinc-500 uppercase tracking-widest">Nothing here yet!</p>
            <p className="text-sm font-sans font-medium text-zinc-600 dark:text-zinc-600 mt-2">Create your first note above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {notes.map((note) => (
              <div
                key={note._id}
                className={`rounded-[2.5rem] flex flex-col relative overflow-hidden group border transition-all duration-300 shadow-md ${getNoteThemeClasses(note.color)}`}
              >
                <div className="relative p-8 flex flex-col h-full z-10">
                  <div className="flex justify-between items-start mb-6 font-sans">
                    <span className="text-[9px] uppercase tracking-[0.2em] font-bold opacity-70 bg-black/5 dark:bg-black/20 border border-current hover:bg-current hover:text-white px-3 py-1.5 rounded-full transition-colors cursor-default">
                      {note.label || 'UNTAGGED'}
                    </span>
                    <button
                      onClick={() => handleDeleteNote(note._id)}
                      className="p-2 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-500/10 rounded-full active:scale-90 transition-all focus:opacity-100"
                    >
                      <Trash2 size={16} className="stroke-[2.5]" />
                    </button>
                  </div>

                  <h3 className="text-2xl font-heading font-bold mb-4 leading-tight tracking-tight">{note.title}</h3>
                  <p className="text-sm font-sans font-normal leading-relaxed mb-10 whitespace-pre-wrap opacity-90">{note.content}</p>

                  {(note.dueDate || note.reminder) && (
                    <div className="mt-auto pt-6 border-t border-current/20 flex flex-wrap gap-4 font-sans opacity-90">
                      {note.dueDate && (
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
                          <Calendar size={14} className="stroke-[2]" /> {new Date(note.dueDate).toLocaleDateString()}
                        </div>
                      )}
                      {note.reminder && (
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
                          <Clock size={14} className="stroke-[2]" /> {new Date(note.reminder).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
