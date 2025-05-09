"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SidebarMenuButton } from '@/components/ui/sidebar';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

interface NavButtonProps extends Omit<ComponentProps<typeof SidebarMenuButton>, 'isActive' | 'asChild'> {
  href: string;
  children: React.ReactNode;
}

export function NavButton({ href, children, className, tooltip, ...props }: NavButtonProps) {
  const pathname = usePathname();
  
  // More robust active check: exact match for dashboard, startsWith for others.
  // Handles cases like /categories and /categories/new
  let isActive = pathname === href;
  if (href !== '/' && href !== '/dashboard' && pathname.startsWith(href)) {
    isActive = true;
  }
  // Special case for dashboard to be active on "/" or "/dashboard"
  if ((href === '/' || href === '/dashboard') && (pathname === '/' || pathname === '/dashboard')) {
    isActive = true;
  }


  return (
    <Link href={href} passHref legacyBehavior>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={tooltip || ""} // Ensure tooltip is always string
        className={cn("w-full justify-start", className)} // Ensure button fills width and aligns content left
        {...props}
      >
        <a>{children}</a>
      </SidebarMenuButton>
    </Link>
  );
}
