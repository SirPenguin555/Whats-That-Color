# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-07-31-ai-powered-scoring/spec.md

> Created: 2025-07-31
> Version: 1.0.0

## Technical Requirements

- **OpenAI API Integration:** Secure connection to GPT-4 API with environment variable configuration
- **Prompt Engineering:** Structured prompts that consistently return JSON-formatted scores
- **Response Parsing:** Robust JSON parsing with validation and error recovery
- **Caching System:** Local storage or memory caching for duplicate descriptions
- **Fallback Logic:** Automatic fallback to basic scoring when API fails
- **Loading States:** Visual feedback during 2-5 second API response times
- **Rate Limiting:** Respect OpenAI API rate limits and handle 429 errors
- **Cost Tracking:** Monitor token usage to prevent unexpected API costs

## Approach Options

**Option A:** Direct OpenAI API Integration
- Pros: Full control, lower latency, direct cost monitoring
- Cons: Requires API key management, more complex error handling

**Option B:** OpenAI API with Next.js API Routes (Selected)
- Pros: Secure API key handling, server-side processing, better error handling
- Cons: Slightly higher latency, more complex architecture

**Option C:** Third-party AI Service Wrapper
- Pros: Simplified integration, built-in error handling
- Cons: Additional dependency, less control, potential extra costs

**Rationale:** Option B provides the best balance of security, maintainability, and performance. Next.js API routes keep the OpenAI API key secure on the server while providing clean error handling and response processing.

## External Dependencies

- **openai** - Official OpenAI JavaScript SDK for GPT-4 API integration
- **Justification:** Official SDK provides best practices, TypeScript support, and automatic retries

## API Design

### Scoring API Endpoint
```typescript
// POST /api/score-description
interface ScoreRequest {
  description: string
  hexColor: string
}

interface ScoreResponse {
  scores: {
    funny: number      // 0-5 with decimal precision
    accurate: number   // 0-5 with decimal precision  
    popular: number    // 0-5 with decimal precision
    overall: number    // Calculated weighted average
  }
  cached: boolean      // Whether result came from cache
  processingTime: number // Milliseconds for performance monitoring
}
```

## Prompt Engineering Strategy

### GPT-4 Scoring Prompt Structure
```
You are an expert judge for a creative color description game. Rate the following description on three criteria:

COLOR: {hexColor}
DESCRIPTION: "{description}"

Rate each criterion from 0.0 to 5.0 (decimal precision):

1. FUNNY: How humorous, creative, or entertaining is this description?
   - Consider wordplay, metaphors, cultural references, unexpected comparisons
   - 0.0 = No humor, 5.0 = Genuinely hilarious

2. ACCURATE: How well does this description match the actual color?
   - Consider color theory, shade precision, visual accuracy
   - 0.0 = Completely wrong, 5.0 = Perfectly accurate

3. POPULAR: Does this strike the right balance between unique and understandable?
   - 2.5 = Perfect balance (creative but accessible)
   - 0.0 = Too obscure/confusing, 5.0 = Too common/boring

Return ONLY this JSON format:
{"funny": X.X, "accurate": X.X, "popular": X.X}
```

## Caching Strategy

### Cache Implementation
- **Storage:** Browser localStorage for client-side caching
- **Key Format:** `score_${hexColor}_${descriptionHash}`
- **Expiration:** 24 hours to balance cost savings with fresh responses
- **Size Limit:** Maximum 100 cached responses with LRU eviction

## Error Handling

### API Failure Scenarios
1. **Network Errors:** Retry once, then fallback to basic scoring
2. **Rate Limiting (429):** Wait and retry with exponential backoff
3. **Invalid Responses:** Parse error handling with fallback scoring
4. **Timeout Errors:** 10-second timeout with fallback
5. **Authentication Errors:** Log error and use fallback (don't break game)

### Fallback Strategy
```typescript
async function scoreWithFallback(description: string, hexColor: string) {
  try {
    return await scoreWithAI(description, hexColor)
  } catch (error) {
    console.warn('AI scoring failed, using fallback:', error)
    return scoreWithBasicAlgorithm(description, hexColor)
  }
}
```

## Performance Optimization

### Response Time Targets
- **Cache Hit:** < 50ms
- **AI Processing:** 2-5 seconds (show loading state)
- **Fallback:** < 100ms

### Cost Management
- **Target:** < $0.10 per 100 game sessions
- **Monitoring:** Track token usage and costs
- **Optimization:** Efficient prompts, response caching, smart fallbacks