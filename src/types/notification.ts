
import { ReactNode } from "react";

export type NotificationType = {
  id: number;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: 'message' | 'event' | 'document' | 'user' | 'system' | 'announcement';
  icon: ReactNode;
};
