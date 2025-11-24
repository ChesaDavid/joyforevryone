'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

export default function Home() {
  const router = useRouter()

  return (
    <div className="bg-gray-950 font-sans min-h-screen p-8 sm:p-20 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 -z-10 pointer-events-none">
        <div className="absolute top-20 left-10 w-40 h-40 rounded-full bg-purple-600 blur-3xl" />
        <div className="absolute bottom-20 right-10 w-60 h-60 bg-cyan-600 blur-3xl" />
        <div className="absolute top-40 right-1/3 w-52 h-52 bg-blue-500 blur-3xl" />
      </div>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <section className="text-white">
          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="text-4xl sm:text-5xl font-extrabold mb-4"
          >
            Asociația JoyForEveryone
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.15 } }}
            className="text-gray-300 max-w-xl leading-relaxed mb-6"
          >
            We support communities and volunteers — organising events, drives and local
            projects. See upcoming actions, join the team and keep track of past
            participations.
          </motion.p>

          <div className="flex gap-4">
            <button
              onClick={() => router.push('/projects')}
              className="px-5 py-3 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-full text-white font-semibold shadow hover:scale-[1.02] transition transform"
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
            <strong className="text-gray-200">Note:</strong> Prezente are tracked automatically
            for past events. You can view detailed records in project pages.
          </motion.div>
        </section>

        <section className="flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, transition: { duration: 0.6 } }}
            className="w-full max-w-md rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/5"
          >
            <Image
              src="/groupPhoto.jpg"
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
      </main>
    </div>
  )
}
