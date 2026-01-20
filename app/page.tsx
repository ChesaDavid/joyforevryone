 'use client'

import React, { useEffect, useRef } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import grup from '@/assets/grup.png'
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}
import { useIsPhone } from './hook/useIsPhone'

export default function Home() {
  const router = useRouter()
  const isPhone = useIsPhone()
  const bgRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const root = bgRef.current
    if (!root) return

    const layers = Array.from(root.querySelectorAll<HTMLElement>('[data-depth]'))
    let rect = root.getBoundingClientRect()

    function onMove(e: MouseEvent) {
      if(root)
      rect = root.getBoundingClientRect()
      const x = (e.clientX - rect.left - rect.width / 2) / rect.width
      const y = (e.clientY - rect.top - rect.height / 2) / rect.height

      layers.forEach((el) => {
        const depth = parseFloat(el.dataset.depth || '0')
        const tx = (-x * depth * 40).toFixed(2)
        const ty = (-y * depth * 25).toFixed(2)
        const rz = (x * depth * 6).toFixed(2)
        el.style.transform = `translate3d(${tx}px, ${ty}px, 0) rotateY(${rz}deg)`
      })
    }

    function onLeave() {
      layers.forEach((el) => (el.style.transform = 'translate3d(0,0,0) rotateY(0deg)'))
    }

    root.addEventListener('mousemove', onMove)
    root.addEventListener('mouseleave', onLeave)

    return () => {
      root.removeEventListener('mousemove', onMove)
      root.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <div className="bg-gray-950 mt-10 font-sans min-h-screen p-8 sm:p-20 relative overflow-hidden">
      <div ref={bgRef} className="absolute inset-0 -z-10 background-3d">
        <div data-depth="0.18" className="pointer-events-none absolute top-20 left-10 w-40 h-40 rounded-full bg-purple-600 blur-3xl bg-layer" />
        <div data-depth="0.08" className="pointer-events-none absolute bottom-20 right-10 w-60 h-60 bg-cyan-600 blur-3xl bg-layer" />
        <div data-depth="0.12" className="pointer-events-none absolute top-40 right-1/3 w-52 h-52 bg-blue-500 blur-3xl bg-layer" />
        <div data-depth="0.04" className="pointer-events-none absolute left-1/2 top-1/3 w-96 h-96 -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-600 opacity-30 blur-2xl bg-layer animate-slowFloat" />
      </div>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <section className="text-white">
          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className={` font-extrabold mb-4 ${isPhone ? 'flex flex-col text-center min-h-screen justify-center items-center' : ''}`}
          >
            <h1 className='text-5xl sm:text-6xl '>
          Asociația JoyForEveryone
            </h1>
            
            {isPhone && <div className='text-12px flex flex-col items-center justify-center mt-2 mb-6  animate-bounce text-gray-400'>
              Scroll down
              <svg
            width="32"
            height="48"
            viewBox="0 0 32 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8 18 L16 26 L24 18"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <animateTransform
                attributeName="transform"
                type="translate"
                from="0 0"
                to="0 10"
                dur="1.2s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                from="1"
                to="0"
                dur="1.2s"
                repeatCount="indefinite"
              />
            </path>
          </svg>

            </div>}
            
            
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.15 } }}
            className="text-gray-300 max-w-xl leading-relaxed mb-6"
          >
            We are a non-profit organization dedicated to bringing joy and support to underprivileged communities through various projects and initiatives. Join us in making a difference!
          </motion.p>

          <div className={`flex gap-4 ${isPhone ? 'flex-col items-center' : ''}`}>
            <button
              onClick={() => router.push('https://docs.google.com/forms/d/e/1FAIpQLSeMaVUDNQAOB92F3NsOHChDdjzagBrTyBJTGmMJcu2eC52e1g/viewform?usp=header')}
              className="px-5 py-3 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-full text-white font-semibold shadow hover:scale-[1.02] transition transform"
            >
              Join the Team
            </button>

            <button
              onClick={() => router.push('/projects')}
              className="px-5 py-3 border border-gray-700 rounded-full text-gray-200 hover:text-white hover:border-white transition"
            >
              View Projects
            </button>
            
            <button
              onClick={() => router.push('/contact')}
              className="px-5 py-3 border border-gray-700 rounded-full text-gray-200 hover:text-white hover:border-white transition"
            >
              Contact Us
            </button>
          
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.25 } }}
            className="mt-8 text-sm text-gray-400"
          >
            <strong className="text-gray-200">Note:</strong> If you would like to support us through donations, please visit our <span className="underline cursor-pointer" onClick={() => router.push('/donations')}>Donations</span> page.
          </motion.div>
        </section>

        <section className="flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, transition: { duration: 0.6 } }}
            className="w-full max-w-md rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/5"
          >
            <Image
              src={grup}
              alt="JoyForEveryone team photo"
              width={1200}
              height={800}
              priority
              className="w-full h-auto object-cover"
            />
            <div className="bg-black/40 p-4 text-gray-200 text-sm">
              Echipa JoyForEveryone — voluntari dedicați comunității
            </div>
          </motion.div>
        </section>
        <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 left-10 w-40 h-40 rounded-full bg-purple-600 blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-60 h-60 bg-cyan-600 blur-3xl"></div>
      </div>
      </main>
    </div>
  )
}
