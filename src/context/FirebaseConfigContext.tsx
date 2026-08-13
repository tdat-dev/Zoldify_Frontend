'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { FirebaseConfig } from '@/lib/firebase-config';

/**
 * Đưa cấu hình Firebase từ server xuống client.
 *
 * Cấu hình được đọc ở layout.tsx (server component) rồi truyền vào đây như một
 * prop bình thường, nên biến môi trường KHÔNG cần tiền tố NEXT_PUBLIC_. Xem
 * lib/firebase-config.ts để biết vì sao phải đi đường vòng này.
 *
 * Mặc định null = chưa cấu hình. Component nào cần biết thì hỏi
 * `useFirebaseConfig()`, đừng đọc process.env — trong trình duyệt nó rỗng.
 */
const FirebaseConfigContext = createContext<FirebaseConfig>(null);

export function FirebaseConfigProvider({
  config,
  children,
}: {
  config: FirebaseConfig;
  children: ReactNode;
}) {
  return (
    <FirebaseConfigContext.Provider value={config}>{children}</FirebaseConfigContext.Provider>
  );
}

/** null nghĩa là chưa cấu hình đủ ba giá trị. */
export function useFirebaseConfig(): FirebaseConfig {
  return useContext(FirebaseConfigContext);
}
