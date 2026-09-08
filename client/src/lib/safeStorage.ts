/**
 * 근본적 해결: localStorage가 손상되었을 때 앱 전체가 죽는 것을 방지
 * 모든 JSON.parse(localStorage...)를 이 함수로 교체해야 함
 */

function quarantine(key: string, raw: string | null) {
  try {
    if (raw !== null) {
      localStorage.setItem(`_corrupted_${key}`, raw);
      // 원본은 삭제하지 않음 – 사용자가 직접 확인 가능하도록 보존
      // 단, 앱 시작을 막는 손상은 fallback으로 계속 진행
    }
  } catch {}
}

export function safeParseJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null || raw === undefined) return fallback;
    if (raw.trim() === '') return fallback;
    const parsed = JSON.parse(raw);
    // fallback이 배열이면 파싱 결과도 배열인지 확인
    if (Array.isArray(fallback) && !Array.isArray(parsed)) {
      console.warn(`[safeStorage] ${key} expected array but got`, typeof parsed, '- using fallback');
      quarantine(key, raw);
      return fallback;
    }
    // fallback이 객체이고 파싱 결과가 null이거나 primitive이면 fallback
    if (fallback !== null && typeof fallback === 'object' && !Array.isArray(fallback)) {
      if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
        console.warn(`[safeStorage] ${key} expected object but got`, typeof parsed, '- using fallback');
        quarantine(key, raw);
        return fallback;
      }
    }
    return parsed as T;
  } catch (e) {
    console.warn(`[safeStorage] Failed to parse ${key}, using fallback:`, e);
    try {
      const raw = localStorage.getItem(key);
      quarantine(key, raw);
    } catch {}
    return fallback;
  }
}

/** raw 문자열을 안전하게 파싱 – 이미 getItem한 값을 쓰는 곳에서 사용 */
export function safeParseRaw<T>(raw: string | null, fallback: T, keyForLog = 'unknown'): T {
  if (raw === null || raw === undefined) return fallback;
  if (typeof raw === 'string' && raw.trim() === '') return fallback;
  try {
    const parsed = JSON.parse(raw as string);
    if (Array.isArray(fallback) && !Array.isArray(parsed)) {
      console.warn(`[safeStorage] ${keyForLog} expected array but got`, typeof parsed, '- using fallback');
      quarantine(keyForLog, raw);
      return fallback;
    }
    if (fallback !== null && typeof fallback === 'object' && !Array.isArray(fallback)) {
      if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
        console.warn(`[safeStorage] ${keyForLog} expected object but got`, typeof parsed, '- using fallback');
        quarantine(keyForLog, raw);
        return fallback;
      }
    }
    return parsed as T;
  } catch (e) {
    console.warn(`[safeStorage] Failed to parse raw ${keyForLog}, using fallback:`, e);
    quarantine(keyForLog, raw);
    return fallback;
  }
}

export function safeGetString(key: string, fallback: string = ''): string {
  try {
    const v = localStorage.getItem(key);
    return v !== null ? v : fallback;
  } catch {
    return fallback;
  }
}

export function safeGetNumber(key: string, fallback: number = 0): number {
  try {
    const v = localStorage.getItem(key);
    if (v === null) return fallback;
    const n = Number(v);
    return Number.isNaN(n) ? fallback : n;
  } catch {
    return fallback;
  }
}
