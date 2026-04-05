import React, { useState } from 'react';
import { auth, db } from '../../firebase';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/useAuth';
import { ShieldCheck, Lock, Mail, ArrowRight } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleAdminCheck = async (user: any) => {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists() && userDoc.data()?.role === 'admin') {
      setUser(user, true);
      navigate('/admin');
    } else {
      setError('Access denied. You do not have administrator privileges.');
      await auth.signOut();
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await handleAdminCheck(result.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await handleAdminCheck(result.user);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 space-y-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-bold tracking-tighter uppercase">ADMIN PORTAL</h1>
          <p className="text-gray-500 mt-2">Secure access for Peak Point administrators</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm font-medium border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5"
                placeholder="admin@peakpoint.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-900 transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
          >
            {loading ? 'AUTHENTICATING...' : 'SIGN IN'}
            <ArrowRight size={20} />
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
          <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold"><span className="bg-white px-4 text-gray-400">OR</span></div>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full border-2 border-gray-100 py-4 rounded-xl font-bold hover:border-black transition-all flex items-center justify-center space-x-3"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          <span>SIGN IN WITH GOOGLE</span>
        </button>

        <p className="text-center text-[10px] text-gray-400 uppercase tracking-widest">
          Authorized Personnel Only. All access is logged.
        </p>
      </div>
    </div>
  );
}
