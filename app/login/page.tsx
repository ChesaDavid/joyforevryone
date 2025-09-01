'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useCreateUserWithEmailAndPassword, useSignInWithGoogle } from 'react-firebase-hooks/auth'
import { auth } from '@/app/firebase/config'
import { upsertUser } from '@/app/firebase/userHelpers'
import {
  updateProfile,
  signInWithEmailAndPassword,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  User,
  UserCredential,
} from 'firebase/auth'
import { toast } from 'react-toastify'
import { FirebaseError } from 'firebase/app'

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier
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
  const [otp, setOtp] = useState('')
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null)
  const [error, setError] = useState('')

  const [createUserWithEmailAndPassword] = useCreateUserWithEmailAndPassword(auth)
  const [signInWithGoogle] = useSignInWithGoogle(auth)

  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        'recaptcha-container',
        {
          size: 'invisible',
          callback: () => console.log('reCAPTCHA solved'),
          'expired-callback': () => console.warn('reCAPTCHA expired'),
        }      )

      window.recaptchaVerifier.render().then(() => {
        console.log('reCAPTCHA rendered ✅')
      })
    }
  }, [])

  const handleToggle = () => {
    setIsSignUp(!isSignUp)
    setError('')
    setOtp('')
    setConfirmation(null)
  }

  // ✅ Send OTP
  const handleSendOTP = async (): Promise<void> => {
    if (!phone.startsWith('+')) {
      setError('Phone must be in international format, e.g. +1234567890')
      return
    }

    try {
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        phone,
        window.recaptchaVerifier!
      )
      setConfirmation(confirmationResult)
      toast.success('OTP sent ✅')
    } catch (err) {
      const error = err as FirebaseError
      console.error(error)
      setError(error.message || 'Failed to send OTP')
    }
  }

  // ✅ Verify OTP
  const handleVerifyOTP = async (): Promise<User | null> => {
    if (!confirmation || !otp) {
      setError('Enter the OTP sent to your phone')
      return null
    }
    try {
      const result: UserCredential = await confirmation.confirm(otp)
      toast.success('Phone verified ✅')
      return result.user
    } catch (err) {
      const error = err as FirebaseError
      console.error(error)
      setError('Invalid OTP')
      return null
    }
  }

  // ✅ Sign Up Flow
  const handleSignUp = async (): Promise<void> => {
    setError('')
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (!confirmation) {
      // Step 1: send OTP
      await handleSendOTP()
      return
    }

    if (!otp) {
      setError('Please enter the OTP sent to your phone')
      return
    }

    // Step 2: verify OTP
    const phoneUser = await handleVerifyOTP()
    if (!phoneUser) return

    try {
      const res = await createUserWithEmailAndPassword(email, password)
      if (res && res.user) {
        await updateProfile(res.user, { displayName: name })

        await upsertUser({
          uid: res.user.uid,
          email: res.user.email,
          displayName: name || '',
          phone: phone || '',
        })

        console.log('Send WhatsApp group link to', phone)
        toast.success('Account created 🎉')
        router.push('/')
      }
    } catch (err) {
      const error = err as FirebaseError
      console.error(error)
      setError(error.message || 'Failed to create account')
    }
  }

  // ✅ Sign In Flow
  const handleSignIn = async (): Promise<void> => {
    try {
      const res = await signInWithEmailAndPassword(auth, email, password)
      if (res && res.user) {
        await upsertUser({
          uid: res.user.uid,
          email: res.user.email,
          displayName: res.user.displayName || '',
          phone: res.user.phoneNumber || '',
        })
      }
      toast.success('Signed in ✅')
      router.push('/')
    } catch (err) {
      const error = err as FirebaseError
      console.error(error)
      setError(error.message || 'Error signing in')
    }
  }

  // ✅ Google Sign-In
  const handleGoogleSignIn = async (): Promise<void> => {
    try {
      const res = await signInWithGoogle()
      if (res && res.user) {
        await upsertUser({
          uid: res.user.uid,
          email: res.user.email,
          displayName: res.user.displayName || '',
          phone: res.user.phoneNumber || '',
        })
      }
      toast.success('Signed in with Google ✅')
      router.push('/')
    } catch (err) {
      const error = err as FirebaseError
      console.error(error)
      setError(error.message || 'Error signing in with Google')
    }
  }

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    if(isSignUp){
      handleSignUp();
    }else{
      handleSignIn();
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-950 relative">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 left-10 w-40 h-40 rounded-full bg-purple-600 blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-60 h-60 bg-cyan-600 blur-3xl"></div>
      </div>

      <div className="w-full mt-14 max-w-md p-8 bg-gradient-to-br from-gray-920 to-gray-800 text-white overflow-hidden">
        <h2 className="text-3xl font-bold text-center text-gray-700 mb-8">
          {isSignUp ? 'Create an Account' : 'Sign In'}
        </h2>
        <div id="recaptcha-container"></div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <>
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md"
                required
              />
              <input
                type="tel"
                placeholder="+1234567890"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md"
                required
              />
            </>
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md"
            required
          />

          {isSignUp && (
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md"
              required
            />
          )}

          {isSignUp && confirmation && (
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={e => setOtp(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md"
              required
            />
          )}
          
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition"
          >
            {isSignUp ? (confirmation ? 'Verify OTP & Sign Up' : 'Send OTP & Sign Up') : 'Sign In'}
          </button>
        </form>

        <div className="text-center my-6">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-gray-300 rounded-md shadow"
          >
            <span className="font-semibold text-gray-700">Sign In with Google</span>
          </button>
        </div>

        <div className="text-center text-sm text-gray-600">
          {isSignUp ? (
            <>Already have an account?{' '}
              <span className="text-blue-500 cursor-pointer font-semibold" onClick={handleToggle}>Sign In</span>
            </>
          ) : (
          <>Don&apos;t have an account?{' '}
              <span className="text-blue-500 cursor-pointer font-semibold" onClick={handleToggle}>Sign Up</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default AuthPage
