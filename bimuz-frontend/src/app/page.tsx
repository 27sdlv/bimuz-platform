'use client';
import { useEffect, useState } from 'react';
import { courseApi } from '@/lib/api';
import Link from 'next/link';

export default function Home() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollingCourseId, setEnrollingCourseId] = useState<number | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await courseApi.list();
        setCourses(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error('Failed to load courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleEnroll = async (courseId: number) => {
    try {
      setEnrollingCourseId(courseId);
      await courseApi.enroll(String(courseId));
      alert("Kursga muvaffaqiyatli yozildingiz. Endi kurs kabinetda ko'rinadi.");
    } catch (error) {
      console.error('Failed to enroll:', error);
      alert("Kursga yozilish uchun avval tizimga kiring.");
    } finally {
      setEnrollingCourseId(null);
    }
  };

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-white py-20 border-b border-slate-100 page-transition">
        <div className="container mx-auto px-6 text-center">
          <div className="inline-block px-4 py-1 bg-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6 animate-fade-in-up">
            KURSLAR
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 tracking-tighter animate-fade-in-up delay-1">Yo'nalishlar</h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium animate-fade-in-up delay-2">
            Qurilish, arxitektura va injenerlik yo'nalishlarida Revit asosida loyihalash kurslari
          </p>
        </div>
      </section>

      {/* Topics Grid */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-6">
          {loading ? (
            <div className="text-center font-bold text-slate-500">Yo'nalishlar yuklanmoqda...</div>
          ) : courses.length === 0 ? (
            <div className="text-center font-bold text-slate-500">Hozircha kurslar yo'q.</div>
          ) : (
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
                    <span className="text-blue-600 font-black">{course.price_formatted || `${course.price} so'm`}</span>
                    {course.is_enrolled ? (
                      <Link
                        href={`/kurs/${course.id}`}
                        className="text-xs font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        Kursga o'tish →
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleEnroll(course.id)}
                        disabled={enrollingCourseId === course.id}
                        className="text-xs font-black uppercase tracking-widest text-slate-900 hover:text-blue-600 transition-colors disabled:opacity-50"
                      >
                        {enrollingCourseId === course.id ? 'Yozilmoqda...' : "Yozilish →"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
