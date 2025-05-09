
"use client";

import type { ReactNode } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarInset,
  useSidebar,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/Logo';
import { NavButton } from '@/components/NavButton';
import { LayoutDashboard, ArrowLeftRight, Tags, Target, UserCircle, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAppData } from '@/contexts/AppDataContext';
import Link from 'next/link';
import { ThemeToggleButton } from '@/components/ThemeSwitcher';

function AppLogo() {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  return <Logo collapsed={isCollapsed} />;
}

function AppLayoutInternal({ children }: { children: ReactNode }) {
  const { userProfile } = useAppData();
  const { state: sidebarState } = useSidebar();
  const isSidebarCollapsed = sidebarState === 'collapsed';

  return (
    <>
      <Sidebar side="left" variant="sidebar" collapsible="icon" className="border-r">
        <SidebarHeader className="p-4">
          <AppLogo />
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <NavButton href="/dashboard" tooltip="Dashboard">
                <LayoutDashboard className="h-5 w-5 shrink-0" />
                <span className="group-data-[collapsible=icon]:hidden">Dashboard</span>
              </NavButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <NavButton href="/transactions" tooltip="Transactions">
                <ArrowLeftRight className="h-5 w-5 shrink-0" />
                <span className="group-data-[collapsible=icon]:hidden">Transactions</span>
              </NavButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <NavButton href="/categories" tooltip="Categories">
                <Tags className="h-5 w-5 shrink-0" />
                <span className="group-data-[collapsible=icon]:hidden">Categories</span>
              </NavButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <NavButton href="/budgets" tooltip="Budgets">
                <Target className="h-5 w-5 shrink-0" />
                <span className="group-data-[collapsible=icon]:hidden">Budgets</span>
              </NavButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-2 flex flex-col gap-2">
          <ThemeToggleButton />
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
               <Button 
                variant="ghost" 
                className={isSidebarCollapsed ? 
                  "w-auto aspect-square p-0 justify-center" : 
                  "w-full justify-start p-2"
                }
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={userProfile.avatarUrl || undefined} alt={userProfile.name} data-ai-hint="person face" />
                  <AvatarFallback>{userProfile.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                {!isSidebarCollapsed && <span className="ml-2 truncate">{userProfile.name}</span>}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align={isSidebarCollapsed ? "center" : "start"} className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <UserCircle className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <main className="min-h-screen p-4 sm:p-6 lg:p-8 bg-background">
          {children}
        </main>
      </SidebarInset>
    </>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true}>
      <AppLayoutInternal>{children}</AppLayoutInternal>
    </SidebarProvider>
  );
}
