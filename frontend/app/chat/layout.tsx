import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Desk Assistant — India Verified",
  description:
    "Ask the AI desk assistant about India Verified stories, credibility scores, and Indian news.",
};

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return children;
}