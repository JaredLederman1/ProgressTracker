import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { TabBar, type TabKey } from '@/components/TabBar';
import { TodayView } from '@/components/today/TodayView';
import { StatsView } from '@/components/stats/StatsView';
import { MilestonesView } from '@/components/milestones/MilestonesView';
import { MediaView } from '@/components/media/MediaView';
import { SettingsView } from '@/components/settings/SettingsView';
import { SignIn } from '@/components/auth/SignIn';
import { Toaster } from '@/components/ui/sonner';
import { useTracker } from '@/hooks/useTracker';
import { useSession } from '@/hooks/useSession';
import { overallCurrentStreak } from '@/lib/streaks';

export default function App() {
  const { session, loading } = useSession();
  const tracker = useTracker(session?.user.id ?? null);
  const [tab, setTab] = useState<TabKey>('today');

  const today = useMemo(() => new Date(), []);
  const streak = useMemo(
    () => overallCurrentStreak(tracker.state.habits, tracker.state.entries, today),
    [tracker.state.habits, tracker.state.entries, today],
  );

  if (loading) {
    return <div className="min-h-full" />;
  }

  if (!session) {
    return (
      <div className="min-h-full">
        <SignIn />
        <Toaster />
      </div>
    );
  }

  return (
    <div className="min-h-full">
      <Header date={today} streak={streak} onOpenSettings={() => setTab('settings')} />

      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          key={tab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {tab === 'today' && <TodayView tracker={tracker} />}
          {tab === 'stats' && <StatsView state={tracker.state} />}
          {tab === 'milestones' && <MilestonesView tracker={tracker} />}
          {tab === 'media' && <MediaView tracker={tracker} />}
          {tab === 'settings' && <SettingsView tracker={tracker} />}
        </motion.main>
      </AnimatePresence>

      <TabBar active={tab} onChange={setTab} />
      <Toaster />
    </div>
  );
}
