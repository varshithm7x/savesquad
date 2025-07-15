import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatSui(amount: bigint): string {
  return (Number(amount) / 1_000_000_000).toFixed(3)
}

export function formatSquadTokens(amount: bigint): string {
  return (Number(amount) / 1_000_000).toFixed(2)
}

export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function getWeekNumber(startTime: number, currentTime: number = Date.now()): number {
  const weekInMs = 7 * 24 * 60 * 60 * 1000
  return Math.floor((currentTime - startTime) / weekInMs) + 1
}

export function getTimeUntilNextWeek(startTime: number, currentTime: number = Date.now()): number {
  const weekInMs = 7 * 24 * 60 * 60 * 1000
  const elapsed = (currentTime - startTime) % weekInMs
  return weekInMs - elapsed
}

export function formatTimeRemaining(ms: number): string {
  const days = Math.floor(ms / (24 * 60 * 60 * 1000))
  const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
  const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000))
  
  if (days > 0) {
    return `${days}d ${hours}h`
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else {
    return `${minutes}m`
  }
}

// Re-export contract utilities
export * from './contracts'
