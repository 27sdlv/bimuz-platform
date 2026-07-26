'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { lessonApi, homeworkApi } from '@/lib/api';
import Link from 'next/link';
import Plyr from 'plyr-react';
import 'plyr-react/plyr.css';

function getYoutubeEmbedUrl(rawUrl?: string) {
  if (!rawUrl) return null;

  try {
    const url = new URL(rawUrl);
    const host = url.hostname.replace('www.', '');

    if (host === 'youtu.be') {
      const videoId = url.pathname.split('/').filter(Boolean)[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }

    if (host === 'youtube.com' || host === 'm.youtube.com') {
      if (url.pathname === '/watch') {
        const videoId = url.searchParams.get('v');
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
      }

      if (url.pathname.startsWith('/shorts/')) {
        const videoId = url.pathname.split('/')[2];
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
      }

      if (url.pathname.startsWith('/embed/')) {
        return rawUrl;
      }
    }
  } catch {
    return null;
  }

  return null;
}

function isDirectVideoFile(rawUrl?: string) {
  if (!rawUrl) return false;
  const cleanUrl = rawUrl.split('?')[0].toLowerCase();
  return cleanUrl.endsWith('.mp4') || cleanUrl.endsWith('.webm') || cleanUrl.endsWith('.ogg');
}

export default function LessonDetailPage() {
  const { id } = useParams();
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [watchCompleted, setWatchCompleted] = useState(false);
  const [markingComplete, setMarkingComplete] = useState(false);
  const router = useRouter();
  const plyrRef = useRef<any>(null);

  useEffect(() => {
    let player: any = null;
    const interval = setInterval(() => {
      if (plyrRef.current?.plyr) {
        player = plyrRef.current.plyr;
        if (!player._hasEndedEvent) {
          player.on('ended', markVideoAsCompleted);
          player._hasEndedEvent = true;
        }
      }
    }, 500);
    return () => {
      clearInterval(interval);
      if (player) {
        player.off('ended', markVideoAsCompleted);
        player._hasEndedEvent = false;
      }
    };
  }, [watchCompleted, id]);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const res = await lessonApi.get(id as string);
        if (res.data.is_locked) {
          router.push(`/kurs/${res.data.course}`);
          return;
        }
        setLesson(res.data);
        setWatchCompleted(Boolean(res.data.watched_completed));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [id, router]);

  const handleHomeworkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('lesson', id as string);
      formData.append('file', file);
      formData.append('comment', comment);
      await homeworkApi.submit(formData);
      setSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const markVideoAsCompleted = async () => {
    if (watchCompleted || markingComplete) return;
    try {
      setMarkingComplete(true);
      await lessonApi.complete(id as string);
      setWatchCompleted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setMarkingComplete(false);
    }
  };

  if (loading) return <div className="p-10 text-center font-bold text-slate-900">Yuklanmoqda...</div>;
  if (!lesson) return <div className="p-10 text-center">Dars topilmadi</div>;
  const videoSource = lesson.video_source || lesson.video_file || lesson.video_url;
  const embedUrl = getYoutubeEmbedUrl(videoSource);
  const isDirectVideo = isDirectVideoFile(videoSource);

  return (
    <div className="container mx-auto px-6 py-12 page-transition">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10 animate-fade-in-up">
          <Link href={`/kurs/${lesson.course}`} className="text-sm font-bold text-blue-600 hover:text-blue-500 mb-2 block animate-fade-in-up delay-1">← Kurs darslari ro'yxati</Link>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight animate-fade-in-up delay-1">{lesson.title}</h1>
        </div>

        {/* Video Player Section */}
        <div 
          className="aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl mb-12 animate-fade-in-scale delay-2"
          onContextMenu={(e) => e.preventDefault()}
        >
          {embedUrl ? (
            <iframe
              className="w-full h-full"
              src={`${embedUrl}?rel=0&modestbranding=1&controls=1`}
              title={lesson.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          ) : isDirectVideo && videoSource ? (
            <div className="w-full h-full [&_.plyr]:h-full [&_.plyr__video-wrapper]:h-full [&_.plyr__video-wrapper_video]:h-full [&_.plyr__video-wrapper_video]:object-cover">
              <Plyr
                ref={plyrRef}
                source={{
                  type: 'video',
                  sources: [{ src: videoSource, provider: 'html5' }],
                }}
                options={{
                  controls: [
                    'play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'settings', 'fullscreen'
                  ],
                  settings: ['quality', 'speed'],
                  speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] }
                }}
              />
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-white gap-4 px-6 text-center">
              <p className="font-bold italic">Video ichki playerda ochilmadi.</p>
              {videoSource ? (
                <a
                  href={videoSource}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white text-slate-900 px-4 py-2 rounded-lg text-sm font-bold"
                >
                  Videoni yangi oynada ochish
                </a>
              ) : (
                <p className="text-sm text-slate-300">Video havolasi kiritilmagan</p>
              )}
            </div>
          )}
        </div>        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 animate-fade-in-up delay-3">
          <div className="lg:col-span-2 space-y-8">
            <div className="bimuz-card p-10 bg-white hover-glow">
              <h2 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tight border-b-4 border-blue-600 inline-block pb-1">Dars haqida</h2>
              <p className="text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">{lesson.description}</p>
            </div>
            <div className={`bimuz-card p-6 animate-fade-in-up delay-4 ${watchCompleted ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
              <h3 className="font-black text-slate-900 mb-2">Video holati</h3>
              <p className={`text-sm font-bold ${watchCompleted ? 'text-green-600' : 'text-slate-500'}`}>
                {watchCompleted ? "Video to'liq ko'rildi" : "Keyingi dars ochilishi uchun videoni oxirigacha ko'ring (video tugagach avtomatik belgilanadi)"}
              </p>
            </div>
          </div>

          <div className="space-y-6 animate-fade-in-up delay-5">
            <div className={`bimuz-card p-8 hover-glow ${success || lesson.has_submission ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
              <h2 className="text-xl font-black text-slate-900 mb-4 uppercase tracking-tight">Uyga vazifa</h2>
              
              {lesson.homework_task && !(success || lesson.has_submission) && (
                <div className="bg-blue-50/50 p-6 rounded-2xl mb-6 border border-blue-100">
                  <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Vazifa matni:</h4>
                  <p className="text-slate-700 font-bold leading-relaxed">{lesson.homework_task}</p>
                </div>
              )}

              {success || (lesson.has_submission && lesson.submission_status !== 'rejected') ? (
                <div className="space-y-4">
                  <div className="text-green-600 font-bold">
                    <p className="mb-2">Vazifangiz topshirilgan!</p>
                    <p className="text-sm opacity-80 mb-4">{lesson.submission_status === 'pending' ? 'Admin tekshiruvini kuting.' : 'Qabul qilindi.'}</p>
                  </div>
                  
                  {lesson.next_lesson_id ? (
                    <button
                      onClick={() => router.push(`/dars/${lesson.next_lesson_id}`)}
                      disabled={lesson.submission_status !== 'approved'}
                      className={`bimuz-btn-primary w-full flex items-center justify-center gap-3 group ${lesson.submission_status !== 'approved' ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                    >
                      Keyingi darsga o'tish
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                    </button>
                  ) : (
                    <Link href={`/kurs/${lesson.course}`} className="bimuz-btn-primary w-full block text-center">
                      Kursni davom ettirish
                    </Link>
                  )}

                  {lesson.next_lesson_id && lesson.submission_status !== 'approved' && (
                    <p className="text-[10px] text-slate-400 text-center mt-3 font-bold uppercase tracking-widest">
                      Vazifa qabul qilingandan so'ng faollashadi
                    </p>
                  )}

                  <div className="text-center pt-2">
                    <Link href={`/kurs/${lesson.course}`} className="text-blue-600 hover:underline text-xs font-bold">
                      ← Kurs mundarijasiga qaytish
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleHomeworkSubmit} className="space-y-4">
                  <p className="text-sm text-slate-500 font-medium">Fayl yuklang (Revit, PDF, Rasm)</p>
                  <input
                    type="file"
                    required
                    className="w-full text-sm text-slate-500 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-black file:bg-slate-900 file:text-white hover:file:bg-slate-800 cursor-pointer"
                    onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                  />
                  <textarea
                    placeholder="Izoh (ixtiyoriy)"
                    className="w-full p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium"
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  ></textarea>
                  <button
                    disabled={submitting}
                    className="bimuz-btn-primary w-full disabled:opacity-50"
                  >
                    {submitting ? 'Yuborilmoqda...' : 'Topshirish'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
