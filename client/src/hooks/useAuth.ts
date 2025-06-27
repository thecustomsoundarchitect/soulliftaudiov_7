import { useState, useEffect } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  AuthError
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { initUserCredits } from '@/services/creditService';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Setting up auth state listener...');
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user ? `✅ User signed in: ${user.email}` : '❌ User is signed out');
      setUser(user);
      
      // Initialize user credits when they sign in
      if (user) {
        try {
          await initUserCredits();
          console.log('User credits initialized');
        } catch (error) {
          console.error('Failed to initialize user credits:', error);
        }
      }
      
      setLoading(false);
    }, (error) => {
      console.error('Auth state change error:', error);
      setLoading(false);
    });

    // Check for redirect result on app load
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          console.log('Google sign-in via redirect successful:', result.user.email);
        }
      } catch (error: any) {
        console.error('Redirect result error:', error);
      }
    };

    checkRedirectResult();

    return unsubscribe;
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    try {
      console.log('Attempting email sign-in for:', email);
      setLoading(true);
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('Email sign-in successful:', result.user.email);
      return result.user;
    } catch (error: any) {
      console.error('Email sign-in error:', error.code, error.message);
      
      // Provide user-friendly error messages
      let errorMessage = 'Failed to sign in. Please try again.';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      }
      
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      console.log('Attempting email sign-up for:', email);
      setLoading(true);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Email sign-up successful:', result.user.email);
      return result.user;
    } catch (error: any) {
      console.error('Email sign-up error:', error.code, error.message);
      
      // Provide user-friendly error messages
      let errorMessage = 'Failed to create account. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters long.';
      }
      
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async (useRedirect: boolean = false) => {
    try {
      console.log('Attempting Google sign-in...', useRedirect ? 'via redirect' : 'via popup');
      setLoading(true);
      
      if (useRedirect) {
        // Use redirect method as fallback
        await signInWithRedirect(auth, googleProvider);
        // Note: The redirect will reload the page, so we won't reach this point
        // The actual sign-in result will be handled by getRedirectResult in useEffect
        return null;
      } else {
        // Try popup method first
        const result = await signInWithPopup(auth, googleProvider);
        console.log('Google sign-in successful:', result.user.email);
        return result.user;
      }
    } catch (error: any) {
      console.error('Google sign-in error:', error.code, error.message);
      
      // If popup is blocked, automatically try redirect method
      if (error.code === 'auth/popup-blocked') {
        console.log('Popup blocked, trying redirect method...');
        return await signInWithGoogle(true);
      }
      
      // Provide user-friendly error messages
      let errorMessage = 'Failed to sign in with Google. Please try again.';
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in was cancelled. Please try again.';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Popup was blocked. Redirecting to Google sign-in...';
      }
      
      throw new Error(errorMessage);
    } finally {
      if (!useRedirect) {
        setLoading(false);
      }
    }
  };

  const logout = async () => {
    try {
      console.log('Signing out user...');
      await signOut(auth);
      console.log('User signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  return {
    user,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    logout
  };
}