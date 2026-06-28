const KID_MODE_KEY = 'wonderreel_kid_mode';

export function enterKidMode() {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem(KID_MODE_KEY, '1');
  }
}

export function exitKidMode() {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem(KID_MODE_KEY);
  }
}

export function isKidModeActive(): boolean {
  if (typeof sessionStorage === 'undefined') return false;
  return sessionStorage.getItem(KID_MODE_KEY) === '1';
}
