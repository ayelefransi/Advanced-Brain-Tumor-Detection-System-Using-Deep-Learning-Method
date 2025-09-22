type CaseCardProps = {
  title: string;
  status: string;
  subtitle?: string;
  onClick?: () => void;
};

export function CaseCard({ title, status, subtitle, onClick }: CaseCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:shadow"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-slate-900 font-medium">{title}</h3>
          {subtitle ? (
            <p className="text-slate-500 text-sm mt-1">{subtitle}</p>
          ) : null}
        </div>
        <span className="ml-4 inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
          {status}
        </span>
      </div>
    </button>
  );
}


