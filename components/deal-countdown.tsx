"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Flame } from "lucide-react"

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
        "w-10 h-10 md:w-12 md:h-12 rounded bg-black flex items-center justify-center shadow",
        isUrgent && "ring-1 ring-red-500"
      )}>
        <span className={cn(
          "text-base md:text-lg font-bold tabular-nums",
          isUrgent ? "text-red-500" : "text-white"
        )}>
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="text-[10px] text-muted-foreground mt-1 font-medium uppercase tracking-wide">
        {label}
      </span>
    </div>
  )
}

function Separator() {
  return (
    <div className="flex flex-col justify-center h-10 md:h-12">
      <div className="space-y-1">
        <div className="w-1 h-1 rounded-full bg-[#bd9131]" />
        <div className="w-1 h-1 rounded-full bg-[#bd9131]" />
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
      <div className="flex items-center justify-center gap-2">
        <TimeBlock value={0} label="Days" />
        <Separator />
        <TimeBlock value={0} label="Hrs" />
        <Separator />
        <TimeBlock value={0} label="Min" />
        <Separator />
        <TimeBlock value={0} label="Sec" />
      </div>
    )
  }

  const isUrgent = time.days === 0 && time.hours < 2

  return (
    <div className="space-y-2">
      {isUrgent && (
        <div className="flex items-center justify-center gap-1 text-red-500">
          <Flame className="w-3 h-3" />
          <span className="text-[10px] font-semibold uppercase tracking-wide">Almost Over</span>
          <Flame className="w-3 h-3" />
        </div>
      )}
      
      <div className="flex items-center justify-center gap-2">
        <TimeBlock value={time.days} label="Days" isUrgent={isUrgent} />
        <Separator />
        <TimeBlock value={time.hours} label="Hrs" isUrgent={isUrgent} />
        <Separator />
        <TimeBlock value={time.minutes} label="Min" isUrgent={isUrgent} />
        <Separator />
        <TimeBlock value={time.seconds} label="Sec" isUrgent={isUrgent} />
      </div>
    </div>
  )
}
