"use client";

import { useState, useEffect } from "react";
import { Bell, Check, ExternalLink } from "lucide-react";
import { getUnreadNotifications, markAsRead, markAllAsRead } from "@/actions/notification";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [count, setCount] = useState(0);

  const fetchNotifs = async () => {
    try {
      const data = await getUnreadNotifications();
      setCount(data.count);
      setNotifications(data.items);
    } catch(e) {}
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, []);

  const handleMarkRead = async (id: string) => {
    await markAsRead(id);
    setNotifications(prev => prev.filter(n => n._id !== id));
    setCount(prev => Math.max(0, prev - 1));
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setOpen(!open)}
        className="relative p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5" />
        {count > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow ring-2 ring-white dark:ring-slate-950">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-white/10 z-50 overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 dark:text-white">Notifikasi</h3>
            {count > 0 && (
              <button 
                onClick={async () => {
                  await markAllAsRead();
                  setCount(0);
                  setNotifications([]);
                }}
                className="text-xs text-blue-600 hover:underline font-medium"
              >
                Tandai semua dibaca
              </button>
            )}
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                Belum ada notifikasi baru.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-white/5">
                {notifications.map((notif: any) => (
                  <div key={notif._id} className="p-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">{notif.title}</p>
                    <p className="text-xs text-slate-500 line-clamp-2 mb-2">{notif.message}</p>
                    <div className="flex items-center justify-between">
                      {notif.link && (
                        <Link href={notif.link} className="text-[10px] uppercase font-bold text-blue-600 flex items-center gap-1">
                          Lihat Detail <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                      <button 
                        onClick={() => handleMarkRead(notif._id)}
                        className="text-[10px] bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 px-2 py-1 rounded"
                      >
                        Tandai dibaca
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
