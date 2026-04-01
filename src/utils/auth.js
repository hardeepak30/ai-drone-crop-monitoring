export function readUsers() {
  try {
    const raw = localStorage.getItem('users');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function writeUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
}

export function signupUser({ name, email, password }) {
  const users = readUsers();
  if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    return { ok: false, error: 'An account with this email already exists.' };
  }
  users.push({ name, email, password });
  writeUsers(users);
  setAuthUser({ email });
  return { ok: true };
}

export function loginUser({ email, password }) {
  const users = readUsers();
  const user = users.find(
    u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  if (!user) return { ok: false, error: 'Invalid email or password.' };
  setAuthUser({ email: user.email });
  return { ok: true };
}

export function getAuthUser() {
  try {
    const raw = localStorage.getItem('authUser');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setAuthUser(user) {
  localStorage.setItem('authUser', JSON.stringify(user));
}

export function logout() {
  localStorage.removeItem('authUser');
}

