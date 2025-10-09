"use client";

import type { CSSProperties } from "react";
import { LucideArrowLeft, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useChannels } from "@/hooks/channels/useChannels";
import type { components } from "@/types/openapi";


type ChannelView = components["schemas"]["ChannelViewDto"];

type ServerChannelsPanelProps = {
  serverId?: string | null;
  serverName?: string;
  open: boolean;
  onClose: () => void;
};

export function ServerChannelsPanel({
  serverId,
  serverName,
  open,
  onClose,
}: ServerChannelsPanelProps) {
  const { data, isLoading, isError, error } = useChannels(
    serverId ?? undefined,
    undefined,
    {
      enabled: Boolean(serverId) && open,
    },
  );

  const publicChannels = data?.publicChannels ?? [];
  const privateChannels = data?.privateChannels ?? [];

  return (
    <div
      className={cn(
        "relative flex-shrink-0 overflow-hidden transition-[width] duration-300 ease-out",
        open ? "w-[300px] max-w-[300px]" : "w-0",
      )}
    >
      <div
        className={cn(
          "flex h-full min-h-screen flex-col border-l border-border/40 bg-sidebar text-sidebar-foreground shadow-lg",
          "transition-[transform,opacity] duration-300 ease-out",
          "w-[--panel-width] min-w-[--panel-width] max-w-[--panel-width]",
          open
            ? "translate-x-0 opacity-100"
            : "pointer-events-none translate-x-4 opacity-0",
        )}
      >
        <header className="flex items-center justify-between border-b border-border/40 px-4 py-3">
          <div>
            <p className="text-xs uppercase text-muted-foreground/70">Server Channels</p>
            <h2 className="text-base font-semibold text-foreground mt-2">
              {serverName ?? "Select a server"}
            </h2>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 absolute top-3 right-3"
            onClick={onClose}
          >
            <LucideArrowLeft className="h-5 w-5" />
            <span className="sr-only">Close channels panel</span>
          </Button>
        </header>
        <Separator />
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {isLoading ? (
            <ChannelSkeleton />
          ) : isError ? (
            <ErrorState message={error?.message} />
          ) : publicChannels.length === 0 && privateChannels.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-6">
              <ChannelSection
                title="Public Channels"
                channels={publicChannels}
              />
              {privateChannels.length > 0 && (
                <ChannelSection
                  title="Private Channels"
                  channels={privateChannels}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

type ChannelSectionProps = {
  title: string;
  channels: ChannelView[];
};

function ChannelSection({ title, channels }: ChannelSectionProps) {
  if (channels.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      <ul className="space-y-1">
        {channels.map((channel) => (
          <li
            key={channel.id}
            className="rounded-md border border-border/40 bg-background/80 px-3 py-2 text-sm text-foreground"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{channel.name}</span>
              <span className="text-xs uppercase text-muted-foreground">
                {channel.type}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ChannelSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}

function ErrorState({ message }: { message?: string }) {
  return (
    <div className="rounded-md border border-destructive/60 bg-destructive/10 px-3 py-4 text-sm text-destructive">
      <p className="font-medium">Failed to load channels.</p>
      {message && <p className="text-destructive/80">{message}</p>}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-md border border-border/40 bg-background/80 px-3 py-4 text-sm text-muted-foreground">
      No channels yet.
    </div>
  );
}
