import type { Metadata } from "next"
import Editor from "@/components/editor"

export const metadata: Metadata = {
  title: "Positron-Create",
  description: "A web-based design tool for creating beautiful graphics",
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Editor />
    </div>
  )
}

