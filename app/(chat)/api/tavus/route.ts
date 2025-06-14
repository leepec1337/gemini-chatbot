import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";

export async function POST(request: Request) {
  const session = await auth();

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const TAVUS_API_KEY = process.env.TAVUS_API_KEY;
  const TAVUS_REPLICA_ID = process.env.TAVUS_REPLICA_ID;

  if (!TAVUS_API_KEY || !TAVUS_REPLICA_ID) {
    return NextResponse.json({ error: "Tavus API key or Replica ID is not configured" }, { status: 500 });
  }

  try {
    const response = await fetch("https://tavusapi.com/v2/conversations", {
      method: "POST",
      headers: {
        "x-api-key": TAVUS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ replica_id: TAVUS_REPLICA_ID }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: "Failed to create Tavus conversation", details: errorData }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ conversation_url: data.conversation_url });

  } catch (error) {
    return NextResponse.json({ error: "An error occurred while creating the Tavus conversation" }, { status: 500 });
  }
}