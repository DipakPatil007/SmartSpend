import { Wallet } from 'lucide-react';
import Link from 'next/link';

export function Logo({ collapsed }: { collapsed?: boolean }) {
  return (
    <Link href="/dashboard" className="flex items-center gap-2 text-primary outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm p-1 -m-1">
      <Wallet className="h-8 w-8 shrink-0" />
      {!collapsed && (
         <h1 className="text-xl font-bold tracking-tight text-foreground whitespace-nowrap">Smart Spend</h1>
      )}
    </Link>
  );
}
