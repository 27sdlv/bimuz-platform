'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { courseApi } from '@/lib/api';
import Link from 'next/link';

export default function CourseLessonsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await courseApi.get(id as string);
        setCourse(res.data);
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
    fetchCourse();
  }, [id, router]);

  const handleEnroll = async () => {
    try {
      setEnrolling(true);
      await courseApi.enroll(id as string);
      const res = await courseApi.get(id as string);
      setCourse(res.data);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        router.push('/kirish');
        return;
      }
      console.error(err);
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) return <div className="p-10 text-center font-bold">Yuklanmoqda...</div>;
  if (!course) return <div className="p-10 text-center">Kurs topilmadi</div>;

  return (
    <div className="container mx-auto px-6 py-12 page-transition">
      <div className="mb-12 border-b border-slate-200 pb-8 flex justify-between items-center animate-fade-in-up">
        <div>
          <Link href="/kabinet" className="text-sm font-bold text-blue-600 hover:text-blue-500 mb-2 block animate-fade-in-up delay-1">← Kabinetga qaytish</Link>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight animate-fade-in-up delay-1">{course.title}</h1>
          <p className="text-slate-500 font-medium mt-2 animate-fade-in-up delay-2">
            {course.is_enrolled ? `${course.lessons.length} ta dars mavjud` : "Kursga yozilgandan so'ng darslar ochiladi"}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {!course.is_enrolled && (
          <div className="bimuz-card p-10 bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-xl shadow-blue-200 animate-fade-in-scale">
            <h3 className="text-2xl font-black mb-3">Kursga yoziling</h3>
            <p className="opacity-90 mb-8 font-medium italic">Barcha darslarni ochish va uyga vazifalarni tekshirish uchun ushbu kursga yoziling.</p>
            <button onClick={handleEnroll} disabled={enrolling} className="bg-white text-blue-700 px-10 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-50 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50">
              {enrolling ? "Yozilmoqda..." : "Kursga yozilish →"}
            </button>
          </div>
        )}

        <div className="space-y-4">
          <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3 animate-fade-in-up delay-3">
             Kurs mundarijasi
             <span className="bg-slate-200 text-slate-600 px-3 py-1 rounded-full text-xs font-black">{course.lessons.length}</span>
          </h2>
          {course.lessons.map((lesson: any, idx: number) => (
            <div key={lesson.id} className={`bimuz-card p-6 flex items-center justify-between transition-all duration-300 hover-lift animate-fade-in-up delay-${(idx % 5) + 1} ${lesson.is_locked ? 'opacity-60 grayscale-[0.5] hover:opacity-70' : 'bg-white border-blue-100'}`}>
              <div className="flex items-center gap-6">

                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner ${lesson.is_locked ? 'bg-slate-200 text-slate-400' : 'bg-blue-600 text-white shadow-blue-200'}`}>
                  {idx + 1}
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 leading-tight">{lesson.title}</h3>
                  <div className="flex items-center gap-3 mt-1.5">
                    {lesson.is_locked ? (
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                           <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                         </svg>
                         Yopiq dars
                       </span>
                    ) : (
                      <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1.5 bg-blue-50 px-2 py-1 rounded">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                           <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                           <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.523 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                         </svg>
                         Ochiq dars
                      </span>
                    )}
                    {lesson.submission_status === 'approved' && (
                      <span className="text-[10px] font-black text-green-600 uppercase tracking-widest bg-green-50 px-2 py-1 rounded">
                        ✓ Qabul qilingan
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {!lesson.is_locked ? (
                <Link href={`/dars/${lesson.id}`} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all">
                  Kirish →
                </Link>
              ) : (
                <div className="text-slate-300 pr-4">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                   </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
