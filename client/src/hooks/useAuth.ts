import { createContext, useContext, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut as firebaseSignOut, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { app } from '../lib/firebase'; // Ensure 'app' is imported correctly based on your firebase.ts location
// import AuthModal from '@/components/auth/AuthModal'; // Temporarily comment out AuthModal import

// Minimal AuthContextType for testing
interface AuthContextType {
  user: any;
  loading: boolean;
  // Temporarily remove specific auth functions for initial compile test
  signInWithEmail: (email: string, password: string) => Promise<any>;
  signUpWithEmail: (email: string, password: string) => Promise<any>;
  signInWithGoogle: () => Promise<any>;
  signOut: () => Promise<void>;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Temporarily stub out auth functions for initial compile test
  const auth = getAuth(app);
  const signInWithEmail = async (email: string, password: string) => { console.log('Dummy signInWithEmail'); return Promise.resolve(null); };
  const signUpWithEmail = async (email: string, password: string) => { console.log('Dummy signUpWithEmail'); return Promise.resolve(null); };
  const signInWithGoogle = async () => { console.log('Dummy signInWithGoogle'); return Promise.resolve(null); };
  const signOut = async () => { console.log('Dummy signOut'); return Promise.resolve(); };
  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  useEffect(() => {
    // Minimal listener for testing
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [auth]);

  const value: AuthContextType = {
    user,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut,
    isAuthModalOpen,
    openAuthModal,
    closeAuthModal,
  };

  // SIMPLIFIED RETURN FOR COMPILATION TEST
  return (
    <div> {/* Use a simple div instead of AuthContext.Provider for initial test */}
      {children}
      {/* Temporarily remove AuthModal rendering for initial compile test */}
      {/* <AuthModal open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} /> */}
      <p>Auth Provider Test</p>
    </div>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};