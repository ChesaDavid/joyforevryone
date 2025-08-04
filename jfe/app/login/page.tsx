'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useCreateUserWithEmailAndPassword, useSignInWithGoogle } from 'react-firebase-hooks/auth'
import { auth } from '@/app/firebase/config'
import { upsertUser } from '@/app/firebase/userHelpers'
import { updateProfile, signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { toast } from 'react-toastify';

const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState<boolean>(false)
  const [email, setEmail] = useState<string>('')
  const [name,setName] = useState<string>('');
  const [password, setPassword] = useState<string>('')
  const [confirmPassword, setConfirmPassword] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [createUserWithEmailAndPassword] = useCreateUserWithEmailAndPassword(auth)
  const [signInWithGoogle] = useSignInWithGoogle(auth)
  const router = useRouter()

  const handleToggle = () => {
    setIsSignUp(!isSignUp)
    setError('')
    setConfirmPassword('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (isSignUp) {
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      try {
        const res = await createUserWithEmailAndPassword(email, password);
        if (res && res.user) {
          await updateProfile(res.user, { displayName: name });
          await res.user.reload();
          await upsertUser({
            uid: res.user.uid,
            email: res.user.email,
            displayName: name || "",
          });
        }
        setEmail('');
        setPassword('');
        setName('');
        setConfirmPassword('');
        toast('Congrats you are in');
        router.push('/');
      } catch (err: any) {
        setError(err.message || 'Error creating user.');
      }
    } else {
      try {
        const res = await signInWithEmailAndPassword(auth, email, password);
        if (res && res.user) {
          await upsertUser({
            uid: res.user.uid,
            email: res.user.email,
            displayName: res.user.displayName || res.user.email || "",
          });
        }
        router.push('/');
        toast.success('Successfully Logged in');
      } catch (err: any) {
        setError(err.message || 'Error signing in.')
      }
    }
  }

  const handleGoogleSignIn = async () => {
    setError('')
    try {
      const res = await signInWithGoogle()
      if (res && res.user) {
        await upsertUser({
          uid: res.user.uid,
          email: res.user.email,
          displayName: res.user.displayName || res.user.email || "",
        });
      }
      router.push('/') 
      toast.success('Successfully Loged in')
    } catch (err: any) {
      setError(err.message || 'Error signing in with Google.')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-950 relative">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 left-10 w-40 h-40 rounded-full bg-purple-600 blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-60 h-60 bg-cyan-600 blur-3xl"></div>
      </div>
      <div className="w-full max-w-md p-8 bg-gradient-to-br from-gray-920 to-gray-800 text-white overflow-hidden">
        <h2 className="text-3xl font-bold text-center text-gray-700 mb-8">
          {isSignUp ? 'Create an Account' : 'Sign In'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4 ">
          <div>
            {
              isSignUp && (
                <div>
                  <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                    Full Name
                  </label>
                  <input
                    type='text'
                    id='name'
                    autoComplete='name'
                    placeholder='Enter your full name'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                  )
            }
            <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              autoComplete="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              autoComplete={isSignUp ? "new-password" : "current-password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          {isSignUp && (
            <div>
              <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                autoComplete="new-password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          )}
          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>
        <div className="text-center my-6">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-gray-300 rounded-md shadow hover:bg-gray-100 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <svg width="24" height="24" viewBox="0 0 48 48" className="mr-2">
              <path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.9 33.7 30.2 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 6 .9 8.3 2.7l6.3-6.3C34.6 4.9 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 19.5-7.6 21-17.5l-0.5-7.5z"/>
              <path fill="#34A853" d="M6.3 14.7l7 5.1C15.6 16.1 19.5 13 24 13c3.1 0 6 .9 8.3 2.7l6.3-6.3C34.6 4.9 29.6 3 24 3c-7.2 0-13 5.8-13 13 0 2.3.6 4.5 1.7 6.4z"/>
              <path fill="#FBBC05" d="M24 44c5.6 0 10.6-1.9 14.5-5.1l-7-5.7C29.7 35.1 27 36 24 36c-6.2 0-11.4-4.2-13.2-10.1l-7 5.4C7.7 41.1 15.3 44 24 44z"/>
              <path fill="#EA4335" d="M44.5 20H24v8.5h11.7C34.9 33.7 30.2 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 6 .9 8.3 2.7l6.3-6.3C34.6 4.9 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 19.5-7.6 21-17.5l-0.5-7.5z"/>
            </svg>
            <span className="font-semibold text-gray-700">Sign In with Google</span>
          </button>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">
            {isSignUp ? (
              <>
                Already have an account?{' '}
                <span
                  className="text-blue-500 cursor-pointer font-semibold"
                  onClick={handleToggle}
                  tabIndex={0}
                  role="button"
                >
                  Sign In
                </span>
              </>
            ) : (
              <main className="flex flex-col items-center" >
              <span className="text-sm text-gray-600">
                Don't have an account?{' '}
                <span
                  className="text-blue-500 cursor-pointer font-semibold"
                  onClick={handleToggle}
                  tabIndex={0}
                  role="button"
                >
                  Sign Up 
                </span>
              </span>
                
                <span id='reset'  className="text-blue-500 cursor-pointer font-semibold mt-2" onClick={() => {
                  router.push('/reset-password') 
                }}>
                  Forgot your password?
                </span>
              </main>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
export default AuthPage;