'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut ,sendPasswordResetEmail} from 'firebase/auth';
import { auth } from '@/app/firebase/config';
//TODO: Password reset
import {isCoordonator} from "@/app/firebase/userHelpers";
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [rank, setRank] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        if (isCoordonator(user.email)) setRank("Coordonator");
        else setRank("Volunteer");
      } else {
        setRank(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const signIn = () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };

  const logOut = () => {
    return signOut(auth);
  };
  
  return (
    <AuthContext.Provider value={{ user, rank, signIn, logOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}