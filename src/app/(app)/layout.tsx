
"use client";

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

function AppLogo() {
  const { state } = useSidebar(); // or open for full boolean
  const isCollapsed = state === 'collapsed';
  return <Logo collapsed={isCollapsed} />;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { userProfile } = useAppData();

  return (
    <SidebarProvider defaultOpen={true}>
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
        <SidebarFooter className="p-2">
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start p-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:aspect-square">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={userProfile.avatarUrl || undefined} alt={userProfile.name} data-ai-hint="person face" />
                  <AvatarFallback>{userProfile.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <span className="ml-2 group-data-[collapsible=icon]:hidden">{userProfile.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-56">
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
    </SidebarProvider>
  );
}
