"use client";

import { Message } from "ai";
import { cn } from "@/lib/utils";
import { User, Loader2 } from "lucide-react";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
}

const TOOL_LABELS: Record<string, string> = {
  str_replace_editor: "Writing code",
  file_manager: "Managing files",
};

export function MessageList({ messages, isLoading }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 px-4 text-center">
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[#f5f0eb] mb-4 shadow-sm">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 3C8.477 3 4 7.477 4 13c0 2.316.787 4.45 2.107 6.15L4.5 23.5l4.572-1.536A9.953 9.953 0 0 0 14 23c5.523 0 10-4.477 10-10S19.523 3 14 3Z" fill="url(#claude-gradient)"/>
            <path d="M10.5 11.5h7M10.5 14h7M10.5 16.5h4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            <defs>
              <linearGradient id="claude-gradient" x1="4" y1="3" x2="24" y2="23" gradientUnits="userSpaceOnUse">
                <stop stopColor="#E8835A"/>
                <stop offset="1" stopColor="#C96A3A"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <p className="text-neutral-900 font-semibold text-lg mb-2">Start a conversation to generate React components</p>
        <p className="text-neutral-500 text-sm max-w-sm">I can help you create buttons, forms, cards, and more</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto px-4 py-6">
      <div className="space-y-6 max-w-4xl mx-auto w-full">
        {messages.map((message) => (
          <div
            key={message.id || message.content}
            className={cn(
              "flex gap-4",
              message.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            {message.role === "assistant" && (
              <div className="flex-shrink-0">
                <div className="w-9 h-9 rounded-lg bg-[#f5f0eb] border border-orange-100 shadow-sm flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 3C8.477 3 4 7.477 4 13c0 2.316.787 4.45 2.107 6.15L4.5 23.5l4.572-1.536A9.953 9.953 0 0 0 14 23c5.523 0 10-4.477 10-10S19.523 3 14 3Z" fill="url(#claude-gradient-sm)"/>
                    <path d="M10.5 11.5h7M10.5 14h7M10.5 16.5h4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                    <defs>
                      <linearGradient id="claude-gradient-sm" x1="4" y1="3" x2="24" y2="23" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#E8835A"/>
                        <stop offset="1" stopColor="#C96A3A"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
            )}
            
            <div className={cn(
              "flex flex-col gap-2 max-w-[85%]",
              message.role === "user" ? "items-end" : "items-start"
            )}>
              <div className={cn(
                "rounded-xl px-4 py-3",
                message.role === "user" 
                  ? "bg-blue-600 text-white shadow-sm" 
                  : "bg-white text-neutral-900 border border-neutral-200 shadow-sm"
              )}>
                <div className="text-sm">
                  {message.parts ? (
                    <>
                      {message.parts.map((part, partIndex) => {
                        switch (part.type) {
                          case "text":
                            return message.role === "user" ? (
                              <span key={partIndex} className="whitespace-pre-wrap">{part.text}</span>
                            ) : (
                              <MarkdownRenderer
                                key={partIndex}
                                content={part.text}
                                className="prose-sm"
                              />
                            );
                          case "reasoning":
                            return (
                              <div key={partIndex} className="mt-3 p-3 bg-white/50 rounded-md border border-neutral-200">
                                <span className="text-xs font-medium text-neutral-600 block mb-1">Reasoning</span>
                                <span className="text-sm text-neutral-700">{part.reasoning}</span>
                              </div>
                            );
                          case "tool-invocation":
                            const tool = part.toolInvocation;
                            return (
                              <div key={partIndex} className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
                                {tool.state === "result" && tool.result ? (
                                  <>
                                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                    <span className="text-neutral-700">{TOOL_LABELS[tool.toolName] ?? tool.toolName}</span>
                                  </>
                                ) : (
                                  <>
                                    <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
                                    <span className="text-neutral-700">{TOOL_LABELS[tool.toolName] ?? tool.toolName}</span>
                                  </>
                                )}
                              </div>
                            );
                          case "source":
                            return (
                              <div key={partIndex} className="mt-2 text-xs text-neutral-500">
                                Source: {JSON.stringify(part.source)}
                              </div>
                            );
                          case "step-start":
                            return partIndex > 0 ? <hr key={partIndex} className="my-3 border-neutral-200" /> : null;
                          default:
                            return null;
                        }
                      })}
                      {isLoading &&
                        message.role === "assistant" &&
                        messages.indexOf(message) === messages.length - 1 && (
                          <div className="flex items-center gap-2 mt-3 text-neutral-500">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            <span className="text-sm">Generating...</span>
                          </div>
                        )}
                    </>
                  ) : message.content ? (
                    message.role === "user" ? (
                      <span className="whitespace-pre-wrap">{message.content}</span>
                    ) : (
                      <MarkdownRenderer content={message.content} className="prose-sm" />
                    )
                  ) : isLoading &&
                    message.role === "assistant" &&
                    messages.indexOf(message) === messages.length - 1 ? (
                    <div className="flex items-center gap-2 text-neutral-500">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span className="text-sm">Generating...</span>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
            
            {message.role === "user" && (
              <div className="flex-shrink-0">
                <div className="w-9 h-9 rounded-lg bg-blue-600 shadow-sm flex items-center justify-center">
                  <User className="h-4.5 w-4.5 text-white" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}