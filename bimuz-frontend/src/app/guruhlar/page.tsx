'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { courseApi } from '@/lib/api';

export default function GuruhlarPage() {
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
    <main className="min-h-screen bg-white py-12 page-transition">
      <div className="container mx-auto px-6">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2 animate-fade-in-up">Guruhlar</h1>
        <p className="text-slate-500 mb-10 animate-fade-in-up delay-1">
          Hozircha alohida guruh modeli yo'q, backenddagi kurslar guruhlar bo'limida ko'rsatilmoqda.
        </p>

        {loading ? (
          <div className="text-center font-bold text-slate-500">Yuklanmoqda...</div>
        ) : courses.length === 0 ? (
          <div className="text-center font-bold text-slate-500">Hozircha kurslar yo'q.</div>
        ) : (
          <div className="space-y-4">
            {courses.map((course, index) => (
              <div key={course.id} className={`border border-slate-200 rounded-xl p-6 flex items-center justify-between hover-lift animate-fade-in-up delay-${(index % 5) + 1}`}>
                <div>
                  <h2 className="text-lg font-black text-slate-900">{course.title}</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Darslar soni: {Array.isArray(course.lessons) ? course.lessons.length : 0}
                  </p>
                </div>
                <Link href={`/kurs/${course.id}`} className="bimuz-btn-primary py-2 text-xs">
                  Ko'rish
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>

  );
}
