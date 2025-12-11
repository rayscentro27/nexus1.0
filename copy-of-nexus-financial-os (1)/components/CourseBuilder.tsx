
import React, { useState } from 'react';
import { Course } from '../types';
import { BookOpen, Plus, Sparkles, RefreshCw, Trash2, Edit2, PlayCircle, Save, CheckCircle, Video, Upload } from 'lucide-react';
import * as geminiService from '../services/geminiService';

interface CourseBuilderProps {
  courses: Course[];
  onUpdateCourses: (courses: Course[]) => void;
}

const CourseBuilder: React.FC<CourseBuilderProps> = ({ courses, onUpdateCourses }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  
  // AI Generation State
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!topic) return;
    setIsGenerating(true);
    try {
        const newCourse = await geminiService.generateCourseCurriculum(topic, audience || 'Small Business Owners');
        if (newCourse) {
            setActiveCourse(newCourse);
            setIsEditing(true);
        }
    } catch (e) {
        console.error(e);
        alert("Failed to generate course.");
    } finally {
        setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (activeCourse) {
        const exists = courses.find(c => c.id === activeCourse.id);
        if (exists) {
            onUpdateCourses(courses.map(c => c.id === activeCourse.id ? activeCourse : c));
        } else {
            onUpdateCourses([...courses, activeCourse]);
        }
        setIsEditing(false);
        setActiveCourse(null);
        setTopic('');
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Delete this course?")) {
        onUpdateCourses(courses.filter(c => c.id !== id));
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-10">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <BookOpen className="text-indigo-600" size={32} /> AI Course Builder (LMS)
          </h1>
          <p className="text-slate-500 mt-2">Create educational content for your client portal.</p>
        </div>
        {!isEditing && (
            <button 
                onClick={() => {
                    setActiveCourse({
                        id: `course_${Date.now()}`,
                        title: 'New Course',
                        description: 'Description goes here...',
                        modules: []
                    });
                    setIsEditing(true);
                }}
                className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-slate-800 shadow-lg flex items-center gap-2"
            >
                <Plus size={18} /> Manually Create
            </button>
        )}
      </div>

      {isEditing && activeCourse ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col animate-slide-in-right">
            {/* Editor Header */}
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <input 
                    className="text-2xl font-bold text-slate-900 bg-transparent border-none focus:ring-0 p-0 w-full"
                    value={activeCourse.title}
                    onChange={(e) => setActiveCourse({ ...activeCourse, title: e.target.value })}
                />
                <div className="flex gap-2">
                    <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-200 rounded-lg">Cancel</button>
                    <button onClick={handleSave} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-sm flex items-center gap-2"><Save size={18}/> Save Course</button>
                </div>
            </div>
            
            <div className="p-8 space-y-8">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Description</label>
                    <textarea 
                        className="w-full p-3 border border-slate-300 rounded-lg text-sm"
                        value={activeCourse.description}
                        onChange={(e) => setActiveCourse({ ...activeCourse, description: e.target.value })}
                        rows={2}
                    />
                </div>

                <div className="space-y-6">
                    {activeCourse.modules.map((mod, mIdx) => (
                        <div key={mod.id} className="border border-slate-200 rounded-xl overflow-hidden">
                            <div className="bg-slate-50 p-4 border-b border-slate-100 flex gap-4 items-center">
                                <span className="bg-slate-200 text-slate-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">{mIdx + 1}</span>
                                <input 
                                    className="flex-1 bg-transparent border-none font-bold text-slate-800 focus:ring-0 text-sm"
                                    value={mod.title}
                                    onChange={(e) => {
                                        const newMods = [...activeCourse.modules];
                                        newMods[mIdx].title = e.target.value;
                                        setActiveCourse({ ...activeCourse, modules: newMods });
                                    }}
                                />
                                <button 
                                    onClick={() => {
                                        const newMods = activeCourse.modules.filter((_, i) => i !== mIdx);
                                        setActiveCourse({ ...activeCourse, modules: newMods });
                                    }}
                                    className="text-slate-400 hover:text-red-500"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <div className="p-4 space-y-3">
                                {mod.lessons.map((les, lIdx) => (
                                    <div key={les.id} className="flex gap-4 items-center p-3 bg-white border border-slate-100 rounded-lg group">
                                        <PlayCircle size={18} className="text-slate-400" />
                                        <div className="flex-1">
                                            <input 
                                                className="w-full text-sm font-medium text-slate-700 bg-transparent border-none p-0 focus:ring-0"
                                                value={les.title}
                                                onChange={(e) => {
                                                    const newMods = [...activeCourse.modules];
                                                    newMods[mIdx].lessons[lIdx].title = e.target.value;
                                                    setActiveCourse({ ...activeCourse, modules: newMods });
                                                }}
                                            />
                                            <input 
                                                className="w-full text-xs text-slate-400 bg-transparent border-none p-0 focus:ring-0 mt-1"
                                                value={les.description || ''}
                                                placeholder="Lesson description..."
                                                onChange={(e) => {
                                                    const newMods = [...activeCourse.modules];
                                                    newMods[mIdx].lessons[lIdx].description = e.target.value;
                                                    setActiveCourse({ ...activeCourse, modules: newMods });
                                                }}
                                            />
                                        </div>
                                        <input 
                                            className="w-20 text-xs text-slate-500 bg-slate-50 border-none rounded p-1 text-right"
                                            value={les.duration}
                                            onChange={(e) => {
                                                const newMods = [...activeCourse.modules];
                                                newMods[mIdx].lessons[lIdx].duration = e.target.value;
                                                setActiveCourse({ ...activeCourse, modules: newMods });
                                            }}
                                        />
                                        <div className="opacity-0 group-hover:opacity-100 flex gap-2">
                                            <button className="text-blue-600 hover:bg-blue-50 p-1 rounded"><Video size={14}/></button>
                                            <button 
                                                onClick={() => {
                                                    const newMods = [...activeCourse.modules];
                                                    newMods[mIdx].lessons = newMods[mIdx].lessons.filter((_, i) => i !== lIdx);
                                                    setActiveCourse({ ...activeCourse, modules: newMods });
                                                }}
                                                className="text-red-400 hover:bg-red-50 p-1 rounded"
                                            >
                                                <Trash2 size={14}/>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <button 
                                    onClick={() => {
                                        const newMods = [...activeCourse.modules];
                                        newMods[mIdx].lessons.push({
                                            id: `les_${Date.now()}`,
                                            title: 'New Lesson',
                                            duration: '5 min',
                                            completed: false,
                                            link: '#'
                                        });
                                        setActiveCourse({ ...activeCourse, modules: newMods });
                                    }}
                                    className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:underline mt-2"
                                >
                                    <Plus size={12} /> Add Lesson
                                </button>
                            </div>
                        </div>
                    ))}
                    
                    <button 
                        onClick={() => {
                            setActiveCourse({
                                ...activeCourse,
                                modules: [...activeCourse.modules, {
                                    id: `mod_${Date.now()}`,
                                    title: 'New Module',
                                    desc: '',
                                    lessons: []
                                }]
                            });
                        }}
                        className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-bold hover:border-indigo-400 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2"
                    >
                        <Plus size={18} /> Add Module
                    </button>
                </div>
            </div>
        </div>
      ) : (
        <>
            {/* AI Generator Box */}
            <div className="bg-gradient-to-r from-indigo-900 to-violet-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden mb-8">
                <div className="absolute top-0 right-0 p-8 opacity-10"><Sparkles size={180} /></div>
                <div className="relative z-10 max-w-2xl">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Sparkles className="text-yellow-400 fill-yellow-400" /> AI Curriculum Generator</h2>
                    <p className="text-indigo-200 mb-6">Instantly generate a structured video course outline tailored to your clients.</p>
                    <div className="flex gap-3">
                        <input 
                            type="text" 
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="e.g. How to Fix Personal Credit for Funding"
                            className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-indigo-300 focus:outline-none focus:bg-white/20"
                        />
                        <button 
                            onClick={handleGenerate}
                            disabled={isGenerating || !topic}
                            className="bg-white text-indigo-900 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors flex items-center gap-2 disabled:opacity-70"
                        >
                            {isGenerating ? <RefreshCw className="animate-spin" size={18}/> : <Sparkles size={18}/>}
                            Generate
                        </button>
                    </div>
                </div>
            </div>

            {/* Course List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map(course => (
                    <div key={course.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all group">
                        <div className="h-40 bg-slate-100 flex items-center justify-center relative overflow-hidden">
                            {course.thumbnail ? (
                                <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <BookOpen size={48} className="text-slate-300" />
                            )}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                <button onClick={() => { setActiveCourse(course); setIsEditing(true); }} className="bg-white text-slate-900 p-2 rounded-lg hover:scale-110 transition-transform"><Edit2 size={18}/></button>
                                <button onClick={() => handleDelete(course.id)} className="bg-red-500 text-white p-2 rounded-lg hover:scale-110 transition-transform"><Trash2 size={18}/></button>
                            </div>
                        </div>
                        <div className="p-6">
                            <h3 className="font-bold text-slate-900 mb-2 truncate">{course.title}</h3>
                            <p className="text-sm text-slate-500 line-clamp-2 mb-4 h-10">{course.description}</p>
                            <div className="flex items-center gap-4 text-xs text-slate-400 font-bold uppercase tracking-wider">
                                <span>{course.modules.length} Modules</span>
                                <span>{course.modules.reduce((acc, m) => acc + m.lessons.length, 0)} Lessons</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
      )}

    </div>
  );
};

export default CourseBuilder;
