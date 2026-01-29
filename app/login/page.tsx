'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useCreateUserWithEmailAndPassword } from 'react-firebase-hooks/auth'
import { auth } from '@/app/firebase/config'
import { upsertUser } from '@/app/firebase/userHelpers'
import {
  updateProfile,
  signInWithEmailAndPassword,
} from 'firebase/auth'
import { toast } from 'react-toastify'
import { FirebaseError } from 'firebase/app'

// Map Firebase errors to friendly messages
const friendlyError = (error: FirebaseError): string => {
  switch (error.code) {
    case 'auth/email-already-in-use':
      return 'Email already in use. Try signing in instead.'
    case 'auth/invalid-email':
      return 'Invalid email address.'
    case 'auth/weak-password':
      return 'Password is too weak. Use at least 6 characters.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.'
    case 'auth/user-not-found':
      return 'No account found with this email.'
    case 'auth/wrong-password':
      return 'Incorrect password.'
    default:
      return error.message || 'Something went wrong.'
  }
}

const AuthPage = () => {
  const router = useRouter()

  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')

  const [createUserWithEmailAndPassword] = useCreateUserWithEmailAndPassword(auth)
  


  // ✅ Sign Up Flow
  const handleSignUp = async (): Promise<void> => {
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(email, password);
      if (!userCredential || !userCredential.user) return;

      // update displayName
      await updateProfile(userCredential.user, { displayName: name });

      // save user in Firestore (with phone) — safe call, errors handled so we still redirect
      try {
        await upsertUser({
          uid: userCredential.user.uid,
          email: userCredential.user.email || email,
          displayName: name,
          phone: phone && phone.trim() !== '' ? phone.trim() : undefined,
        });
      } catch (e) {
        console.error("SignUp: upsertUser failed", e);
      }

      toast.success('Account created 🎉');
      router.push('/');
    } catch (err) {
      const fbErr = err as FirebaseError;
      console.error(fbErr);
      setError(friendlyError(fbErr));
    }
  }

  // ✅ Sign In Flow
  const handleSignIn = async (): Promise<void> => {
    setError('');
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      if (res && res.user) {
        try {
          await upsertUser({
            uid: res.user.uid,
            email: res.user.email || '',
            displayName: res.user.displayName || '',
            phone: (res.user.phoneNumber && res.user.phoneNumber.trim() !== '') ? res.user.phoneNumber : undefined
          });
        } catch (e) {
          console.error("SignIn: upsertUser failed", e);
        }
      }
      toast.success('Signed in ✅');
      router.push('/');
    } catch (err) {
      const fbErr = err as FirebaseError;
      console.error(fbErr);
      setError(friendlyError(fbErr));
    }
  }

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    if (isSignUp) {
      handleSignUp()
    } else {
      handleSignIn()
    }
  }
  const handlePhone = (phone: string): boolean => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/ // E.164 format
    const size = phone.length
    if (size < 12 || size > 15) return false
    return phoneRegex.test(phone)
  }

  const canSubmit = isSignUp  
    ? email && password && confirmPassword && name && phone && handlePhone(phone)
    : email && password

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-950 relative">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 left-10 w-40 h-40 rounded-full bg-purple-600 blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-60 h-60 bg-cyan-600 blur-3xl"></div>
      </div>

      <div className="w-full mt-14 max-w-md p-8 bg-gradient-to-br from-gray-920 to-gray-800 text-white overflow-hidden rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold text-center text-gray-200 mb-8">
          {isSignUp ? 'Create an Account' : 'Sign In'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <>
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md text-white"
                required
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md text-white"
                required
              />
            </>
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md text-white"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md text-white"
            required
          />

          {isSignUp && (
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md text-white"
              required
            />
          )}

          {error && <div className="text-red-500 text-sm text-center">{error}</div>}

          <button
            type="submit"
            disabled={!canSubmit as unknown as boolean}
            className="w-full py-3 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <div className="text-center text-sm text-gray-400 mt-10">
          {/* {isSignUp ? (
            <>Already have an account?{' '}
              <span className="text-blue-400 cursor-pointer font-semibold" onClick={handleToggle}>Sign In</span>
            </>
          ) : (
            <>Don&apos;t have an account?{' '}
              <span className="text-blue-400 cursor-pointer font-semibold" onClick={handleToggle}>Sign Up</span>
            </>
          )} */}
        </div>
      </div>
    </div>
  )
}

export default AuthPage
