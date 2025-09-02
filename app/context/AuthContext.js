'use client';

import { createContext, useContext, useEffect, useState,useRef } from 'react';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '@/app/firebase/config';
import { setWhatsappFalse } from "@/app/firebase/userHelpers"; 
//TODO: Password reset
import {isCoordonator} from "@/app/firebase/userHelpers";
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [rank, setRank] = useState(null);
  const [whatsappInvite, setWhatsappInvite] = useState(false);

   useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        if (isCoordonator(user.email)) setRank("Coordonator");
        else setRank("Volunteer");

        import("@/app/firebase/config").then(async ({ colRef }) => {
          const { getDoc, doc } = await import("firebase/firestore");
          const snapshot = await getDoc(doc(colRef, user.uid));
          if (snapshot.exists()) {
            setWhatsappInvite(snapshot.data().whatsappInvite ?? false);
          }
        });
      } else {
        setRank(null);
        setWhatsappInvite(false);
      }
    });
    return () => unsubscribe();
  }, []);
  const joinWhatsapp = async () => {
    if (!user) return;
    try {
      await setWhatsappFalse(user.uid); // update Firestore
      setWhatsappInvite(false); // update local state
      window.open("https://chat.whatsapp.com/Co8j7OboUFh6hHcSisIIVJ", "_blank");
    } catch (error) {
      console.error("Failed to join WhatsApp:", error);
    }
  };

  const signIn = () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };

  const logOut = () => {
    return signOut(auth);
  };
  const setFalse = ()=>{
    whatsapp.current = false;
  }
  const current = ()=>{
    return whatsapp.current;
  }
  return (
    <AuthContext.Provider value={{ user, rank, signIn, logOut, current, setFalse, whatsappInvite, joinWhatsapp }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}