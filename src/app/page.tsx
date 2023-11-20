"use client";

import { ChatMessage } from "humanloop";
import * as React from "react";
import Link from 'next/link';

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

    const newMessages: ChatMessage[] = [
      ...messages,
      userMessage,
      { role: "assistant", content: "" },
    ];

    setMessages(newMessages);

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newMessages),
    });

    if (!response.body) throw Error();

    const decoder = new TextDecoder();
    const reader = response.body.getReader();
    let done = false;
    while (!done) {
      const chunk = await reader.read();
      const value = chunk.value;
      done = chunk.done;
      const val = decoder.decode(value);
      const json_chunks = val
        .split("}{")
        .map(
          (s) =>
            (s.startsWith("{") ? "" : "{") + s + (s.endsWith("}") ? "" : "}")
        );
      const tokens = json_chunks.map((s) => JSON.parse(s).output).join("");

      setMessages((messages) => {
        const updatedLastMessage = messages.slice(-1)[0];

        return [
          ...messages.slice(0, -1),
          {
            ...updatedLastMessage,
            content: updatedLastMessage.content + tokens,
          },
        ];
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSend();
    }
  };
  const Menu = () => {
    const [isOpen, setIsOpen] = useState(false);
  
    const toggleMenu = () => {
      setIsOpen(!isOpen);
    };

    return (
      <div className="relative ml-auto">
        <button
          onClick={toggleMenu}
          className="bg-blue-500 text-white py-2 px-4 rounded-lg focus:outline-none relative z-10"
        >
          Menu
        </button>
        {isOpen && (
          <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-300 rounded shadow-lg">
            <ul>
              {/* Links for Chatbot, Contact Lawyers, and Document Analysis */}
              <li className="px-4 py-2">
                <Link href="/">
                  Chatbot
                </Link>
              </li>
              <li className="px-4 py-2">
                <Link href="/">
                  Document Analysis
                </Link>
              </li>
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex justify-end pt-4 pr-4">
      {/* Integration of Menu component */}
      <div className="flex justify-end">
        <Menu />
      </div>
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
        <div className="w-full fixed bottom-0 bg-white border-t border-gray-300">
          <div className="max-w-screen-lg mx-auto px-4 py-2 flex items-center">
            <div className="min-w-[70px] uppercase text-xs text-gray-500 dark:text-gray-300 pt-2">
              You
            </div>
            <div className="flex-grow">
              <input
                className="w-full px-4 py-1 mr-3 leading-tight text-gray-700 bg-transparent border-none appearance-none dark:text-gray-200 focus:outline-none"
                type="text"
                placeholder="Type your message here..."
                aria-label="Prompt"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e)}
                style={{ width: "calc(100% - 200px)" }} // Adjust width here
              ></input>
            </div>
            <button
              className="px-3 font-medium text-gray-500 uppercase border border-gray-300 rounded dark:border-gray-100 dark:text-gray-200 hover:border-blue-500 hover:text-blue-500"
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
      <div className="pl-4 whitespace-pre-line">{msg.content}</div>
    </div>
  );
};
