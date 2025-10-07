"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { ModeToggle } from "../utilities/modeToggle";
import { ChatSwitcher } from "./dropdowns/chat-switcher";
import { UniversityIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ServerAccordion } from "./accordions/server-accordion";
import { Separator } from "@/components/ui/separator";

export function AppSidebar() {
  const Chats = [
    {
      name: "University Modules",
      logo: UniversityIcon,
      plan: "City University",
    },
  ];

  return (
    <Sidebar className={cn("dark:bg-[#121212]")} >
      <SidebarHeader>
        <ChatSwitcher Chat={Chats} />
      </SidebarHeader>
      <SidebarContent className="flex flex-col">
        <SidebarGroup className="flex-1 px-0 overflow-x-hidden">
          <ServerAccordion className="mx-3" />
          <Separator className="mx-3 my-4" />
          <div className="flex flex-1 flex-col gap-4 px-4 pb-4 text-sm text-muted-foreground">
            <div className="rounded-md border border-border/40 bg-background/60 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground/80">
                Coming soon
              </p>
              <p className="mt-2 text-sm text-foreground">
                Personalised profile details and quick actions will live here.
              </p>
            </div>
            <div className="rounded-md border border-border/40 bg-background/60 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground/80">
                Tips
              </p>
              <p className="mt-2 text-sm text-foreground">
                Switch between servers using the accordion above. Scroll to load more.
              </p>
            </div>
          </div>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className={cn("w-full flex flex-row items-center justify-center")}
        >
          <ModeToggle />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
