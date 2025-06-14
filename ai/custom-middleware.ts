import { Experimental_LanguageModelV1Middleware, LanguageModelV1CallOptions, LanguageModelV1 } from "ai";

// In-memory cache
const cache = new Map<string, any>();

// Basic rate limiting (requests per minute)
const rateLimit = new Map<string, number>();
const RATE_LIMIT_PER_MINUTE = 60;

setInterval(() => {
  rateLimit.clear();
}, 60 * 1000); // Clear rate limit counts every minute

export const customMiddleware: Experimental_LanguageModelV1Middleware = {
  async run(callOptions: LanguageModelV1CallOptions, next: () => Promise<LanguageModelV1>): Promise<LanguageModelV1> {
    const { model, prompt, maxTokens } = callOptions; // Extract relevant options for caching key
    const cacheKey = JSON.stringify({ model, prompt, maxTokens });

    // Caching
    if (cache.has(cacheKey)) {
      console.log("Cache hit for:", cacheKey);
      return cache.get(cacheKey);
    }

    // Rate Limiting
    const clientIdentifier = "anonymous"; // Replace with actual client identifier if available
    const requestCount = (rateLimit.get(clientIdentifier) || 0) + 1;
    rateLimit.set(clientIdentifier, requestCount);

    if (requestCount > RATE_LIMIT_PER_MINUTE) {
      console.warn("Rate limit exceeded for:", clientIdentifier);
      throw new Error("Rate limit exceeded. Please try again later.");
    }

    try {
      const result = await next();
      // Cache the successful result
      cache.set(cacheKey, result);
      console.log("Cache miss, storing result for:", cacheKey);
      return result;
    } catch (error) {
      console.error("Error calling language model:", error);
      // Simple fallback response
      return { text: () => Promise.resolve("An error occurred. Please try again.") } as LanguageModelV1;
    }
  },
};


