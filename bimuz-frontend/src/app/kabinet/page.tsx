'use client';
import { useEffect, useState } from 'react';
import { adminApi, courseApi, authApi, groupApi, homeworkApi, lessonApi } from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Course = { id: number; title: string };
type Homework = {
  id: number;
  student_name: string;
  lesson_title: string;
  status: string;
  comment: string;
  file: string;
};

type AdminUser = {
  id: number;
  username: string;
  email: string;
  full_name: string;
  phone: string;
  role: 'admin' | 'teacher' | 'student';
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
};

type Enrollment = {
  id: number;
  student: number;
  student_name: string;
  course: number;
  course_title: string;
  is_active: boolean;
};

type Progress = {
  id: number;
  student: number;
  student_name: string;
  course: number;
  course_title: string;
  last_unlocked_order: number;
};

type Watch = {
  id: number;
  student: number;
  student_name: string;
  lesson: number;
  lesson_title: string;
  course_title: string;
  is_completed: boolean;
  completed_at: string | null;
};

type Group = {
  id: number;
  name: string;
  course: number | null;
  course_title: string;
  days: string;
  time: string;
  start_date: string;
  end_date: string;
  max_students: number;
  current_students: number;
  price: number;
  lessons_count: number;
  status: 'active' | 'inactive';
};

export default function DashboardPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [homeworks, setHomeworks] = useState<Homework[]>([]);

  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [progressList, setProgressList] = useState<Progress[]>([]);
  const [watchList, setWatchList] = useState<Watch[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);

  const [feedbackMap, setFeedbackMap] = useState<Record<number, string>>({});
  const [courseForm, setCourseForm] = useState({ title: '', price: '', price_format: 'UZS', description: '' });
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [lessonForm, setLessonForm] = useState({ course: '', title: '', description: '', homework_task: '', video_url: '', order: '0' });
  const [lessons, setLessons] = useState<any[]>([]);
  const [editingLesson, setEditingLesson] = useState<any>(null);
  const [isLessonEditModalOpen, setIsLessonEditModalOpen] = useState(false);
  const [lessonVideoFile, setLessonVideoFile] = useState<File | null>(null);
  const [courseThumbnail, setCourseThumbnail] = useState<File | null>(null);

  const [adminUserForm, setAdminUserForm] = useState({
    username: '',
    full_name: '',
    phone: '',
    email: '',
    role: 'student',
    password: '',
  });
  const [enrollmentForm, setEnrollmentForm] = useState({ student: '', course: '', is_active: true });
  const [progressForm, setProgressForm] = useState({ student: '', course: '', last_unlocked_order: '1' });
  const [watchForm, setWatchForm] = useState({ student: '', lesson: '', is_completed: true });
  const [groupForm, setGroupForm] = useState({
    name: '',
    course: '',
    days: '',
    time: '19:00',
    start_date: '',
    end_date: '',
    max_students: '10',
    current_students: '0',
    price: '',
    lessons_count: '0',
    status: 'active',
  });

  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await authApi.me();
        const isAdmin = Boolean(userRes?.data?.is_admin);
        const requests = isAdmin
          ? [
              courseApi.list(),
              courseApi.list(),
              homeworkApi.list(),
              adminApi.users.list(),
              adminApi.enrollments.list(),
              adminApi.progress.list(),
              adminApi.watches.list(),
              groupApi.list(),
            ]
          : [courseApi.enrolled()];
        const results = await Promise.all(requests);

        setUser(userRes.data);
        if (isAdmin) {
          setCourses(results[0].data || []);
          setAllCourses((results[1] as any).data || []);
          setHomeworks((results[2] as any).data || []);
          setAdminUsers((results[3] as any).data || []);
          setEnrollments((results[4] as any).data || []);
          setProgressList((results[5] as any).data || []);
          setWatchList((results[6] as any).data || []);
          setGroups((results[7] as any).data || []);
        } else {
          setCourses(results[0].data || []);
        }
      } catch (err: any) {
        if (err?.response?.status === 401) {
          router.push('/kirish');
          return;
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  const refreshAdminData = async () => {
    const [
      coursesRes,
      homeworkRes,
      usersRes,
      enrollmentsRes,
      progressRes,
      watchesRes,
      groupsRes,
    ] = await Promise.all([
      courseApi.list(),
      homeworkApi.list(),
      adminApi.users.list(),
      adminApi.enrollments.list(),
      adminApi.progress.list(),
      adminApi.watches.list(),
      groupApi.list(),
    ]);
    setAllCourses(coursesRes.data || []);
    setCourses(coursesRes.data || []);
    setHomeworks(homeworkRes.data || []);
    setAdminUsers(usersRes.data || []);
    setEnrollments(enrollmentsRes.data || []);
    setProgressList(progressRes.data || []);
    setWatchList(watchesRes.data || []);
    setGroups(groupsRes.data || []);
  };

  const handleCourseCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', courseForm.title);
      formData.append('description', courseForm.description);
      formData.append('price', courseForm.price);
      formData.append('price_format', courseForm.price_format);
      if (courseThumbnail) formData.append('thumbnail', courseThumbnail);

      await courseApi.create(formData);
      setCourseForm({ title: '', price: '', price_format: 'UZS', description: '' });
      setCourseThumbnail(null);
      await refreshAdminData();
    } catch (error) {
      console.error(error);
    }
  };

  const openEditModal = (course: any) => {
    setEditingCourse(course);
    setCourseForm({
      title: course.title,
      price: String(course.price),
      price_format: course.price_format || 'UZS',
      description: course.description
    });
    setIsEditModalOpen(true);
  };

  const handleCourseUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', courseForm.title);
      formData.append('description', courseForm.description);
      formData.append('price', courseForm.price);
      formData.append('price_format', courseForm.price_format);
      if (courseThumbnail) formData.append('thumbnail', courseThumbnail);

      await courseApi.update(editingCourse.id, formData);
      setIsEditModalOpen(false);
      setEditingCourse(null);
      setCourseForm({ title: '', price: '', price_format: 'UZS', description: '' });
      setCourseThumbnail(null);
      await refreshAdminData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteCourse = async (id: number) => {
    if (!confirm('Haqiqatdan ham ushbu kursni o\'chirmoqchimisiz?')) return;
    try {
      await courseApi.remove(String(id));
      await refreshAdminData();
    } catch (error) {
      console.error(error);
    }
  };

  const fetchLessons = async (courseId: string) => {
    if (!courseId) {
      setLessons([]);
      return;
    }
    try {
      const res = await lessonApi.list(courseId);
      setLessons(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const createLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonForm.course) return;
    const formData = new FormData();
    formData.append('course', lessonForm.course);
    formData.append('title', lessonForm.title);
    formData.append('description', lessonForm.description);
    formData.append('homework_task', lessonForm.homework_task);
    formData.append('order', lessonForm.order);
    if (lessonForm.video_url) formData.append('video_url', lessonForm.video_url);
    if (lessonVideoFile) formData.append('video_file', lessonVideoFile);

    try {
      await lessonApi.create(formData);
      setLessonForm({ ...lessonForm, title: '', description: '', homework_task: '', video_url: '', order: '0' });
      setLessonVideoFile(null);
      await fetchLessons(lessonForm.course);
    } catch (error) {
      console.error(error);
    }
  };

  const openLessonEditModal = (lesson: any) => {
    setEditingLesson(lesson);
    setLessonForm({
      course: String(lesson.course),
      title: lesson.title,
      description: lesson.description || '',
      homework_task: lesson.homework_task || '',
      video_url: lesson.video_url || '',
      order: String(lesson.order)
    });
    setIsLessonEditModalOpen(true);
  };

  const handleLessonUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('course', lessonForm.course);
      formData.append('title', lessonForm.title);
      formData.append('description', lessonForm.description);
      formData.append('homework_task', lessonForm.homework_task);
      formData.append('order', lessonForm.order);
      if (lessonForm.video_url) formData.append('video_url', lessonForm.video_url);
      if (lessonVideoFile) formData.append('video_file', lessonVideoFile);

      await lessonApi.update(editingLesson.id, formData);
      setIsLessonEditModalOpen(false);
      setEditingLesson(null);
      setLessonVideoFile(null);
      await fetchLessons(lessonForm.course);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteLesson = async (id: number) => {
    if (!confirm('Haqiqatdan ham ushbu darsni o\'chirmoqchimisiz?')) return;
    try {
      await lessonApi.remove(String(id));
      await fetchLessons(lessonForm.course);
    } catch (error) {
      console.error(error);
    }
  };

  const approveHomework = async (homeworkId: number) => {
    await homeworkApi.approve(String(homeworkId));
    await refreshAdminData();
  };

  const rejectHomework = async (homeworkId: number) => {
    await homeworkApi.reject(String(homeworkId), feedbackMap[homeworkId] || '');
    await refreshAdminData();
  };

  const createAdminUser = async (e: React.FormEvent) => {
    e.preventDefault();
    await adminApi.users.create(adminUserForm);
    setAdminUserForm({ username: '', full_name: '', phone: '', email: '', role: 'student', password: '' });
    await refreshAdminData();
  };

  const toggleUserActive = async (u: AdminUser) => {
    await adminApi.users.update(String(u.id), { is_active: !u.is_active });
    await refreshAdminData();
  };

  const createEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    await adminApi.enrollments.create({
      student: Number(enrollmentForm.student),
      course: Number(enrollmentForm.course),
      is_active: Boolean(enrollmentForm.is_active),
    });
    setEnrollmentForm({ student: '', course: '', is_active: true });
    await refreshAdminData();
  };

  const removeEnrollment = async (id: number) => {
    await adminApi.enrollments.remove(String(id));
    await refreshAdminData();
  };

  const createProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    await adminApi.progress.create({
      student: Number(progressForm.student),
      course: Number(progressForm.course),
      last_unlocked_order: Number(progressForm.last_unlocked_order),
    });
    setProgressForm({ student: '', course: '', last_unlocked_order: '1' });
    await refreshAdminData();
  };

  const updateProgress = async (p: Progress, value: number) => {
    await adminApi.progress.update(String(p.id), { last_unlocked_order: value });
    await refreshAdminData();
  };

  const createWatch = async (e: React.FormEvent) => {
    e.preventDefault();
    await adminApi.watches.create({
      student: Number(watchForm.student),
      lesson: Number(watchForm.lesson),
      is_completed: Boolean(watchForm.is_completed),
    });
    setWatchForm({ student: '', lesson: '', is_completed: true });
    await refreshAdminData();
  };

  const removeWatch = async (id: number) => {
    await adminApi.watches.remove(String(id));
    await refreshAdminData();
  };

  const createGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    await groupApi.create({
      name: groupForm.name,
      course: groupForm.course ? Number(groupForm.course) : null,
      days: groupForm.days,
      time: groupForm.time,
      start_date: groupForm.start_date,
      end_date: groupForm.end_date,
      max_students: Number(groupForm.max_students),
      current_students: Number(groupForm.current_students),
      price: Number(groupForm.price),
      lessons_count: Number(groupForm.lessons_count),
      status: groupForm.status,
    });
    setGroupForm({
      name: '',
      course: '',
      days: '',
      time: '19:00',
      start_date: '',
      end_date: '',
      max_students: '10',
      current_students: '0',
      price: '',
      lessons_count: '0',
      status: 'active',
    });
    await refreshAdminData();
  };

  const removeGroup = async (id: number) => {
    await groupApi.remove(String(id));
    await refreshAdminData();
  };

  const [activeTab, setActiveTab] = useState<'Dashboard' | 'Courses' | 'Lessons' | 'Students'>('Dashboard');
  if (loading) return <div className="p-10 text-center font-bold">Yuklanmoqda...</div>;
  const isAdmin = Boolean(user?.is_admin);
  const pendingHomeworks = homeworks.filter((hw) => hw.status === 'pending');

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-6 py-12 page-transition">
        <div className="flex justify-between items-end mb-12 border-b border-slate-200 pb-8 animate-fade-in-up">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Mening kurslarim</h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest mt-2">
              {user?.full_name || user?.username} kabineti
            </p>
          </div>
          <Link href="/" className="bimuz-btn-primary">Yangi kurslar</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course, index) => (
            <div key={course.id} className={`bimuz-card overflow-hidden flex flex-col hover-lift animate-fade-in-up delay-${(index % 5) + 1}`}>
              <div className="h-48 bg-slate-100 flex items-center justify-center border-b border-slate-100">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-slate-300 font-black text-2xl uppercase tracking-tighter">BIMUZ</span>
                )}
              </div>
              <div className="p-6 flex-grow">
                <h3 className="text-xl font-black text-slate-900 leading-tight mb-2">{course.title}</h3>
                <p className="text-sm text-slate-500 line-clamp-2">{course.description}</p>
              </div>
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                 <span className="text-green-600 font-black">Yozilgan</span>
                 <Link href={`/kurs/${course.id}`} className="text-xs font-black uppercase tracking-widest text-slate-900 hover:text-blue-600 transition-colors">
                   Darslarni ko'rish →
                 </Link>
              </div>
            </div>
          ))}
          {courses.length === 0 && (
            <div className="col-span-full py-20 text-center bg-white border-2 border-dashed border-slate-200 rounded-3xl">
              <h3 className="text-xl font-bold text-slate-400">Siz hali biror kursga yozilmagansiz</h3>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ADMIN LAYOUT
  return (
    <div className="flex min-h-screen bg-[#f8fafc] -mt-20 pt-20 animate-fade-in-scale">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-100 hidden lg:flex flex-col sticky top-20 h-[calc(100vh-80px)] p-8 animate-slide-in-left">
        <div className="mb-10">
          <h2 className="text-xl font-black text-slate-900 tracking-tighter">BIMuz Admin</h2>
          <div className="mt-6">
            <p className="text-blue-700 font-black text-lg">The Engineering Authority</p>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Admin Console</p>
          </div>
        </div>

        <nav className="flex-grow space-y-2">
          {[
            { id: 'Dashboard', name: 'Dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
            { id: 'Courses', name: 'Courses', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
            { id: 'Lessons', name: 'Lessons', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
            { id: 'Students', name: 'Students', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
          ].map((item) => (
            <button 
              key={item.id} 
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === item.id ? 'bg-blue-50 text-blue-700 shadow-sm shadow-blue-100 border-r-4 border-blue-700 rounded-r-none -mr-8' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} /></svg>
              {item.name}
            </button>
          ))}
        </nav>

        <div className="mt-auto">
          <button className="w-full flex items-center gap-4 px-4 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Help Center
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col pt-10">
        {/* Scrollable Content */}
        <main className="p-10 space-y-12 max-w-7xl mx-auto w-full pb-32">
          {activeTab === 'Dashboard' && (
            <div className="animate-fade-in-up">
              <section>
                <h1 className="text-3xl font-black text-slate-900 mb-8 admin-title-accent">Admin: Dashboard</h1>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    {[
                      { label: 'Jami kurslar', value: courses.length, icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253' },
                      { label: 'Talabalar', value: adminUsers.filter(u => u.role === 'student').length, icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
                      { label: 'Guruhlar', value: groups.length, icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
                      { label: 'Tekshirilmagan vazifalar', value: pendingHomeworks.length, icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
                    ].map((stat, idx) => (
                      <div key={stat.label} className={`bimuz-card p-6 flex flex-col items-center justify-center text-center hover-lift animate-fade-in-up delay-${idx + 1}`}>
                       <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-700 mb-4">
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon} /></svg>
                       </div>
                       <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
                     </div>
                   ))}
                </div>

                <div className="bg-white border border-slate-100 rounded-2xl p-8">
                  <h2 className="text-xl font-black text-slate-900 mb-6">Tezkor amallar</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <button onClick={() => setActiveTab('Courses')} className="p-6 bg-slate-50 rounded-2xl hover:bg-blue-50 transition-colors group text-left">
                       <h3 className="font-bold text-slate-900 mb-2 text-left">Yangi Kurs</h3>
                       <p className="text-sm text-slate-500 mb-4">Platformaga yangi o'quv kursi qo'shish</p>
                       <span className="text-blue-700 font-bold text-sm group-hover:translate-x-1 transition-transform inline-block">Boshlash →</span>
                     </button>
                     <button onClick={() => setActiveTab('Lessons')} className="p-6 bg-slate-50 rounded-2xl hover:bg-blue-50 transition-colors group text-left">
                       <h3 className="font-bold text-slate-900 mb-2">Video Dars</h3>
                       <p className="text-sm text-slate-500 mb-4">Kurslarga yangi darslar va video materiallar biriktirish</p>
                       <span className="text-blue-700 font-bold text-sm group-hover:translate-x-1 transition-transform inline-block">Boshlash →</span>
                     </button>
                     <button onClick={() => setActiveTab('Students')} className="p-6 bg-slate-50 rounded-2xl hover:bg-blue-50 transition-colors group text-left">
                       <h3 className="font-bold text-slate-900 mb-2 text-left">Talabalar</h3>
                       <p className="text-sm text-slate-500 mb-4">Talabalar progressini va natijalarini kuzatish</p>
                       <span className="text-blue-700 font-bold text-sm group-hover:translate-x-1 transition-transform inline-block">Boshlash →</span>
                     </button>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'Courses' && (
            <section className="animate-fade-in-up">
              <h1 className="text-3xl font-black text-slate-900 mb-8 admin-title-accent">Kurslarni boshqarish</h1>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-1">
                  <div className="bimuz-card p-10 sticky top-28 h-fit">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-700">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <h2 className="text-xl font-black text-slate-900">Yangi kurs qo'shish</h2>
                    </div>
                     <form onSubmit={handleCourseCreate} className="space-y-6">
                      <div>
                        <label className="block text-sm font-bold text-slate-600 mb-2">Kurs nomi</label>
                        <input className="admin-input" placeholder="Masalan: Revit me'moriy loyihalash" required value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-600 mb-2">Narx (son)</label>
                          <input className="admin-input" placeholder="500000" required value={courseForm.price} onChange={(e) => setCourseForm({ ...courseForm, price: e.target.value })} />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-600 mb-2">Narx format</label>
                          <input className="admin-input" placeholder="UZS" value={courseForm.price_format} onChange={(e) => setCourseForm({ ...courseForm, price_format: e.target.value })} />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-600 mb-2">Tavsif</label>
                        <textarea className="admin-input h-32 resize-none" placeholder="Kurs haqida batafsil ma'lumot..." required value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-600 mb-2">Kurs rasmi (Thumbnail)</label>
                        <input type="file" className="w-full text-sm text-slate-500 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-black file:bg-slate-900 file:text-white hover:file:bg-slate-800 cursor-pointer" onChange={(e) => setCourseThumbnail(e.target.files ? e.target.files[0] : null)} />
                      </div>
                      <button className="bimuz-btn-primary w-full">Kurs yaratish</button>
                    </form>
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-4">
                  <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                    Barcha kurslar
                    <span className="bg-slate-200 text-slate-600 px-3 py-1 rounded-full text-xs">{courses.length}</span>
                  </h2>
                  {courses.map((course) => (
                    <div key={course.id} className="admin-table-row flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center font-black text-slate-300">
                           {course.thumbnail ? <img src={course.thumbnail} className="w-full h-full object-cover" /> : 'BIM'}
                         </div>
                         <div>
                           <h3 className="font-black text-slate-900">{course.title}</h3>
                           <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{course.price_format || course.price + ' so\'m'}</p>
                         </div>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/kurs/${course.id}`} className="p-2 text-slate-400 hover:text-blue-600 transition-colors" title="Ko'rish">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </Link>
                        <button onClick={() => openEditModal(course)} className="p-2 text-slate-400 hover:text-amber-600 transition-colors" title="Tahrirlash">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        <button onClick={() => handleDeleteCourse(course.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors" title="O'chirish">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {activeTab === 'Lessons' && (
            <section className="animate-fade-in-up">
              <h1 className="text-3xl font-black text-slate-900 mb-8 admin-title-accent">Darslar boshqaruvi</h1>
              <div className="max-w-3xl mx-auto">
                <div className="bimuz-card p-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-700">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    </div>
                    <h2 className="text-xl font-black text-slate-900">Dars + video qo'shish</h2>
                  </div>
                  <form onSubmit={createLesson} className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-600 mb-2">Kursni tanlang</label>
                      <select className="admin-input appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2364748b%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px_12px] bg-[right_1rem_center] bg-no-repeat" required value={lessonForm.course} onChange={(e) => { setLessonForm({ ...lessonForm, course: e.target.value }); fetchLessons(e.target.value); }}>
                        <option value="">Kursni tanlang</option>
                        {allCourses.map((course) => (
                          <option key={course.id} value={course.id}>{course.title}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-slate-600 mb-2">Dars nomi</label>
                        <input className="admin-input" placeholder="1-dars: Interface bilan tanishuv" required value={lessonForm.title} onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-600 mb-2">Tartibi (Order)</label>
                        <input type="number" className="admin-input" placeholder="1" required value={lessonForm.order} onChange={(e) => setLessonForm({ ...lessonForm, order: e.target.value })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-slate-600 mb-2">Video URL (ixtiyoriy)</label>
                        <input className="admin-input" placeholder="https://youtube.com/..." value={lessonForm.video_url} onChange={(e) => setLessonForm({ ...lessonForm, video_url: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-600 mb-2">Video fayl (ixtiyoriy)</label>
                        <input type="file" className="w-full text-sm text-slate-500 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-black file:bg-slate-900 file:text-white hover:file:bg-slate-800 cursor-pointer" onChange={(e) => setLessonVideoFile(e.target.files ? e.target.files[0] : null)} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-600 mb-2">Dars tavsifi</label>
                      <textarea className="admin-input h-24 resize-none" placeholder="Ushbu darsda o'rganiladigan asosiy mavzular..." value={lessonForm.description} onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-600 mb-2">Uyga vazifa (Homework Task)</label>
                      <textarea className="admin-input h-32 resize-none border-blue-100 bg-blue-50/10" placeholder="Talaba bajarishi kerak bo'lgan amaliy vazifa matni..." value={lessonForm.homework_task} onChange={(e) => setLessonForm({ ...lessonForm, homework_task: e.target.value })} />
                    </div>
                    <button className="bimuz-btn-primary w-full shadow-blue-200">Dars yaratish</button>
                  </form>
                </div>
                <div className="mt-12 space-y-4">
                  <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                    Darslar ro'yxati
                    <span className="bg-slate-200 text-slate-600 px-3 py-1 rounded-full text-xs">{lessons.length}</span>
                  </h2>
                  {lessonForm.course ? (
                    lessons.length > 0 ? (
                      lessons.map((lesson) => (
                        <div key={lesson.id} className="admin-table-row flex items-center justify-between">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center font-black text-slate-400">
                               {lesson.order}
                             </div>
                             <div>
                               <h3 className="font-bold text-slate-900">{lesson.title}</h3>
                               <p className="text-xs text-slate-400 font-medium truncate max-w-[300px]">{lesson.description || 'Tavsif yo\'q'}</p>
                             </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => openLessonEditModal(lesson)} className="p-2 text-slate-400 hover:text-amber-600 transition-colors" title="Tahrirlash">
                               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            </button>
                            <button onClick={() => handleDeleteLesson(lesson.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors" title="O'chirish">
                               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10 bg-white border-2 border-dashed border-slate-100 rounded-3xl text-slate-400 font-bold">
                        Ushbu kursda hali darslar yo'q.
                      </div>
                    )
                  ) : (
                    <div className="text-center py-10 bg-slate-50 border border-slate-100 rounded-3xl text-slate-400 font-bold">
                        Darslar ro'yxatini ko'rish uchun kursni tanlang.
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {activeTab === 'Students' && (
            <section className="space-y-12 animate-fade-in-up">
              <div>
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h1 className="text-3xl font-black text-slate-900 admin-title-accent">Admin: Progress</h1>
                    <p className="text-slate-500 font-bold mt-2">Talabalar dars o'zlashtirish ko'rsatkichlari</p>
                  </div>
                  <div className="flex gap-4">
                    <button className="bg-white border border-slate-200 px-6 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">Barcha talabalar</button>
                    <button className="bg-white border border-slate-200 px-6 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2">
                      Barcha kurslar
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="hidden lg:grid grid-cols-12 px-10 mb-4 text-xs font-black text-slate-400 uppercase tracking-widest">
                    <div className="col-span-4">Talaba ismi</div>
                    <div className="col-span-4">Tanlangan kurs</div>
                    <div className="col-span-2 text-center">Ochilgan darslar soni</div>
                    <div className="col-span-2 text-right pr-6">Harakat</div>
                  </div>

                  {progressList.length === 0 ? (
                    <div className="bimuz-card p-20 text-center text-slate-400 font-bold">Progress ma'lumotlari mavjud emas.</div>
                  ) : (
                    progressList.map((p) => (
                      <div key={p.id} className="admin-table-row grid lg:grid-cols-12 gap-0 items-center px-10 py-6">
                        <div className="col-span-4 flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm">
                            {p.student_name.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="font-black text-slate-900">{p.student_name}</span>
                        </div>
                        <div className="col-span-4">
                          <span className="bg-blue-50 text-blue-700 px-4 py-1 rounded-full text-xs font-black">{p.course_title}</span>
                        </div>
                        <div className="col-span-2 text-center">
                          <span className="bg-slate-100 text-slate-700 px-4 py-1 rounded-lg font-black">{p.last_unlocked_order}</span>
                        </div>
                        <div className="col-span-2 text-right">
                          <button className="text-blue-700 font-black text-sm hover:underline" onClick={() => (document.getElementById(`edit-${p.id}`) as any)?.classList.toggle('hidden')}>
                            Yangilash
                          </button>
                        </div>
                        <div id={`edit-${p.id}`} className="hidden col-span-12 mt-4 pt-4 border-t border-slate-50 flex gap-4">
                          <input 
                            type="number" 
                            defaultValue={p.last_unlocked_order} 
                            className="bg-slate-50 border rounded-lg px-4 py-1 w-20 outline-none focus:ring-2 focus:ring-blue-500"
                            onBlur={(e) => {
                              updateProgress(p, Number(e.target.value));
                              (document.getElementById(`edit-${p.id}`) as any)?.classList.add('hidden');
                            }}
                          />
                          <span className="text-xs text-slate-400 flex items-center">Raqamni o'zgartiring va enter yoki blur qiling</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 pt-12 border-t border-slate-100">

                  <div className="space-y-3">
                    {enrollments.slice(0, 10).map((e) => (
                      <div key={e.id} className="flex justify-between items-center p-4 bg-white border border-slate-100 rounded-xl">
                        <div>
                          <p className="font-bold text-slate-900">{e.student_name}</p>
                          <p className="text-xs text-slate-400">{e.course_title}</p>
                        </div>
                        <button onClick={() => removeEnrollment(e.id)} className="text-red-500">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>

                <div>
                  <h2 className="text-xl font-black text-slate-900 mb-6">Homework Tekshiruvi</h2>
                  <div className="space-y-4">
                    {pendingHomeworks.length === 0 ? (
                      <p className="text-slate-400 font-bold text-center py-10 bg-white border border-slate-100 rounded-2xl">Pending homework yo'q.</p>
                    ) : (
                      pendingHomeworks.map((hw) => (
                        <div key={hw.id} className="bimuz-card p-6">
                          <p className="font-black text-slate-900">{hw.student_name}</p>
                          <p className="text-sm text-slate-500 mb-4">{hw.lesson_title}</p>
                          <div className="flex gap-2">
                             <button onClick={() => approveHomework(hw.id)} className="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-200 transition-colors">Approve</button>
                             <button onClick={() => rejectHomework(hw.id)} className="bg-red-100 text-red-700 px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-200 transition-colors">Reject</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>

      {/* Edit Course Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-2xl font-black text-slate-900">Kursni tahrirlash</h2>
              <button onClick={() => { setIsEditModalOpen(false); setEditingCourse(null); setCourseForm({ title: '', price: '', price_format: 'UZS', description: '' }); }} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleCourseUpdate} className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2">Kurs nomi</label>
                <input className="admin-input" placeholder="Masalan: Revit me'moriy loyihalash" required value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2">Narx (son)</label>
                  <input className="admin-input" placeholder="500000" required value={courseForm.price} onChange={(e) => setCourseForm({ ...courseForm, price: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2">Narx format</label>
                  <input className="admin-input" placeholder="UZS" value={courseForm.price_format} onChange={(e) => setCourseForm({ ...courseForm, price_format: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2">Tavsif</label>
                <textarea className="admin-input h-32 resize-none" placeholder="Kurs haqida batafsil ma'lumot..." required value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2">Kurs rasmini o'zgartirish</label>
                <input type="file" className="w-full text-sm text-slate-500 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-black file:bg-slate-900 file:text-white hover:file:bg-slate-800 cursor-pointer" onChange={(e) => setCourseThumbnail(e.target.files ? e.target.files[0] : null)} />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => { setIsEditModalOpen(false); setEditingCourse(null); setCourseForm({ title: '', price: '', price_format: 'UZS', description: '' }); }} className="flex-1 px-8 py-3 rounded-xl font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all">Bekor qilish</button>
                <button type="submit" className="flex-1 bimuz-btn-primary">O'zgarishlarni saqlash</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Lesson Modal */}
      {isLessonEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-2xl font-black text-slate-900">Darsni tahrirlash</h2>
              <button onClick={() => { setIsLessonEditModalOpen(false); setEditingLesson(null); setLessonForm({ ...lessonForm, title: '', description: '', homework_task: '', video_url: '', order: '0' }); }} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleLessonUpdate} className="p-8 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2">Dars nomi</label>
                  <input className="admin-input" required value={lessonForm.title} onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2">Tartibi (Order)</label>
                  <input type="number" className="admin-input" required value={lessonForm.order} onChange={(e) => setLessonForm({ ...lessonForm, order: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2">Video URL</label>
                  <input className="admin-input" value={lessonForm.video_url} onChange={(e) => setLessonForm({ ...lessonForm, video_url: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2">Video faylni o'zgartirish</label>
                  <input type="file" className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-black file:bg-slate-900 file:text-white" onChange={(e) => setLessonVideoFile(e.target.files ? e.target.files[0] : null)} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2">Dars tavsifi</label>
                <textarea className="admin-input h-20 resize-none" value={lessonForm.description} onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2">Uyga vazifa</label>
                <textarea className="admin-input h-24 resize-none" value={lessonForm.homework_task} onChange={(e) => setLessonForm({ ...lessonForm, homework_task: e.target.value })} />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => { setIsLessonEditModalOpen(false); setEditingLesson(null); setLessonForm({ ...lessonForm, title: '', description: '', homework_task: '', video_url: '', order: '0' }); }} className="flex-1 px-8 py-3 rounded-xl font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all">Bekor qilish</button>
                <button type="submit" className="flex-1 bimuz-btn-primary">Saqlash</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
