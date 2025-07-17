import { Temporal } from "@js-temporal/polyfill"

export interface timeFunctionPorps {
  instant: Temporal.Instant
  duration?: string
}

export function timeFunction (
 {
  instant, duration
 } : timeFunctionPorps
) 
{
  // delta time 不存在
  if(duration === undefined) return instant.toString();
  // delta time 存在
  const dt = Temporal.Duration.from(duration);
  const zoned = instant.toZonedDateTimeISO("Asia/Taipei"); // 或自動取得使用者 locale

  return zoned.add(dt).toString();
}