export default function LoadingSpinner({ label = 'Loading...' }) {
  return <div className="flex min-h-48 items-center justify-center gap-3 text-leaf-700" role="status"><span className="h-6 w-6 animate-spin rounded-full border-2 border-leaf-200 border-t-leaf-700" /><span>{label}</span></div>;
}
