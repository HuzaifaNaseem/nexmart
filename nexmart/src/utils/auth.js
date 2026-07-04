export function getStoredUser() {
  try { return JSON.parse(localStorage.getItem('nexmart_user')); }
  catch { return null; }
}

export function storeUser(user) {
  if (user) localStorage.setItem('nexmart_user', JSON.stringify(user));
  else localStorage.removeItem('nexmart_user');
}

const AVATAR_COLORS = [
  '#FF4D00','#7c3aed','#2563eb','#0891b2','#059669',
  '#d97706','#dc2626','#db2777','#4f46e5','#0d9488',
  '#8b5cf6','#ea580c','#16a34a','#9333ea','#e11d48'
];

export function avatarColorFromEmail(email) {
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash);
    hash |= 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return parts[0].substring(0, 2).toUpperCase();
}

export function createUserFromEmail(email, name) {
  const displayName = name || email.split('@')[0].replace(/[._]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
  return {
    name: displayName,
    email: email.toLowerCase(),
    initials: getInitials(displayName),
    avatarColor: avatarColorFromEmail(email),
    joinDate: new Date().toISOString()
  };
}

export function getPasswordStrength(pwd) {
  if (!pwd) return { level: 0, label: '', cls: '' };
  let score = 0;
  if (pwd.length >= 6) score++;
  if (pwd.length >= 10) score++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 1) return { level:1, label:'Weak',   cls:'pwd-strength-weak',   color:'#ef4444' };
  if (score === 2) return { level:2, label:'Fair',   cls:'pwd-strength-fair',   color:'#f59e0b' };
  if (score === 3) return { level:3, label:'Good',   cls:'pwd-strength-good',   color:'#3b82f6' };
  return              { level:4, label:'Strong', cls:'pwd-strength-strong', color:'#22c55e' };
}
