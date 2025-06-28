import { useState, useEffect, createContext, useContext } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'; // Ensure all necessary Firebase auth functions are imported
import { getAuth } from 'firebase/auth';
import { app } from '../lib/firebase'; // Ensure 'app' is imported correctly based on your firebase.ts location
import AuthModal from '@/components/auth/AuthModal'; // Ensure AuthModal is imported

// Define a proper type for AuthContext value for better type safety
interface AuthContextType {
  user: any; // You can refine this type later (e.g., firebase.User | null)
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<any>;
  signUpWithEmail: (email: string, password: string) => Promise<any>;
  signInWithGoogle: () => Promise<any>;
  signOut: () => Promise<void>;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined); // Use undefined for initial value

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null); // Refine type here too
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false); // State for modal visibility

  const auth = getAuth(app); // Get auth instance using your imported 'app'

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        // If a user signs in, close the modal
        setIsAuthModalOpen(false);
      }
    });
    return () => unsubscribe(); // Cleanup subscription
  }, [auth]);

  // Firebase Auth functions (ensure these are correctly implemented and called)
  const signInWithEmail = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error("Sign-in with email failed:", error);
      throw error; // Re-throw to be caught by AuthModal's handler
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error("Sign-up with email failed:", error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (error: any) {
      console.error("Sign-in with Google failed:", error);
      // Special handling for popup blocked error or redirect
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        // User closed popup, no need to show error toast directly unless severe
      } else if (error.message.includes('auth/redirect-cancelled') || error.message.includes('auth/operation-not-supported-in-this-environment')) {
         // This might happen in certain environments or if redirect is implicitly used
         console.warn('Google sign-in might be attempting redirect. Ensure proper redirect URI settings.');
         throw new Error("Redirecting to Google for sign-in. Please wait."); // Informative message for toast
      } else {
        throw error; // Re-throw general errors
      }
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      // Optional: clear any local session data if necessary
    } catch (error) {
      console.error("Sign-out failed:", error);
      throw error;
    }
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const value: AuthContextType = { // Explicitly type the 'value' object
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

  // The rendering of the AuthProvider and AuthModal
  return (
    <AuthContext.Provider value={value}> {/* THIS IS THE LINE THAT WAS LIKELY CAUSING THE ERROR */}
      {children}
      {/* AuthModal is now rendered by the AuthProvider, so it's globally available */}
      <AuthModal open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} />
    </AuthContext.Provider>
  );
};

// Custom hook to use the authentication context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};