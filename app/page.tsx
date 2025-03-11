"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Results from "./components/Results"
import Loading from "./components/Loading"

export default function Home() {
  const [query, setQuery] = useState("")
  const [result, setResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [phone, setPhone] = useState("")


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setResult(null)

    try {
      const response = await fetch("/api/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query,phone }),
      })

      if (!response.ok) {
        throw new Error("Failed to verify news")
      }

      const data = await response.json()
      setResult(data.result)
    } catch (err) {
      setError("An error occurred while verifying the news. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Fake News Flagger</CardTitle>
          <CardDescription>Enter a news article or claim to verify its authenticity</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter news article or claim"
              required
            />
            <Input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter phone"
              required
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Verifying..." : "Verify"}
            </Button>
          </form>

          {isLoading && <Loading />}
          {error && <p className="text-red-500 mt-4">{error}</p>}
          {result && <Results result={result} />}
        </CardContent>
      </Card>
    </main>
  )
}

