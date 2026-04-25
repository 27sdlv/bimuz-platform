'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from "next/image";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const accessToken = localStorage.getItem('access_token');
    setIsAuthenticated(Boolean(accessToken));
  }, [pathname]);

  const handleLogout = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setIsAuthenticated(false);
    router.push('/');
  };

  return (
    <nav className="bg-white border-bottom border-slate-100 sticky top-0 z-50 py-4 shadow-sm">
      <div className="container mx-auto px-6 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          {/* BIMUZ Logo Placeholder */}
                  <Image
          src="/logo.jpg"
          alt="BIMUZ logo"
          width={40}
          height={40}
          className="rounded-lg object-contain"
        />
          <span className="text-2xl font-black text-slate-900 tracking-tighter">BIMUZ</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-10 text-sm font-bold text-slate-600 uppercase tracking-wide">
          <Link href="/" className={pathname === '/' ? 'text-blue-600' : 'hover:text-blue-600 transition-colors'}>Bosh sahifa</Link>
          <Link href="/yonalishlar" className="hover:text-blue-600 transition-colors">Yo'nalishlar</Link>
          <Link href="/guruhlar" className="hover:text-blue-600 transition-colors">Guruhlar</Link>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link href="/kabinet" className="bg-[#1e293b] text-white px-5 py-2 rounded-lg font-bold text-sm hover:bg-slate-800 transition-all shadow-md">
                Profil
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm font-bold text-slate-700 hover:text-red-600 transition-colors"
              >
                Chiqish
              </button>
            </>
          ) : (
            <>
              <Link href="/kirish" className="text-sm font-bold text-slate-700 hover:text-blue-600 transition-colors">Kirish</Link>
              <Link href="/royxatdan-otish" className="bg-[#1e293b] text-white px-5 py-2 rounded-lg font-bold text-sm hover:bg-slate-800 transition-all shadow-md">Ro'yxatdan o'tish</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
