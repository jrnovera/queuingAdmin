import React from 'react';
import { Timestamp } from 'firebase/firestore';

export type AppNotification = {
  id: string;
  actorName?: string;
  queueName?: string;
  message: string;
  createdAt?: Date | Timestamp;
  linkHref?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  loading?: boolean;
};

const formatWhen = (dt?: Date | Timestamp) => {
  if (!dt) return '';
  const date = dt instanceof Timestamp ? dt.toDate() : dt;
  return date.toLocaleString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: 'numeric', minute: '2-digit', weekday: 'long'
  });
};

const NotificationsDrawer: React.FC<Props> = ({ open, onClose, notifications, loading }) => {
  return (
    <div className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black transition-opacity ${open ? 'opacity-30' : 'opacity-0'}`}
        onClick={onClose}
      />
      {/* Panel */}
      <div
        className={`absolute top-0 right-0 h-full w-full max-w-md bg-white shadow-xl transform transition-transform border-l border-gray-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-label="Notifications"
      >
        <div className="px-5 py-4 border-b border-gray-300 bg-gray-800 text-white flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-wide">NOTIFICATIONS</h2>
          <button onClick={onClose} className="text-white/80 hover:text-white" aria-label="Close">✕</button>
        </div>
        <div className="overflow-y-auto h-full">
          {loading ? (
            <div className="p-5 text-sm text-gray-600">Loading…</div>
          ) : notifications.length === 0 ? (
            <div className="p-5 text-sm text-gray-600">No notifications yet.</div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {notifications.map(n => (
                <li key={n.id} className="p-4 flex gap-3 items-start hover:bg-gray-50">
                  <div className="w-9 h-9 rounded-full border border-gray-400 flex items-center justify-center text-gray-500">👤</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm">
                      {n.message}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatWhen(n.createdAt)}
                    </div>
                  </div>
                  {n.linkHref ? (
                    <a href={n.linkHref} className="text-xs underline">Open</a>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsDrawer;
