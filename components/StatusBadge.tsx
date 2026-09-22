import { ProblemStatus, STATUS_LABEL } from '@/lib/types';

const STYLES: Record<ProblemStatus, string> = {
  solved: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  discussing: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  open: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/30'
};

export default function StatusBadge({ status }: { status: ProblemStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-semibold ${STYLES[status]}`}
    >
      {status === 'solved' && '✓ '}
      {STATUS_LABEL[status]}
    </span>
  );
}
