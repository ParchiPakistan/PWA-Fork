"use client"

import { useState, useEffect, useRef } from "react"
import { motion, useAnimationControls, AnimatePresence } from "framer-motion"
import Image from "next/image"

/**
 * Realistic Paper Tear Intro v8.0 — High-Tier
 *
 * Enhancements over original:
 * 1. Tear PROPAGATES top→bottom over 0.25s before the split
 * 2. Dense jagged path (40+ points) with micro-serrations inside macro-jags
 * 3. SVG fiber strands that stretch across the gap then snap
 * 4. Multi-layer torn edge: white fibrous face + warm exposed interior + deep shadow
 * 5. Pre-tear paper stress: subtle bulge/warp on the sheet before it breaks
 * 6. Each half has a slight perspective warp (skewY) as it peels away from centre
 * 7. Ambient dust/particle flash at the moment of tear
 */

// ---------- torn edge path generation ----------
// 40-point path with macro waves + micro serrations
function buildTearPath(): string[] {
  const pts: string[] = []
  const steps = 40
  for (let i = 0; i <= steps; i++) {
    const y = (i / steps) * 100
    // macro wave
    const macro = Math.sin(i * 0.55 + 1.2) * 2.8
    // micro serration — alternating spike
    const micro = (i % 2 === 0 ? 1 : -1) * (0.6 + Math.abs(Math.sin(i * 1.7)) * 1.1)
    // stress cluster — extra chaos in the middle 30–70% zone
    const stress = (y > 30 && y < 70) ? Math.sin(i * 2.3) * 1.4 : 0
    const x = 50 + macro + micro + stress
    pts.push(`${x.toFixed(2)}% ${y.toFixed(2)}%`)
  }
  return pts
}

const TEAR_PTS = buildTearPath()
const TEAR_PATH = TEAR_PTS.join(", ")
const LEFT_CLIP = `polygon(0% 0%, ${TEAR_PATH}, 0% 100%)`
const RIGHT_CLIP = `polygon(100% 0%, ${TEAR_PATH}, 100% 100%)`

// Fiber strand data — random-ish positions along the tear
const FIBER_COUNT = 14
const fibers = Array.from({ length: FIBER_COUNT }, (_, i) => {
  const y = 4 + (i / (FIBER_COUNT - 1)) * 92            // spread top→bottom
  const idx = Math.round((y / 100) * TEAR_PTS.length)
  const xStr = parseFloat(TEAR_PTS[Math.min(idx, TEAR_PTS.length - 1)])
  const xEnd = xStr + 0.5 + Math.random() * 1.5            // slight rightward lean
  const len = 0.8 + Math.random() * 1.6                   // strand width
  const opacity = 0.5 + Math.random() * 0.4
  const delay = 0.02 + Math.random() * 0.06
  return { y, xStr, xEnd, len, opacity, delay }
})

// ---------- component ----------
export function AnimatedIntro() {
  const [isVisible, setIsVisible] = useState(true)
  const [tearProgress, setTearProgress] = useState(0)   // 0–1 as tear travels down
  const [isRipped, setIsRipped] = useState(false)
  const [showFibers, setShowFibers] = useState(false)
  const [fibersSnap, setFibersSnap] = useState(false)

  const leftControls = useAnimationControls()
  const rightControls = useAnimationControls()
  const logoControls = useAnimationControls()
  const sheetControls = useAnimationControls()

  // Propagating tear clip — only reveals the jagged path down to `tearProgress`
  const progressLeft = tearProgress < 1
    ? `polygon(0% 0%, 50% 0%, 50% ${(tearProgress * 100).toFixed(1)}%, 0% ${(tearProgress * 100).toFixed(1)}%)`
    : LEFT_CLIP
  const progressRight = tearProgress < 1
    ? `polygon(100% 0%, 50% 0%, 50% ${(tearProgress * 100).toFixed(1)}%, 100% ${(tearProgress * 100).toFixed(1)}%)`
    : RIGHT_CLIP

  useEffect(() => {
    async function run() {
      // ── 1. Logo hold (1.0s) ─────────────────────────────────────────────
      await new Promise(r => setTimeout(r, 1000))

      // ── 2. Pre-tear stress — sheet bulges slightly (0.15s) ──────────────
      sheetControls.start({
        scaleX: [1, 1.008, 0.996, 1],
        scaleY: [1, 0.997, 1.005, 1],
        transition: { duration: 0.15, ease: "easeInOut" }
      })

      await new Promise(r => setTimeout(r, 150))

      // ── 3. Tear propagates top→bottom (0.22s) ───────────────────────────
      const propagateDuration = 220
      const start = performance.now()

      await new Promise<void>(resolve => {
        function tick(now: number) {
          const t = Math.min((now - start) / propagateDuration, 1)
          // ease-in: tear accelerates as it goes (paper snaps faster as it propagates)
          const eased = t * t * (3 - 2 * t)
          setTearProgress(eased)
          if (t < 1) requestAnimationFrame(tick)
          else resolve()
        }
        requestAnimationFrame(tick)
      })

      // ── 4. Full tear snaps — fibers appear ─────────────────────────────
      setIsRipped(true)
      setShowFibers(true)

      // Flash logo out
      logoControls.start({
        opacity: [1, 0],
        scale: [1, 1.18],
        transition: { duration: 0.18, ease: "easeOut" }
      })

      // Short pause — fibers are taut
      await new Promise(r => setTimeout(r, 80))
      setFibersSnap(true)   // fibers snap/fade

      // ── 5. Halves explode apart (0.55s) ─────────────────────────────────
      const ease: any = [0.20, 1, 0.35, 1]

      leftControls.start({
        x: [0, -55, -170, "-145%"],
        y: [0, -20, -65, -120],
        rotate: [0, -10, -20, -38],
        skewY: [0, -4, -7, 0],
        scaleX: [1, 1.04, 0.96, 0.88],
        transition: { duration: 0.55, times: [0, 0.18, 0.5, 1], ease }
      })

      rightControls.start({
        x: [0, 55, 170, "145%"],
        y: [0, 28, 85, 155],
        rotate: [0, 14, 26, 46],
        skewY: [0, 4, 7, 0],
        scaleX: [1, 1.04, 0.96, 0.88],
        transition: { duration: 0.55, times: [0, 0.18, 0.5, 1], ease }
      })

      await new Promise(r => setTimeout(r, 800))
      setIsVisible(false)
    }

    run()
  }, [leftControls, rightControls, logoControls, sheetControls])

  // Thin line showing where the tear is actively propagating
  const crackY = `${(tearProgress * 100).toFixed(1)}%`

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[9999] overflow-hidden pointer-events-none bg-transparent">

          {/* ── Solid backing — visible only before tear ────────────────── */}
          {!isRipped && (
            <motion.div
              className="absolute inset-0 bg-[#0051FF] z-0"
              animate={sheetControls}
              style={{ transformOrigin: "50% 50%" }}
            >
              <div className="absolute inset-0 opacity-[0.10] mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
            </motion.div>
          )}

          {/* ── Propagating crack line ───────────────────────────────────── */}
          {!isRipped && tearProgress > 0 && tearProgress < 1 && (
            <div
              className="absolute z-[15] pointer-events-none"
              style={{
                top: crackY,
                left: "48%",
                width: "4%",
                height: "2px",
                background: "rgba(255,255,255,0.9)",
                filter: "blur(0.5px)",
                boxShadow: "0 0 6px 2px rgba(255,255,255,0.5)",
                transform: "translateY(-1px)",
              }}
            />
          )}

          {/* ── LEFT HALF ───────────────────────────────────────────────── */}
          <motion.div
            initial={{ x: 0, y: 0, rotate: 0, skewY: 0, scaleX: 1 }}
            animate={leftControls}
            style={{
              position: "absolute",
              inset: 0,
              clipPath: isRipped ? LEFT_CLIP : progressLeft,
              transformOrigin: "30% 50%",
              zIndex: 10,
            }}
          >
            {/* Blue face */}
            <div className="absolute inset-0 bg-[#0051FF]">
              <div className="absolute inset-0 opacity-[0.10] mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
              {/* Peel shadow — darkens near the tear edge as it peels */}
              {isRipped && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: "linear-gradient(to left, rgba(0,0,30,0.30) 0%, transparent 12%)",
                  }}
                />
              )}
            </div>

            {/* Torn edge layers — right side of left piece */}
            {/* 1. Exposed paper interior — warm cream colour */}
            <div
              className="absolute inset-0"
              style={{
                clipPath: LEFT_CLIP,
                background: "#e8dfc8",
                zIndex: -3,
                transform: "translateX(5px)",
              }}
            />
            {/* 2. White fibrous surface */}
            <div
              className="absolute inset-0 bg-white"
              style={{
                clipPath: LEFT_CLIP,
                zIndex: -2,
                transform: "translateX(2.5px)",
              }}
            />
            {/* 3. Cast shadow from right piece */}
            <div
              className="absolute inset-0 bg-black/50"
              style={{
                clipPath: LEFT_CLIP,
                zIndex: -4,
                filter: "blur(7px)",
                transform: "translateX(9px)",
              }}
            />
          </motion.div>

          {/* ── RIGHT HALF ──────────────────────────────────────────────── */}
          <motion.div
            initial={{ x: 0, y: 0, rotate: 0, skewY: 0, scaleX: 1 }}
            animate={rightControls}
            style={{
              position: "absolute",
              inset: 0,
              clipPath: isRipped ? RIGHT_CLIP : progressRight,
              transformOrigin: "70% 50%",
              zIndex: 10,
            }}
          >
            <div className="absolute inset-0 bg-[#0051FF]">
              <div className="absolute inset-0 opacity-[0.10] mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
              {isRipped && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: "linear-gradient(to right, rgba(0,0,30,0.30) 0%, transparent 12%)",
                  }}
                />
              )}
            </div>

            {/* Torn edge — left side of right piece */}
            <div
              className="absolute inset-0"
              style={{
                clipPath: RIGHT_CLIP,
                background: "#e8dfc8",
                zIndex: -3,
                transform: "translateX(-5px)",
              }}
            />
            <div
              className="absolute inset-0 bg-white"
              style={{
                clipPath: RIGHT_CLIP,
                zIndex: -2,
                transform: "translateX(-2.5px)",
              }}
            />
            <div
              className="absolute inset-0 bg-black/50"
              style={{
                clipPath: RIGHT_CLIP,
                zIndex: -4,
                filter: "blur(7px)",
                transform: "translateX(-9px)",
              }}
            />
          </motion.div>

          {/* ── SVG Fiber strands ────────────────────────────────────────── */}
          {showFibers && (
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ zIndex: 25 }}
              xmlns="http://www.w3.org/2000/svg"
            >
              {fibers.map((f, i) => (
                <motion.line
                  key={i}
                  x1={`${f.xStr - f.len / 2}%`}
                  y1={`${f.y}%`}
                  x2={`${f.xEnd + f.len / 2}%`}
                  y2={`${f.y + 0.15}%`}
                  stroke="white"
                  strokeWidth={0.6 + Math.random() * 0.8}
                  strokeLinecap="round"
                  initial={{ opacity: f.opacity, scaleX: 1 }}
                  animate={fibersSnap ? {
                    opacity: [f.opacity, f.opacity * 0.8, 0],
                    scaleX: [1, 1.4, 0],
                    y: [0, (i % 2 === 0 ? -3 : 3)],
                  } : {}}
                  transition={{
                    duration: 0.18,
                    delay: f.delay,
                    ease: "easeOut",
                  }}
                  style={{ transformOrigin: `${f.xStr}% ${f.y}%` }}
                />
              ))}
            </svg>
          )}

          {/* ── Tear flash — white burst at snap moment ──────────────────── */}
          {isRipped && (
            <motion.div
              initial={{ opacity: 0.25 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="absolute inset-0 bg-white pointer-events-none"
              style={{ zIndex: 24 }}
            />
          )}

          {/* ── Logo ─────────────────────────────────────────────────────── */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-[20]">
            <motion.div
              initial={{ opacity: 1, scale: 1 }}
              animate={logoControls}
              className="flex flex-col items-center"
            >
              <Image
                src="/ParchiFullTextNewBlue.svg"
                alt="Parchi Logo"
                width={320}
                height={140}
                className="brightness-0 invert drop-shadow-[0_30px_60px_rgba(0,0,0,0.45)]"
                priority
              />
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 0.9, ease: "easeOut" }}
                className="h-[4px] bg-white/70 mt-12 rounded-full shadow-2xl"
              />
              <p className="text-white font-medium tracking-[0.45em] mt-10 text-[11px] uppercase opacity-90 drop-shadow-lg">
                Fintech for Pakistan&apos;s Students
              </p>
            </motion.div>
          </div>

          <div className="absolute inset-0 pointer-events-none opacity-[0.08] mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/p6-dark.png')] z-[30]" />
        </div>
      )}
    </AnimatePresence>
  )
}