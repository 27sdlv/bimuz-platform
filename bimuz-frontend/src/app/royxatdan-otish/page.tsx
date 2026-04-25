'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/api';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    password: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Send registration request with both username and full_name
      await authApi.register({
        username: formData.username,
        full_name: formData.full_name,
        phone: formData.phone,
        password: formData.password
      });

      // Auto-login right after successful registration
      const identifier = formData.username.trim();
      const loginRes = await authApi.login({
        username: identifier,
        identifier,
        password: formData.password
      });

      localStorage.setItem('access_token', loginRes.data.access);
      localStorage.setItem('refresh_token', loginRes.data.refresh);
      router.push('/kabinet');
    } catch (err: any) {
      if (err.response?.data) {
        const msgs = Object.values(err.response.data).flat();
        setError(msgs.join(' '));
      } else {
        setError('Xatolik yuz berdi. Iltimos qaytadan urinib ko\'ring.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 page-transition">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl border border-slate-200 shadow-xl animate-fade-in-scale">
        <div>
          <h2 className="mt-6 text-center text-3xl font-black text-slate-900 tracking-tight">
            Ro'yxatdan o'tish
          </h2>
          <p className="mt-2 text-center text-sm text-slate-500 font-bold uppercase tracking-widest">
            BIMUZ O'quv platformasi
          </p>
        </div>
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100">{error}</div>}

          <div className="animate-fade-in-up delay-1">
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Ism Familiyangiz</label>
            <input
              type="text"
              required
              className="appearance-none relative block w-full px-4 py-4 border border-slate-200 placeholder-slate-400 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
              placeholder="Ism Familiyangiz"
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            />
          </div>

          <div className="animate-fade-in-up delay-2">
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Username (Login)</label>
            <input
              type="text"
              required
              className="appearance-none relative block w-full px-4 py-4 border border-slate-200 placeholder-slate-400 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
              placeholder="username"
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>

          <div className="animate-fade-in-up delay-3">
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Telefon raqam</label>
            <input
              type="text"
              required
              className="appearance-none relative block w-full px-4 py-4 border border-slate-200 placeholder-slate-400 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
              placeholder="+998"
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="animate-fade-in-up delay-4">
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Parol</label>
            <input
              type="password"
              required
              className="appearance-none relative block w-full px-4 py-4 border border-slate-200 placeholder-slate-400 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
              placeholder="Parol yarating"
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bimuz-btn-primary w-full animate-fade-in-up delay-5 flex items-center justify-center gap-3"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            ) : "Ro'yxatdan o'tish"}
          </button>

          <div className="text-center pt-2">
            <Link href="/kirish" className="text-sm font-bold text-blue-600 hover:text-blue-500 transition-colors">
              Akkauntingiz bormi? Kirish
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
