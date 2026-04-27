import { format } from 'date-fns';
import { Flame, Settings } from 'lucide-react';

type Props = {
  date: Date;
  streak: number;
  onOpenSettings?: () => void;
};

export function Header({ date, streak, onOpenSettings }: Props) {
  const display = streak > 0 ? String(streak) : '—';

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-md backdrop-saturate-150">
      <div className="mx-auto flex max-w-md items-center justify-between px-5 pb-4 pt-[calc(env(safe-area-inset-top,0px)+16px)]">
        <div className="flex flex-col">
          <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Today
          </span>
          <h1 className="text-lg font-semibold tracking-tight">{format(date, 'EEEE, MMMM d')}</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-full border border-border/60 bg-secondary/40 px-2.5 py-1">
            {streak > 0 && <Flame className="h-3.5 w-3.5 text-primary" />}
            <span className="font-numeric text-sm font-semibold leading-none">{display}</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">streak</span>
          </div>
          <button
            type="button"
            aria-label="Settings"
            onClick={onOpenSettings}
            className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
