"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { ChannelPageSkeleton } from "./channelskeleton";
import {
  MessagePanel,
  type ChannelMessage,
} from "@/components/messages/message-panel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useChannel } from "@/hooks/channels/useChannel";
import { useMessages } from "@/hooks/messages/useMessages";
import type { components } from "@/types/openapi";
import { useMessagesSocket } from "@/hooks/messages/useMessagesSocket";
import { authClient } from "@/lib/auth-client";

type Attachment = NonNullable<ChannelMessage["attachments"]>[number];
export default function ChannelPage() {
  const params = useParams<{ serverId: string; channelId: string }>();

  const serverId = Array.isArray(params?.serverId)
    ? params?.serverId[0]
    : params?.serverId;
  const channelId = Array.isArray(params?.channelId)
    ? params?.channelId[0]
    : params?.channelId;

  const { data: session } = authClient.useSession();

  const { socket, isConnected, sendMessage } = useMessagesSocket({
    serverId,
    channelId,
    onConnected: (id) => console.log("connected:", id),
    onDisconnected: (reason) => console.log("disconnected:", reason),
  });
  const channelQuery = useChannel(serverId, channelId);
  const messagesQuery = useMessages(serverId, channelId, { pageSize: 40 });

  const isLoading = channelQuery.isLoading || messagesQuery.isLoading;
  const isError = channelQuery.isError || messagesQuery.isError;

  const messages = useMemo<ChannelMessage[]>(() => {
    if (!messagesQuery.data) return [];

    return messagesQuery.data.pages
      .flatMap((page) => page.items ?? [])
      .map(mapToChannelMessage);
  }, [messagesQuery.data]);

  if (!serverId || !channelId) {
    return (
      <div className="flex h-full items-center justify-center px-6">
        <p className="text-sm text-muted-foreground">
          Select a channel from the sidebar to start reading messages.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return <ChannelPageSkeleton />;
  }


  if (isError || !channelQuery.data) {
    return (
      <ErrorState
        message={
          channelQuery.error?.message ??
          messagesQuery.error?.message ??
          "We couldn't load this channel."
        }
        onRetry={() => {
          void channelQuery.refetch();
          void messagesQuery.refetch();
        }}
        isLoading={messagesQuery.isFetching || channelQuery.isFetching}
      />
    );
  }

  return (
    <MessagePanel
      channelName={channelQuery.data.name}
      channelTopic={channelQuery.data.name}
      messages={messages}
      isLoading={messagesQuery.isFetchingNextPage}
      emptyStateHint={`No messages yet in #${channelQuery.data.name}. Start the conversation!`}
      onRetry={() => void messagesQuery.refetch()}
      onSend={({ content, authorName }) =>
        sendMessage({ content, authorName: authorName || session?.user?.name ?? "Unknown user" })
      }
    />
  );
}

type ErrorStateProps = {
  message: string;
  onRetry?: () => void;
  isLoading?: boolean;
};

function ErrorState({ message, onRetry, isLoading }: ErrorStateProps) {
  return (
    <div className="flex h-full items-center justify-center px-6">
      <div className="max-w-md space-y-4 rounded-xl border border-destructive/40 bg-destructive/10 p-6 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/15 text-destructive">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <p className="text-sm text-destructive/90">{message}</p>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            disabled={isLoading}
            className={cn("gap-2", isLoading && "opacity-70")}
          >
            {isLoading ? "Retrying…" : "Try again"}
          </Button>
        )}
      </div>
    </div>
  );
}
const normalizeAttachments = (value: unknown): Attachment[] => {
  if (!Array.isArray(value)) return [];

  return (value as unknown[]).reduce<Attachment[]>((acc, attachment) => {
    if (!attachment || typeof attachment !== "object") return acc;

    const { url, name, mime, size } = attachment as Partial<Attachment>;
    if (!url) return acc;

    acc.push({ url, name, mime, size });
    return acc;
  }, []);
};

const mapToChannelMessage = (
  message: components["schemas"]["MessageViewDto"],
): ChannelMessage => {
  return {
    id: message.id,
    authorId: message.authorId,
    authorName: message.authorName ?? '',
    content: message.content,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
    editedAt: message.editedAt,
    attachments: normalizeAttachments(message?.attachments),
  };
};
