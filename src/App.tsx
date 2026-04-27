import { Header } from '@/components/Header';
import { TodayView } from '@/components/today/TodayView';
import { useTracker } from '@/hooks/useTracker';

export default function App() {
  const tracker = useTracker();
  return (
    <div className="min-h-full">
      <Header date={new Date()} />
      <TodayView tracker={tracker} />
    </div>
  );
}
