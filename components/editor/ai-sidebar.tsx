"use client";

import { Bot, Download, FileText, Send, Sparkles, X } from "lucide-react";
import {
  type FormEvent,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface AiSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const STARTER_PROMPTS = [
  "Design an e-commerce backend",
  "Create a chat app architecture",
  "Build a CI/CD pipeline",
];

export function AiSidebar({ isOpen, onClose }: AiSidebarProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [prompt, setPrompt] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = "0px";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  }, [prompt]);

  function submitPrompt(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();

    const trimmedPrompt = prompt.trim();

    if (!trimmedPrompt) {
      return;
    }

    const timestamp = Date.now();

    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: `user-${timestamp}`,
        role: "user",
        content: trimmedPrompt,
      },
      {
        id: `assistant-${timestamp}`,
        role: "assistant",
        content:
          "I can help map that into canvas nodes once architecture generation is connected.",
      },
    ]);
    setPrompt("");
  }

  function handleTextareaKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey) {
      return;
    }

    event.preventDefault();
    submitPrompt();
  }

  return (
    <aside
      className={cn(
        "absolute bottom-4 right-4 top-4 z-20 flex w-88 max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-surface-border bg-base/95 shadow-2xl shadow-base/70 backdrop-blur transition-[transform,opacity] duration-200 ease-out",
        isOpen
          ? "translate-x-0 opacity-100"
          : "pointer-events-none translate-x-[calc(100%+1rem)] opacity-0",
      )}
      aria-hidden={!isOpen}
      inert={!isOpen}
    >
      <header className="flex h-16 shrink-0 items-center gap-3 border-b border-surface-border px-4">
        <div className="flex size-9 items-center justify-center rounded-xl bg-subtle text-ai-text">
          <Bot className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold text-copy-primary">
            AI Workspace
          </h2>
          <p className="truncate text-xs text-copy-muted">
            Collaborate with ArchFlow
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Close AI sidebar"
          onClick={onClose}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </Button>
      </header>

      <Tabs defaultValue="architect" className="min-h-0 flex-1 gap-0">
        <div className="border-b border-surface-border px-4 py-3">
          <TabsList className="grid h-9 w-full grid-cols-2 rounded-xl bg-subtle p-1">
            <TabsTrigger
              value="architect"
              className="rounded-lg text-copy-muted data-active:bg-accent data-active:text-accent-foreground"
            >
              AI Architect
            </TabsTrigger>
            <TabsTrigger
              value="specs"
              className="rounded-lg text-copy-muted data-active:bg-accent data-active:text-accent-foreground"
            >
              Specs
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="architect" className="min-h-0">
          <div className="flex h-full min-h-0 flex-col">
            <ScrollArea className="min-h-0 flex-1 px-4 py-5">
              {messages.length === 0 ? (
                <ArchitectEmptyState onSelectPrompt={setPrompt} />
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <ChatBubble key={message.id} message={message} />
                  ))}
                </div>
              )}
            </ScrollArea>

            <form
              className="shrink-0 border-t border-surface-border p-4"
              onSubmit={submitPrompt}
            >
              <div className="flex items-end gap-2">
                <Textarea
                  ref={textareaRef}
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  onKeyDown={handleTextareaKeyDown}
                  placeholder="Ask ArchFlow to design, review, or refine..."
                  className="max-h-40 min-h-18 resize-none overflow-y-auto rounded-xl border-surface-border bg-subtle text-sm text-copy-primary placeholder:text-copy-faint"
                  rows={3}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="mb-0.5 bg-ai text-copy-primary hover:bg-ai/90"
                  aria-label="Send prompt"
                  disabled={!prompt.trim()}
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </form>
          </div>
        </TabsContent>

        <TabsContent value="specs" className="min-h-0">
          <div className="flex h-full min-h-0 flex-col gap-4 p-4">
            <Button
              type="button"
              className="w-full bg-ai text-copy-primary hover:bg-ai/90"
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Generate Spec
            </Button>

            <article className="rounded-2xl border border-surface-border bg-elevated p-4">
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-subtle text-ai-text">
                  <FileText className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-copy-primary">
                    Architecture Spec Draft
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-copy-muted">
                    A generated Markdown specification will summarize the
                    current canvas graph, component responsibilities, data flow,
                    and operational notes.
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4 w-full"
                disabled
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Download unavailable
              </Button>
            </article>
          </div>
        </TabsContent>
      </Tabs>
    </aside>
  );
}

function ArchitectEmptyState({
  onSelectPrompt,
}: {
  onSelectPrompt: (prompt: string) => void;
}) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center py-8 text-center">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-subtle text-ai-text">
        <Bot className="h-6 w-6" aria-hidden="true" />
      </div>
      <p className="mt-4 max-w-64 text-sm leading-6 text-copy-muted">
        Ask ArchFlow to draft, extend, or critique the architecture on this
        canvas.
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {STARTER_PROMPTS.map((starterPrompt) => (
          <button
            key={starterPrompt}
            type="button"
            className="rounded-xl bg-subtle px-3 py-2 text-xs font-medium text-ai-text transition-colors hover:bg-elevated"
            onClick={() => onSelectPrompt(starterPrompt)}
          >
            {starterPrompt}
          </button>
        ))}
      </div>
    </div>
  );
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[86%] rounded-2xl px-3.5 py-3 text-sm leading-6",
          isUser
            ? "border-2 border-brand/50 bg-accent-dim text-copy-primary"
            : "border border-surface-border bg-elevated text-ai-text",
        )}
      >
        {message.content}
      </div>
    </div>
  );
}
