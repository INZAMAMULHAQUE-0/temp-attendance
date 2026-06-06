import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

export function Button({ children, variant = "primary", className = "", ...props }) {
  const styles = {
    primary: "bg-teal text-white hover:bg-teal/90",
    secondary: "bg-white text-ink border border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-white dark:border-slate-700",
    danger: "bg-coral text-white hover:bg-coral/90",
    ghost: "text-slate-600 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
  };
  return <button className={`inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition disabled:opacity-50 ${styles[variant]} ${className}`} {...props}>{children}</button>;
}

export function Input(props) {
  return <input className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-teal dark:border-slate-700 dark:bg-slate-900" {...props} />;
}

export function Select({ children, ...props }) {
  return <select className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-teal dark:border-slate-700 dark:bg-slate-900" {...props}>{children}</select>;
}

export function Textarea(props) {
  return <textarea className="min-h-24 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal dark:border-slate-700 dark:bg-slate-900" {...props} />;
}

export function Panel({ children, className = "" }) {
  return <section className={`rounded-lg border border-slate-200 bg-white p-5 shadow-panel dark:border-slate-800 dark:bg-slate-900 ${className}`}>{children}</section>;
}

export function Stat({ label, value }) {
  return <Panel><p className="text-sm text-slate-500 dark:text-slate-400">{label}</p><p className="mt-2 text-3xl font-bold text-ink dark:text-white">{value}</p></Panel>;
}

export function Empty({ text }) {
  return <div className="rounded-md border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-700">{text}</div>;
}

export function Loading() {
  return <div className="flex items-center gap-2 text-sm text-slate-500"><Loader2 className="size-4 animate-spin" /> Loading</div>;
}

export function Alert({ type = "error", children }) {
  const Icon = type === "success" ? CheckCircle2 : AlertCircle;
  return <div className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${type === "success" ? "bg-teal/10 text-teal" : "bg-coral/10 text-coral"}`}><Icon className="size-4" />{children}</div>;
}
