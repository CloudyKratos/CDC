
"use client"

import * as React from "react"
import { Clock } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface TimePickerDemoProps {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
}

export function TimePickerDemo({ date, setDate }: TimePickerDemoProps) {
  const minuteRef = React.useRef<HTMLInputElement>(null)
  const hourRef = React.useRef<HTMLInputElement>(null)
  const secondRef = React.useRef<HTMLInputElement>(null)

  const [hour, setHour] = React.useState<number>(date ? date.getHours() : 0)
  const [minute, setMinute] = React.useState<number>(date ? date.getMinutes() : 0)
  const [second, setSecond] = React.useState<number>(date ? date.getSeconds() : 0)

  // Update component state when date changes
  React.useEffect(() => {
    if (date) {
      setHour(date.getHours())
      setMinute(date.getMinutes())
      setSecond(date.getSeconds())
    }
  }, [date])

  // Update date object when time changes
  React.useEffect(() => {
    if (date && !isNaN(hour) && !isNaN(minute) && !isNaN(second)) {
      const newDate = new Date(date)
      newDate.setHours(hour)
      newDate.setMinutes(minute)
      newDate.setSeconds(second)
      setDate(newDate)
    }
  }, [hour, minute, second, setDate, date])

  // Handle hours input
  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    if (isNaN(value)) {
      setHour(0)
    } else {
      setHour(value < 0 ? 0 : value > 23 ? 23 : value)
    }
  }

  // Handle minutes input
  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    if (isNaN(value)) {
      setMinute(0)
    } else {
      setMinute(value < 0 ? 0 : value > 59 ? 59 : value)
    }
  }

  // Handle seconds input
  const handleSecondChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    if (isNaN(value)) {
      setSecond(0)
    } else {
      setSecond(value < 0 ? 0 : value > 59 ? 59 : value)
    }
  }

  // Handle keyboard navigation
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    type: "hour" | "minute" | "second"
  ) => {
    // Handle up/down arrow keys to increment/decrement values
    if (e.key === "ArrowUp") {
      e.preventDefault()
      if (type === "hour") {
        setHour((prev) => (prev === 23 ? 0 : prev + 1))
      } else if (type === "minute") {
        setMinute((prev) => (prev === 59 ? 0 : prev + 1))
      } else {
        setSecond((prev) => (prev === 59 ? 0 : prev + 1))
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      if (type === "hour") {
        setHour((prev) => (prev === 0 ? 23 : prev - 1))
      } else if (type === "minute") {
        setMinute((prev) => (prev === 0 ? 59 : prev - 1))
      } else {
        setSecond((prev) => (prev === 0 ? 59 : prev - 1))
      }
    }

    // Tab navigation
    if (e.key === "ArrowRight" || (e.key === "Tab" && !e.shiftKey)) {
      if (type === "hour") {
        e.preventDefault()
        minuteRef.current?.focus()
      } else if (type === "minute") {
        e.preventDefault()
        secondRef.current?.focus()
      }
    } else if (e.key === "ArrowLeft" || (e.key === "Tab" && e.shiftKey)) {
      if (type === "second") {
        e.preventDefault()
        minuteRef.current?.focus()
      } else if (type === "minute") {
        e.preventDefault()
        hourRef.current?.focus()
      }
    }
  }

  return (
    <div className="flex items-end gap-2">
      <div className="grid gap-1 text-center">
        <Label htmlFor="hours" className="text-xs">
          Hours
        </Label>
        <Input
          ref={hourRef}
          id="hours"
          className="w-16 text-center"
          value={hour.toString().padStart(2, "0")}
          onChange={handleHourChange}
          onKeyDown={(e) => handleKeyDown(e, "hour")}
          type="number"
          min={0}
          max={23}
        />
      </div>
      <div className="grid gap-1 text-center">
        <Label htmlFor="minutes" className="text-xs">
          Minutes
        </Label>
        <Input
          ref={minuteRef}
          id="minutes"
          className="w-16 text-center"
          value={minute.toString().padStart(2, "0")}
          onChange={handleMinuteChange}
          onKeyDown={(e) => handleKeyDown(e, "minute")}
          type="number"
          min={0}
          max={59}
        />
      </div>
      <div className="grid gap-1 text-center">
        <Label htmlFor="seconds" className="text-xs">
          Seconds
        </Label>
        <Input
          ref={secondRef}
          id="seconds"
          className="w-16 text-center"
          value={second.toString().padStart(2, "0")}
          onChange={handleSecondChange}
          onKeyDown={(e) => handleKeyDown(e, "second")}
          type="number"
          min={0}
          max={59}
        />
      </div>
      <div className="flex h-10 items-center">
        <Clock className="ml-2 h-4 w-4" />
      </div>
    </div>
  )
}
