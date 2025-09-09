import { makeAutoObservable, runInAction } from 'mobx';
import { collection, onSnapshot, QuerySnapshot, DocumentData, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/firestore';

export type NotificationItem = {
  id: string;
  message: string;
  createdAt?: Date | Timestamp;
  linkHref?: string;
};

class NotificationsStore {
  notifications: NotificationItem[] = [];
  hasUnread: boolean = false;
  private unsub: (() => void) | null = null;
  private initialized: boolean = false;

  constructor() {
    makeAutoObservable(this);
  }

  startListening() {
    if (this.unsub) return; // already listening
    const colRef = collection(db, 'queuesList');
    this.unsub = onSnapshot(colRef, (snapshot: QuerySnapshot<DocumentData>) => {
      // Skip generating notifications for the initial batch of existing docs
      if (!this.initialized) {
        this.initialized = true;
        return;
      }

      const items: NotificationItem[] = [];
      snapshot.docChanges().forEach((change) => {
        if (change.type !== 'added') return; // ignore modified/removed
        const d = change.doc;
        const data = d.data() as {
          name?: string;
          displayName?: string;
          type?: string;
          queueName?: string;
          name_of_queue?: string;
          time_in?: Timestamp;
          schedule?: Timestamp;
        };
        const actor = data.displayName || data.name || 'Someone';
        const queueName = (data.type || data.queueName || data.name_of_queue || 'queue').toString();
        const createdAt = (data.time_in as Timestamp) || (data.schedule as Timestamp) || undefined;
        const message = `${actor} joined the ${queueName.toUpperCase()} queue.`;
        items.push({ id: d.id, message, createdAt });
      });
      console.log('items:', JSON.stringify(items, null, 2));
      if (items.length > 0) {
        runInAction(() => {
          // Prepend newest first
          this.notifications = [...items, ...this.notifications];
      
          this.hasUnread = true;
        });
      }
    });
  }

  stopListening() {
    if (this.unsub) {
      this.unsub();
      this.unsub = null;
      this.initialized = false;
    }
  }

  markAllRead() {
    this.hasUnread = false;
  }
}

export const notificationsStore = new NotificationsStore();


