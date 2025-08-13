export interface QueueCategory {
  categoryId?: string;
  name: string;
  limit: string;
  timeLimit: string;
  invitedStaff?: string[];
  notes?: string;
  queueId?: string;
  usersList?: string[];
}

export interface Queue {
  queueId?: string;
  queueName: string;
  address: string;
  dateTime: string; // ISO string format
  expiration: string; // ISO string format
  breakTimeFrom?: string;
  breakTimeTo?: string;
  categories: QueueCategory[];
  createdBy: string; // Auth user ID
  createdAt?: string; // ISO string format
  notes?: string;
  formColumns: string[];
}
