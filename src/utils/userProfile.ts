'use client';

// Cookie helper functions
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

export function setCookie(name: string, value: string, days = 365): void {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

const CURRENT_USER_COOKIE = 'stuffy_username';
const REGISTERED_USERS_COOKIE = 'stuffy_registered_users';

export function getCurrentUsername(): string | null {
  const fromCookie = getCookie(CURRENT_USER_COOKIE);
  if (fromCookie) return fromCookie;
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem(CURRENT_USER_COOKIE);
  }
  return null;
}

export function getRegisteredUsernames(): string[] {
  let listStr = getCookie(REGISTERED_USERS_COOKIE);
  if (!listStr && typeof localStorage !== 'undefined') {
    listStr = localStorage.getItem(REGISTERED_USERS_COOKIE);
  }
  if (!listStr) return [];
  try {
    const parsed = JSON.parse(listStr);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function registerUsername(username: string): { success: boolean; error?: string } {
  const trimmed = username.trim();
  if (!trimmed) {
    return { success: false, error: 'Username cannot be blank!' };
  }
  if (trimmed.length < 2 || trimmed.length > 16) {
    return { success: false, error: 'Username must be between 2 and 16 characters!' };
  }

  const registered = getRegisteredUsernames();
  const current = getCurrentUsername();

  // If already logged in with this exact name, accept it
  if (current && current.toLowerCase() === trimmed.toLowerCase()) {
    return { success: true };
  }

  // Check if name is already registered by another profile on this device
  const isTaken = registered.some((name) => name.toLowerCase() === trimmed.toLowerCase());
  if (isTaken) {
    return { success: false, error: `The username "${trimmed}" has already been taken on this device! Please choose a unique name.` };
  }

  // Register and set as active user
  const updatedList = [...registered, trimmed];
  const listJson = JSON.stringify(updatedList);

  setCookie(CURRENT_USER_COOKIE, trimmed);
  setCookie(REGISTERED_USERS_COOKIE, listJson);

  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(CURRENT_USER_COOKIE, trimmed);
    localStorage.setItem(REGISTERED_USERS_COOKIE, listJson);
  }

  return { success: true };
}

export function switchUsername(username: string): void {
  setCookie(CURRENT_USER_COOKIE, username);
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(CURRENT_USER_COOKIE, username);
  }
}
