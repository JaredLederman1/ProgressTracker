import { format } from 'date-fns';
import { Settings } from 'lucide-react';

type Props = {
  date: Date;
  streakDisplay?: string;
};

export function Header({ date, streakDisplay = '—' }: Props) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-md backdrop-saturate-150">
      <div className="mx-auto flex max-w-md items-center justify-between px-5 py-4">
        <div className="flex flex-col">
          <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Today
          </span>
          <h1 className="text-lg font-semibold tracking-tight">{format(date, 'EEEE, MMMM d')}</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-baseline gap-1 rounded-full border border-border/60 bg-secondary/40 px-2.5 py-1">
            <span className="font-numeric text-sm font-semibold leading-none">{streakDisplay}</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">streak</span>
          </div>
          <button
            type="button"
            aria-label="Settings"
            className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
