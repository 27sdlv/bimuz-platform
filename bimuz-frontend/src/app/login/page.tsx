'use client';
import { useState, Suspense } from 'react';
import { authApi } from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRegistered = searchParams.get('registered') === 'true';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const identifier = username.trim();
      const res = await authApi.login({ username: identifier, identifier, password });
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      router.push('/kabinet');
    } catch (err) {
      setError('Login yoki parol xato!');
    }
  };

  return (
    <>
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        {isRegistered && !error && (
            <div className="bg-green-50 text-green-600 p-4 rounded-xl text-sm font-bold border border-green-100">
                Muvaffaqiyatli ro'yxatdan o'tdingiz! Iltimos, tizimga kiring.
            </div>
        )}
        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100">{error}</div>}
        <div className="space-y-4">
          <div className="animate-fade-in-up delay-1">
            <label htmlFor="username" className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">
              Username yoki Telefon
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="appearance-none relative block w-full px-4 py-4 border border-slate-200 placeholder-slate-400 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
              placeholder="Username yoki telefon"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="animate-fade-in-up delay-2">
            <label htmlFor="password" title="Parol" className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">
              Parol
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="appearance-none relative block w-full px-4 py-4 border border-slate-200 placeholder-slate-400 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
              placeholder="Parol"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <div className="animate-fade-in-up delay-3">
          <button
            type="submit"
            className="bimuz-btn-primary w-full flex justify-center py-4 px-4 border border-transparent text-sm font-black rounded-xl text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all uppercase tracking-widest"
          >
            Kirish
          </button>
        </div>

        <div className="text-center">
            <Link href="/royxatdan-otish" className="text-sm font-bold text-blue-600 hover:text-blue-500 transition-colors">
              Hali ro'yxatdan o'tmaganmisiz?
            </Link>
        </div>
      </form>
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 page-transition">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl border border-slate-200 shadow-xl animate-fade-in-scale">
        <div className="animate-fade-in-up">
          <h2 className="mt-6 text-center text-3xl font-black text-slate-900 tracking-tight">
            Tizimga kirish
          </h2>
          <p className="mt-2 text-center text-sm text-slate-500 font-bold uppercase tracking-widest">
            BIMUZ O'quv platformasi
          </p>
        </div>
        <Suspense fallback={<div>Yuklanmoqda...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
