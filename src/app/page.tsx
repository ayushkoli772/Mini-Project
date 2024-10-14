"use client";

import { ChatMessage } from "humanloop";
import * as React from "react";
import Link from 'next/link';
import ReactMarkdown from "react-markdown";

const { useState } = React;

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");

  const onSend = async () => {
    const userMessage: ChatMessage = {
      role: "user",
      content: inputValue,
    };

    setInputValue("");

    const newMessages = [...messages, userMessage];

    setMessages(newMessages);

    const content = newMessages[newMessages.length - 1].content;

    const response = await fetch("https://ai-lawyer-99mp.onrender.com/chat", {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
      },
      body: content,
    });

    const res = await response.text();

    const assistantMessage: ChatMessage = {
      role: "assistant",
      content: res,
    
    };
    setMessages([...newMessages, assistantMessage]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSend();
    }
  };

  return (
    <div className="flex justify-end pt-4 pr-4">
      {/* Integration of Menu component */}
      {/* Main content */}
      <main className="flex flex-col items-center min-h-screen p-8 md:p-24 w-full">
        <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Legal Assistant
        </h1>
        <div className="flex-col w-full mt-8 overflow-y-auto pb-16">
          {/* Chat messages */}
          <div>
            {messages.map((msg, idx) => (
              <MessageRow key={idx} msg={msg}></MessageRow>
            ))}
          </div>
        </div>
  
        {/* User input area */}
        <div className="w-full fixed bottom-4 left-0 right-0 flex justify-center">
          <div className="w-full max-w-screen-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg p-4 mx-4 flex items-center">
            <input
              className="flex-grow bg-transparent px-4 py-2 text-gray-900 dark:text-gray-900 rounded-lg outline-none"
              type="text"
              placeholder="Type your message here..."
              aria-label="Prompt"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e)}
            />
            <button
              className="ml-3 px-4 py-2 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500 focus:outline-none"
              onClick={() => onSend()}
            >
              Send
            </button>
          </div>
        </div>
      </main>
    </div>

  );
}

interface MessageRowProps {
  msg: ChatMessage;
}

const MessageRow: React.FC<MessageRowProps> = ({ msg }) => {
  return (
    <div className="flex pb-4 mb-4 border-b border-gray-300">
      <div className="min-w-[80px] uppercase text-xs text-gray-500 leading-tight pt-1">
        {msg.role}
      </div>
      <div className="pl-4 whitespace-pre-line">
        {/* Use ReactMarkdown to render the Markdown content */}
        <ReactMarkdown>{msg.content}</ReactMarkdown>
      </div>
    </div>
  );
};
