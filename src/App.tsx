import { motion } from 'framer-motion';
import { useTracker } from '@/hooks/useTracker';

export default function App() {
  const { state, exportState } = useTracker();

  const handleExport = () => {
    const json = exportState();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tracker-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-full flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="glass rounded-2xl px-10 py-12 text-center max-w-md w-full"
      >
        <h1 className="font-sans text-4xl font-semibold tracking-tight">Tracker</h1>
        <p className="font-numeric text-sm text-muted-foreground mt-2">ready</p>
        <p className="font-numeric text-xs text-muted-foreground mt-6">
          {state.habits.length} habits seeded
        </p>

        <button
          type="button"
          onClick={handleExport}
          className="mt-8 inline-flex items-center justify-center rounded-md border border-border/80 bg-transparent px-3 py-1.5 text-xs font-medium text-foreground/80 hover:bg-secondary hover:text-foreground transition-colors"
        >
          Export state
        </button>
      </motion.div>
    </main>
  );
}
