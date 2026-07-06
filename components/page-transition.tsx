"use client"

import { AnimatePresence, motion } from "framer-motion"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { useEffect, useState } from "react"

export default function PageTransition({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)

    const timer = setTimeout(() => {
      setLoading(false)
    }, 600)

    return () => clearTimeout(timer)
  }, [pathname])

  return (
    <>
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-white"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{
                scale: [0.8, 1.05, 1],
                opacity: 1,
              }}
              transition={{
                duration: 0.5,
              }}
              className="flex flex-col items-center gap-6"
            >
              <Image
                src="/logo.png"
                alt="CONN-WRY"
                width={90}
                height={90}
                priority
              />

              <div className="h-10 w-10 rounded-full border-4 border-violet-600 border-t-transparent animate-spin" />

              <p className="font-semibold tracking-wide text-slate-700">
                Loading...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            y: -10,
          }}
          transition={{
            duration: 0.35,
          }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  )
}