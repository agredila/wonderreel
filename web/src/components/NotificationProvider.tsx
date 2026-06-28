'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from 'react';
import { useTranslations } from 'next-intl';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export type NotificationAction = {
  label: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
};

export type NotificationPayload = {
  type?: NotificationType;
  title: string;
  message?: string;
  confirmLabel?: string;
  onConfirm?: () => void;
  dismissLabel?: string;
  onDismiss?: () => void;
  actions?: NotificationAction[];
  autoDismissMs?: number;
};

type NotificationContextValue = {
  notify: (payload: NotificationPayload) => void;
  notifySuccess: (title: string, message?: string, options?: Partial<NotificationPayload>) => void;
  notifyError: (title: string, message?: string, options?: Partial<NotificationPayload>) => void;
  notifyWarning: (title: string, message?: string, options?: Partial<NotificationPayload>) => void;
  notifyInfo: (title: string, message?: string, options?: Partial<NotificationPayload>) => void;
  dismiss: () => void;
};

const NotificationContext = createContext<NotificationContextValue | null>(null);

const TYPE_META: Record<
  NotificationType,
  { icon: string; accent: string; glow: string }
> = {
  success: { icon: '✓', accent: '#0d9488', glow: 'rgba(13, 148, 136, 0.25)' },
  error: { icon: '!', accent: '#dc2626', glow: 'rgba(220, 38, 38, 0.22)' },
  warning: { icon: '⚠', accent: '#d97706', glow: 'rgba(217, 119, 6, 0.22)' },
  info: { icon: 'i', accent: '#2563eb', glow: 'rgba(37, 99, 235, 0.22)' }
};

function NotificationModal({
  payload,
  onClose
}: {
  payload: NotificationPayload;
  onClose: () => void;
}) {
  const t = useTranslations('notification');
  const type = payload.type ?? 'info';
  const meta = TYPE_META[type];
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    if (!payload.autoDismissMs) return;
    const timer = window.setTimeout(onClose, payload.autoDismissMs);
    return () => window.clearTimeout(timer);
  }, [payload.autoDismissMs, onClose]);

  function handleBackdrop(e: React.MouseEvent) {
    if (e.target === e.currentTarget) {
      payload.onDismiss?.();
      onClose();
    }
  }

  function handleConfirm() {
    payload.onConfirm?.();
    onClose();
  }

  function handleDismiss() {
    payload.onDismiss?.();
    onClose();
  }

  const actions =
    payload.actions ??
    (payload.onConfirm
      ? [
          {
            label: payload.confirmLabel ?? t('ok'),
            onClick: handleConfirm,
            variant: 'primary' as const
          },
          {
            label: payload.dismissLabel ?? t('close'),
            onClick: handleDismiss,
            variant: 'secondary' as const
          }
        ]
      : [
          {
            label: payload.dismissLabel ?? payload.confirmLabel ?? t('ok'),
            onClick: handleDismiss,
            variant: 'primary' as const
          }
        ]);

  return (
    <div
      className="notification-backdrop"
      role="presentation"
      onClick={handleBackdrop}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          payload.onDismiss?.();
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        className={`notification-modal notification-modal--${type}`}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="notification-title"
        aria-describedby={payload.message ? 'notification-message' : undefined}
        tabIndex={-1}
        style={
          {
            '--notification-accent': meta.accent,
            '--notification-glow': meta.glow
          } as React.CSSProperties
        }
      >
        <div className="notification-modal__glow" aria-hidden />
        <div className="notification-modal__icon" aria-hidden>
          {meta.icon}
        </div>
        <h2 id="notification-title" className="notification-modal__title">
          {payload.title}
        </h2>
        {payload.message ? (
          <p id="notification-message" className="notification-modal__message">
            {payload.message}
          </p>
        ) : null}
        <div className="notification-modal__actions">
          {actions.map((action, index) => (
            <button
              key={`${action.label}-${index}`}
              type="button"
              className={`btn notification-modal__btn${
                action.variant === 'secondary' ? ' btn-secondary' : ' btn-teal'
              }`}
              onClick={() => {
                action.onClick?.();
                onClose();
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<NotificationPayload | null>(null);
  const queueRef = useRef<NotificationPayload[]>([]);

  const showNext = useCallback(() => {
    const next = queueRef.current.shift();
    setCurrent(next ?? null);
  }, []);

  const enqueue = useCallback(
    (payload: NotificationPayload) => {
      if (current) {
        queueRef.current.push(payload);
        return;
      }
      setCurrent(payload);
    },
    [current]
  );

  const dismiss = useCallback(() => {
    setCurrent(null);
    window.setTimeout(showNext, 180);
  }, [showNext]);

  const notify = useCallback(
    (payload: NotificationPayload) => {
      enqueue(payload);
    },
    [enqueue]
  );

  const notifySuccess = useCallback(
    (title: string, message?: string, options?: Partial<NotificationPayload>) => {
      notify({ type: 'success', title, message, ...options });
    },
    [notify]
  );

  const notifyError = useCallback(
    (title: string, message?: string, options?: Partial<NotificationPayload>) => {
      notify({ type: 'error', title, message, ...options });
    },
    [notify]
  );

  const notifyWarning = useCallback(
    (title: string, message?: string, options?: Partial<NotificationPayload>) => {
      notify({ type: 'warning', title, message, ...options });
    },
    [notify]
  );

  const notifyInfo = useCallback(
    (title: string, message?: string, options?: Partial<NotificationPayload>) => {
      notify({ type: 'info', title, message, ...options });
    },
    [notify]
  );

  const value = useMemo(
    () => ({
      notify,
      notifySuccess,
      notifyError,
      notifyWarning,
      notifyInfo,
      dismiss
    }),
    [notify, notifySuccess, notifyError, notifyWarning, notifyInfo, dismiss]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {current ? <NotificationModal payload={current} onClose={dismiss} /> : null}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return ctx;
}
