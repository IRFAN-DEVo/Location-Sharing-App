import { useCallback, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { onValue, ref } from 'firebase/database';
import { auth, database } from '../firebase';
import AdminDashboard from '../components/AdminDashboard';

const adminEmail = import.meta.env.VITE_ADMIN_EMAIL?.trim().toLowerCase();

const loginErrorMessages = {
  'auth/invalid-credential': 'The email or password is incorrect.',
  'auth/user-not-found': 'No Firebase account exists for this email address.',
  'auth/wrong-password': 'The password is incorrect.',
};

function AccessDenied() {
  return (
    <main className="page narrow">
      <section className="card">
        <h1>Access Denied</h1>
        <p className="status">This Firebase account is not authorized to access the admin dashboard.</p>
        <button className="secondary" onClick={() => signOut(auth)}>Sign out</button>
      </section>
    </main>
  );
}

export default function AdminPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [admin, setAdmin] = useState(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [message, setMessage] = useState('Sign in with the configured Firebase admin account.');
  const [locations, setLocations] = useState([]);

  const authorizeUser = useCallback((user) => {
    const userEmail = user?.email?.trim().toLowerCase();
    const isAuthorized = Boolean(adminEmail && userEmail === adminEmail);
    setAdmin(isAuthorized ? user : null);
    setAccessDenied(Boolean(user && !isAuthorized));

    if (!isAuthorized && !adminEmail) {
      setMessage('Admin access is not configured. Set VITE_ADMIN_EMAIL in the deployment environment.');
    } else if (isAuthorized) {
      setMessage('');
    }
  }, []);

  useEffect(() => onAuthStateChanged(auth, (user) => {
    if (!user || user.isAnonymous) {
      setAdmin(null);
      setAccessDenied(false);
      return;
    }
    authorizeUser(user);
  }), [authorizeUser]);

  useEffect(() => {
    if (!admin) return undefined;

    return onValue(
      ref(database, 'locations'),
      (snapshot) => {
        const active = Object.values(snapshot.val() || {}).filter(
          (item) => item.isSharing === true && Number.isFinite(item.latitude) && Number.isFinite(item.longitude),
        );
        setLocations(active);
      },
      () => setMessage('Unable to read locations. Confirm the Firebase security rules.'),
    );
  }, [admin]);

  const login = async (event) => {
    event.preventDefault();
    setMessage('');

    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      authorizeUser(credential.user);
    } catch (error) {
      console.error('Firebase Login Error:', error);
      setMessage(loginErrorMessages[error.code] || 'Unable to sign in. Please try again.');
    }
  };

  if (accessDenied) return <AccessDenied />;

  if (!admin) {
    return (
      <main className="page narrow">
        <header>
          <h1>Admin dashboard</h1>
          <p>Sign in with the Firebase Email/Password account configured for this deployment.</p>
        </header>
        <section className="card">
          <form onSubmit={login}>
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            <button className="primary" type="submit">Sign in</button>
          </form>
          <p className="status" role="alert">{message}</p>
        </section>
      </main>
    );
  }

  return <AdminDashboard locations={locations} onSignOut={() => signOut(auth)} />;
}
