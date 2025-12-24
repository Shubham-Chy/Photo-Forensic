
import React, { useState, useEffect } from 'react';
import { View, User } from './types';
import Layout from './components/Layout';
import LoadingScreen from './components/LoadingScreen';
import Hero from './components/Hero';
import IconConverter from './components/IconConverter';
import ImageGenerator from './components/ImageGenerator';
import ImageEditor from './components/ImageEditor';
import ImageAnalyzer from './components/ImageAnalyzer';
import Archive from './components/Archive';
import CustomCursor from './components/CustomCursor';
import ForensicAssistant from './components/ForensicAssistant';
import AuthPage from './components/AuthPage';
import { getCookie, setCookie, eraseCookie } from './utils/cookies';

const SESSION_KEY = 'forensic_session_v1';
const COOKIE_NAME = 'FORENSIC_AUTH';

export const AuthContext = React.createContext<{ 
  user: User | null; 
  updateUser: (data: Partial<User>) => void;
  logout: () => void;
}>({
  user: null,
  updateUser: () => {},
  logout: () => {},
});

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<View>(View.HOME);

  useEffect(() => {
    // Priority 1: Check Cookies
    const cookieUser = getCookie(COOKIE_NAME);
    if (cookieUser) {
      try {
        setUser(JSON.parse(cookieUser));
      } catch (e) {
        console.error("Cookie corruption detected.");
      }
    } else {
      // Priority 2: Check LocalStorage Fallback
      const savedSession = localStorage.getItem(SESSION_KEY);
      if (savedSession) {
        const parsedUser = JSON.parse(savedSession);
        setUser(parsedUser);
        // Sync cookie for future loads
        setCookie(COOKIE_NAME, savedSession);
      }
    }
    
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    const userStr = JSON.stringify(newUser);
    localStorage.setItem(SESSION_KEY, userStr);
    setCookie(COOKIE_NAME, userStr);
  };

  const updateUser = (data: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    const userStr = JSON.stringify(updated);
    setUser(updated);
    localStorage.setItem(SESSION_KEY, userStr);
    setCookie(COOKIE_NAME, userStr);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
    eraseCookie(COOKIE_NAME);
    setView(View.HOME);
  };

  if (loading) return <LoadingScreen />;

  return (
    <>
      <CustomCursor />
      {!user ? (
        <AuthPage onLogin={handleLogin} />
      ) : (
        <AuthContext.Provider value={{ user, updateUser, logout: handleLogout }}>
          <Layout currentView={view} setView={setView}>
            {view === View.HOME && <Hero onStart={setView} />}
            {view === View.CONVERT && <IconConverter />}
            {view === View.GENERATE && <ImageGenerator />}
            {view === View.EDIT && <ImageEditor />}
            {view === View.ANALYZE && <ImageAnalyzer />}
            {view === View.ARCHIVE && <Archive setView={setView} />}
            {view === View.ASSISTANT && <ForensicAssistant />}
          </Layout>
        </AuthContext.Provider>
      )}
    </>
  );
};

export default App;
