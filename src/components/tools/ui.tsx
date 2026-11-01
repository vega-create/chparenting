// 工具內頁共用的小元件與 hook（改版規劃第 9.1、12、13 節）。
// 樣式用 global.css 的 tl- class；這裡只放行為。
import { useState, useCallback, type ReactNode } from 'react';

type CopyState = 'idle' | 'copied' | 'failed';

/** 複製文字；Clipboard API 失敗時回報 failed，由畫面顯示可手動選取的文字。 */
export function useCopy() {
  const [state, setState] = useState<CopyState>('idle');
  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setState('copied');
      setTimeout(() => setState('idle'), 2000);
      return true;
    } catch {
      setState('failed');
      return false;
    }
  }, []);
  const reset = useCallback(() => setState('idle'), []);
  return { state, copy, reset };
}

interface CopyButtonProps {
  text: string;
  label: string;           // 例如「複製這句話」
  className?: string;      // 預設次要按鈕
  toolId?: string;
}

/** 複製按鈕＋狀態訊息；失敗時展開可選取的文字框。複製不會改變目前內容。 */
export function CopyButton({ text, label, className = 'tl-btn tl-btn-secondary', toolId }: CopyButtonProps) {
  const { state, copy } = useCopy();
  return (
    <div className="contents">
      <button
        type="button"
        className={className}
        onClick={async () => {
          const ok = await copy(text);
          if (toolId) track('copy_result', { tool_id: toolId, success: ok });
        }}
      >
        {state === 'copied' ? '已複製' : label}
      </button>
      <span className="sr-only" role="status">{state === 'copied' ? '已複製' : ''}</span>
      {state === 'failed' && <ManualCopy text={text} />}
    </div>
  );
}

export function ManualCopy({ text }: { text: string }) {
  return (
    <div className="w-full basis-full mt-2">
      <p className="text-sm tl-muted mb-1" role="status">無法自動複製，請選取下方文字手動複製：</p>
      <textarea
        readOnly
        value={text}
        rows={Math.min(8, text.split('\n').length + 1)}
        onFocus={(e) => e.currentTarget.select()}
        className="w-full rounded-xl border border-warmgray-200 bg-white p-3 text-sm text-warmgray-800"
      />
    </div>
  );
}

/** 一行狀態提示（保存、錯誤、播放失敗）。tone=warn 用淺橘底。 */
export function Notice({ children, tone = 'info' }: { children: ReactNode; tone?: 'info' | 'warn' }) {
  return (
    <div className={tone === 'warn' ? 'tl-notice tl-notice--warn' : 'tl-notice'}>
      <span aria-hidden="true" className="font-bold" style={{ color: tone === 'warn' ? '#C0582F' : '#6E8E6A' }}>
        {tone === 'warn' ? '!' : 'i'}
      </span>
      <div>{children}</div>
    </div>
  );
}

/**
 * GA4 最小事件（規劃 12.2）：只送 tool_id / success / channel，
 * 不送任何文字輸入、心情、分數或答案。沒有 gtag 時什麼都不做。
 */
export function track(event: 'tool_start' | 'tool_complete' | 'copy_result' | 'share_tool', params: { tool_id: string; success?: boolean; channel?: string }) {
  const g = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
  if (typeof g === 'function') g('event', event, params);
}
