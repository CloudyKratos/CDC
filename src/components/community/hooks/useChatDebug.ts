
import { useEffect } from 'react';

export function useChatDebug(label: string, data: any) {
  useEffect(() => {
    console.log(`🐛 [${label}]:`, data);
  }, [label, data]);
}
