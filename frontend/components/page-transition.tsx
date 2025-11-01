"use client"

import { motion } from "motion/react"

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 0.2,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  )
}
