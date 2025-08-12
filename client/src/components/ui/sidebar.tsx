// Desktop sidebar components removed - mobile-only app
// Stub file for compatibility

import * as React from "react"

// Stub components for compatibility
export const Sidebar = React.forwardRef<HTMLDivElement, any>(({ children, ...props }, ref) => null)
export const SidebarContent = React.forwardRef<HTMLDivElement, any>(({ children, ...props }, ref) => null)
export const SidebarFooter = React.forwardRef<HTMLDivElement, any>(({ children, ...props }, ref) => null)
export const SidebarGroup = React.forwardRef<HTMLDivElement, any>(({ children, ...props }, ref) => null)
export const SidebarGroupAction = React.forwardRef<HTMLButtonElement, any>(({ children, ...props }, ref) => null)
export const SidebarGroupContent = React.forwardRef<HTMLDivElement, any>(({ children, ...props }, ref) => null)
export const SidebarGroupLabel = React.forwardRef<HTMLDivElement, any>(({ children, ...props }, ref) => null)
export const SidebarHeader = React.forwardRef<HTMLDivElement, any>(({ children, ...props }, ref) => null)
export const SidebarInput = React.forwardRef<HTMLInputElement, any>(({ children, ...props }, ref) => null)
export const SidebarInset = React.forwardRef<HTMLDivElement, any>(({ children, ...props }, ref) => null)
export const SidebarMenu = React.forwardRef<HTMLUListElement, any>(({ children, ...props }, ref) => null)
export const SidebarMenuAction = React.forwardRef<HTMLButtonElement, any>(({ children, ...props }, ref) => null)
export const SidebarMenuBadge = React.forwardRef<HTMLDivElement, any>(({ children, ...props }, ref) => null)
export const SidebarMenuButton = React.forwardRef<HTMLButtonElement, any>(({ children, ...props }, ref) => null)
export const SidebarMenuItem = React.forwardRef<HTMLLIElement, any>(({ children, ...props }, ref) => null)
export const SidebarMenuSkeleton = React.forwardRef<HTMLDivElement, any>(({ children, ...props }, ref) => null)
export const SidebarMenuSub = React.forwardRef<HTMLUListElement, any>(({ children, ...props }, ref) => null)
export const SidebarMenuSubButton = React.forwardRef<HTMLAnchorElement, any>(({ children, ...props }, ref) => null)
export const SidebarMenuSubItem = React.forwardRef<HTMLLIElement, any>(({ children, ...props }, ref) => null)
export const SidebarProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>
export const SidebarRail = React.forwardRef<HTMLButtonElement, any>(({ children, ...props }, ref) => null)
export const SidebarSeparator = React.forwardRef<HTMLDivElement, any>(({ children, ...props }, ref) => null)
export const SidebarTrigger = React.forwardRef<HTMLButtonElement, any>(({ children, ...props }, ref) => null)

export const useSidebar = () => ({
  state: 'expanded',
  open: false,
  setOpen: () => {},
  openMobile: false,
  setOpenMobile: () => {},
  isMobile: true,
  toggleSidebar: () => {}
})