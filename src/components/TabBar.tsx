import { motion } from 'framer-motion';
import {
  Bookmark,
  CheckSquare,
  Settings as SettingsIcon,
  Target,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type TabKey = 'today' | 'stats' | 'milestones' | 'media' | 'settings';

const TABS: { key: TabKey; label: string; icon: LucideIcon }[] = [
  { key: 'today', label: 'Today', icon: CheckSquare },
  { key: 'stats', label: 'Stats', icon: TrendingUp },
  { key: 'milestones', label: 'Milestones', icon: Target },
  { key: 'media', label: 'Media', icon: Bookmark },
  { key: 'settings', label: 'Settings', icon: SettingsIcon },
];

type Props = {
  active: TabKey;
  onChange: (tab: TabKey) => void;
};

export function TabBar({ active, onChange }: Props) {
  return (
    <nav
      aria-label="Primary"
      className="glass fixed inset-x-0 bottom-0 z-40 border-t border-border/60 pb-[max(env(safe-area-inset-bottom),0px)]"
    >
      <div className="mx-auto grid max-w-md grid-cols-5">
        {TABS.map(({ key, label, icon: Icon }) => {
          const isActive = key === active;
          return (
            <motion.button
              key={key}
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={() => onChange(key)}
              className="relative flex h-14 flex-col items-center justify-center gap-1 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
              aria-current={isActive ? 'page' : undefined}
              aria-label={label}
            >
              <Icon
                className={cn(
                  'h-5 w-5 transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground',
                )}
                style={
                  isActive
                    ? { filter: 'drop-shadow(0 0 6px rgba(59, 130, 246, 0.55))' }
                    : undefined
                }
              />
              <span
                className={cn(
                  'text-[10px] font-medium tracking-wide transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                {label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
