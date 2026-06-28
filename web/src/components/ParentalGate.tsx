'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { useNotification } from '@/components/NotificationProvider';

const GATE_KEY = 'wonderreel_gate_unlocked';
const PIN_KEY = 'wonderreel_parent_pin';

function randomMath() {
  const a = Math.floor(Math.random() * 9) + 2;
  const b = Math.floor(Math.random() * 9) + 2;
  return { a, b, answer: a + b };
}

export function useGateUnlocked() {
  const [unlocked, setUnlocked] = React.useState(false);
  React.useEffect(() => {
    setUnlocked(sessionStorage.getItem(GATE_KEY) === '1');
  }, []);
  const unlock = () => {
    sessionStorage.setItem(GATE_KEY, '1');
    setUnlocked(true);
  };
  const lock = () => {
    sessionStorage.removeItem(GATE_KEY);
    setUnlocked(false);
  };
  return { unlocked, unlock, lock };
}

export function ParentalGate({ onUnlock }: { onUnlock: () => void }) {
  const t = useTranslations('studio');
  const tNotify = useTranslations('notification');
  const { notifyWarning } = useNotification();
  const [math] = React.useState(randomMath);
  const [input, setInput] = React.useState('');
  const [pin, setPin] = React.useState('');
  const [storedPin, setStoredPin] = React.useState<string | null>(null);

  React.useEffect(() => {
    setStoredPin(localStorage.getItem(PIN_KEY));
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (storedPin) {
      if (pin === storedPin) {
        onUnlock();
        return;
      }
      notifyWarning(tNotify('gateWrongPin'), tNotify('gateTryAgain'));
      return;
    }
    if (Number.parseInt(input, 10) === math.answer) {
      onUnlock();
    } else {
      notifyWarning(tNotify('gateWrongAnswer'), tNotify('gateTryAgain'));
    }
  }

  return (
    <div className="parental-gate">
      <div className="parental-gate-icon" aria-hidden>🔒</div>
      <h2 className="auth-card-title">{t('gateTitle')}</h2>
      {!storedPin && (
        <p className="auth-card-subtitle">{t('gatePrompt', { a: math.a, b: math.b })}</p>
      )}
      <form className="auth-form" onSubmit={handleSubmit}>
        {storedPin ? (
          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            className="form-input form-input-pin"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="PIN"
            autoComplete="off"
          />
        ) : (
          <input
            type="number"
            className="form-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoComplete="off"
          />
        )}
        <button type="submit" className="btn btn-primary btn-block btn-lg">
          {t('gateUnlock')}
        </button>
      </form>
      {!storedPin && (
        <div className="form-group" style={{ marginTop: 16 }}>
          <label className="form-label form-label-sm">{t('pinSetup')}</label>
          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            className="form-input"
            onBlur={(e) => {
              const v = e.target.value.replace(/\D/g, '').slice(0, 4);
              if (v.length === 4) {
                localStorage.setItem(PIN_KEY, v);
                setStoredPin(v);
              }
            }}
          />
        </div>
      )}
    </div>
  );
}
