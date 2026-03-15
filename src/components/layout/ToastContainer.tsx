import { Icon } from '@iconify/react';
import { useApp } from '@/context/AppContext';
import { useEffect, useState } from 'react';

const ToastContainer = () => {
  const { toasts } = useApp();

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none w-full max-w-sm px-4">
      {toasts.map(toast => (
        <ToastItem key={toast.id} message={toast.message} type={toast.type} />
      ))}
    </div>
  );
};

const ToastItem = ({ message, type }: { message: string; type: 'success' | 'error' }) => {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setExiting(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const isError = type === 'error';

  return (
    <div
      className={`${exiting ? 'toast-exit' : 'toast-enter'} ${
        isError ? 'bg-card border-destructive/20' : 'bg-primary text-primary-foreground border-primary'
      } px-4 py-3.5 rounded-xl shadow-xl flex items-center gap-3 border max-w-sm mx-auto w-full`}
    >
      <div className={`h-8 w-8 rounded-full ${isError ? 'bg-destructive/10' : 'bg-primary-foreground/10'} flex items-center justify-center shrink-0`}>
        <Icon
          icon={isError ? 'solar:danger-circle-linear' : 'solar:check-circle-linear'}
          className={isError ? 'text-destructive' : 'text-success'}
          width={18}
        />
      </div>
      <div>
        <p className={`text-sm font-medium ${isError ? 'text-foreground' : ''}`}>{isError ? 'Action Failed' : 'Success'}</p>
        <p className={`text-xs mt-0.5 ${isError ? 'text-muted-foreground' : 'text-primary-foreground/70'}`}>{message}</p>
      </div>
    </div>
  );
};

export default ToastContainer;
