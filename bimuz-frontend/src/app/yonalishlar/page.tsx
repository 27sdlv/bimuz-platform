'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { courseApi } from '@/lib/api';

export default function YonalishlarPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <main className="min-h-screen bg-slate-50 py-12 page-transition">
      <div className="container mx-auto px-6">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-8 animate-fade-in-up">Yo'nalishlar</h1>

        {loading ? (
          <div className="text-center font-bold text-slate-500">Yuklanmoqda...</div>
        ) : courses.length === 0 ? (
          <div className="text-center font-bold text-slate-500">Hozircha kurslar yo'q.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course, index) => (
              <div key={course.id} className={`bg-white border border-slate-200 p-8 rounded-2xl shadow-sm hover-lift animate-fade-in-up delay-${(index % 5) + 1}`}>
                <h2 className="text-xl font-black text-slate-900 mb-2">{course.title}</h2>
                <p className="text-slate-500 text-sm line-clamp-3 mb-4">{course.description}</p>
                <Link href={`/kurs/${course.id}`} className="text-blue-600 font-bold text-sm hover:text-blue-500">
                  Kursga o'tish →
                </Link>
              </div>
            ))}   
          </div>
        )}
      </div>
    </main>

  );
}
