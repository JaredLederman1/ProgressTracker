import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

type Props = {
  onClick: () => void;
};

export function PlanTomorrowCTA({ onClick }: Props) {
  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
      className="pointer-events-none fixed inset-x-0 bottom-0 z-30 px-4 pb-[max(env(safe-area-inset-bottom),16px)] pt-3"
    >
      <div className="mx-auto max-w-md">
        <motion.button
          type="button"
          onClick={onClick}
          whileTap={{ scale: 0.98 }}
          className="pointer-events-auto flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 ring-1 ring-primary/40 transition-colors hover:bg-accent"
        >
          Plan Tomorrow
          <ArrowRight className="h-4 w-4" />
        </motion.button>
      </div>
    </motion.div>
  );
}
