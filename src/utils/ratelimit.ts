import { getRequest } from "@tanstack/react-start/server"
import { RateLimiterMemory, type RateLimiterRes } from "rate-limiter-flexible"

interface LimiterOptions {
  points: number
  duration: string | number
}

interface RatelimitOptions {
  limiter: LimiterOptions
}

interface LimitResponse {
  success: boolean
  limit: number
  reset: number
  remaining: number
}

export async function getUserIP(): Promise<string> {
  const request = getRequest()

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || request.headers.get("x-real-ip") || "127.0.0.1" // Fallback for local development

  return ip
}

const memoryLimiter = new RateLimiterMemory({
  points: 10,
  duration: 10
})

export class Ratelimit {
  static slidingWindow(points: number, duration: string): LimiterOptions {
    return { points, duration }
  }

  // biome-ignore lint/complexity/noUselessConstructor: required
  constructor(_options: RatelimitOptions) {
    // Constructor doesn't need to do anything special
    // since we're using the memoryLimiter instance
  }

  async limit(identifier?: string): Promise<LimitResponse> {
    try {
      const ip = await getUserIP()
      const rateKey = identifier ? `${identifier}:${ip}` : ip
      const rateLimiterRes: RateLimiterRes = await memoryLimiter.consume(rateKey)

      return {
        success: true,
        limit: memoryLimiter.points,
        reset: Date.now() + rateLimiterRes.msBeforeNext,
        remaining: rateLimiterRes.remainingPoints
      }
    } catch (rejRes) {
      const rateLimiterRes = rejRes as RateLimiterRes

      return {
        success: false,
        limit: memoryLimiter.points,
        reset: Date.now() + rateLimiterRes.msBeforeNext,
        remaining: 0
      }
    }
  }
}

export const ratelimit = new Ratelimit({
  limiter: Ratelimit.slidingWindow(10, "10 s")
})
