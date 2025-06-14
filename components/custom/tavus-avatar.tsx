"use client";

import { useEffect, useState } from "react";

export function TavusAvatar() {
  const [conversationUrl, setConversationUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const createConversation = async () => {
      try {
        const response = await fetch("/api/tavus", {
          method: "POST",
        });
        const data = await response.json();
        if (data.conversation_url) {
          setConversationUrl(data.conversation_url);
        } else {
          setError(data.error || "Failed to get conversation URL");
        }
      } catch (error) {
        console.error("Failed to create Tavus conversation", error);
        setError("Failed to create Tavus conversation");
      }
    };

    createConversation();
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!conversationUrl) {
    return <div>Loading Tavus Avatar...</div>;
  }

  return (
    <iframe
      src={conversationUrl}
      allow="camera; microphone; fullscreen"
      style={{ width: "100%", height: "500px", border: "none", borderRadius: "1rem" }}
    ></iframe>
  );
}