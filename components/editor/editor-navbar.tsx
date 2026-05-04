"use client"

import { UserButton } from "@clerk/nextjs"
import { PanelLeftClose, PanelLeftOpen } from "lucide-react"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface EditorNavbarProps {
  isSidebarOpen: boolean
  onToggleSidebar: () => void
  projectName?: string
  rightActions?: ReactNode
  className?: string
}

export function EditorNavbar({
  isSidebarOpen,
  onToggleSidebar,
  projectName,
  rightActions,
  className,
}: EditorNavbarProps) {
  const SidebarIcon = isSidebarOpen ? PanelLeftClose : PanelLeftOpen
  const sidebarLabel = isSidebarOpen
    ? "Close project sidebar"
    : "Open project sidebar"

  return (
    <header
      className={cn(
        "flex h-14 shrink-0 items-center border-b border-surface-border bg-surface/95 px-4",
        className
      )}
    >
      <div className="flex flex-1 items-center justify-start">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={sidebarLabel}
          aria-pressed={isSidebarOpen}
          onClick={onToggleSidebar}
        >
          <SidebarIcon className="h-5 w-5" aria-hidden="true" />
        </Button>
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-center px-4">
        {projectName ? (
          <p className="truncate text-sm font-semibold text-copy-primary">
            {projectName}
          </p>
        ) : null}
      </div>

      <div className="flex flex-1 items-center justify-end gap-3">
        {rightActions}
        <UserButton />
      </div>
    </header>
  )
}
