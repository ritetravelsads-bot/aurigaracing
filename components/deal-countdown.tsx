"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Clock, Flame } from "lucide-react"

function getEndOfDay() {
  const now = new Date()
  const end = new Date(now)
  end.setHours(23, 59, 59, 999)
  return end
}

function getTimeRemaining(endTime: Date) {
  const total = endTime.getTime() - new Date().getTime()
  if (total <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  const seconds = Math.floor((total / 1000) % 60)
  const minutes = Math.floor((total / 1000 / 60) % 60)
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24)
  const days = Math.floor(total / (1000 * 60 * 60 * 24))
  return { days, hours, minutes, seconds }
}

interface TimeBlockProps {
  value: number
  label: string
  isUrgent?: boolean
}

function TimeBlock({ value, label, isUrgent }: TimeBlockProps) {
  return (
    <div className="flex flex-col items-center">
      <div className={cn(
        "relative w-16 h-16 md:w-20 md:h-20 rounded-lg flex items-center justify-center overflow-hidden",
        "bg-black shadow-lg",
        isUrgent && "animate-pulse-glow"
      )}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(189, 145, 49, 0.5) 1px, transparent 0)`,
          backgroundSize: '8px 8px'
        }} />
        
        {/* Value */}
        <span className={cn(
          "text-2xl md:text-3xl font-bold tabular-nums relative z-10",
          isUrgent ? "text-[#bd9131]" : "text-white"
        )}>
          {String(value).padStart(2, '0')}
        </span>
        
        {/* Shine Effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
      </div>
      <span className="text-xs md:text-sm text-muted-foreground mt-2 font-medium uppercase tracking-wider">
        {label}
      </span>
    </div>
  )
}

function Separator() {
  return (
    <div className="flex flex-col justify-center h-16 md:h-20">
      <div className="space-y-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-[#bd9131] animate-pulse" />
        <div className="w-1.5 h-1.5 rounded-full bg-[#bd9131] animate-pulse animation-delay-200" />
      </div>
    </div>
  )
}

export function DealCountdown() {
  const [endTime] = useState(getEndOfDay)
  const [time, setTime] = useState(getTimeRemaining(endTime))
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => {
      setTime(getTimeRemaining(endTime))
    }, 1000)
    return () => clearInterval(timer)
  }, [endTime])

  if (!mounted) {
    return (
      <div className="flex items-center justify-center gap-3 md:gap-4">
        <TimeBlock value={0} label="Days" />
        <Separator />
        <TimeBlock value={0} label="Hours" />
        <Separator />
        <TimeBlock value={0} label="Mins" />
        <Separator />
        <TimeBlock value={0} label="Secs" />
      </div>
    )
  }

  const isUrgent = time.days === 0 && time.hours < 2

  return (
    <div className="space-y-4">
      {/* Urgency Indicator */}
      {isUrgent && (
        <div className="flex items-center justify-center gap-2 text-red-500 animate-pulse">
          <Flame className="w-5 h-5" />
          <span className="text-sm font-bold uppercase tracking-wider">Hurry! Almost Over</span>
          <Flame className="w-5 h-5" />
        </div>
      )}
      
      {/* Countdown Timer */}
      <div className="flex items-center justify-center gap-3 md:gap-4">
        <TimeBlock value={time.days} label="Days" isUrgent={isUrgent} />
        <Separator />
        <TimeBlock value={time.hours} label="Hours" isUrgent={isUrgent} />
        <Separator />
        <TimeBlock value={time.minutes} label="Mins" isUrgent={isUrgent} />
        <Separator />
        <TimeBlock value={time.seconds} label="Secs" isUrgent={isUrgent} />
      </div>
    </div>
  )
}
