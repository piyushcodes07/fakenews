import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ResultsProps {
  result: {
    text: string
  }
}

export default function Results({ result }: ResultsProps) {
  // Extract the percentage from the result text
  const percentageMatch = result.text.match(/(\d+(?:\.\d+)?)%/)
  const percentage = percentageMatch ? percentageMatch[1] : null

  const getColorClass = (percentage: number) => {
    if (percentage <= 30) return "text-green-500"
    if (percentage <= 70) return "text-yellow-500"
    return "text-red-500"
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Verification Result</CardTitle>
      </CardHeader>
      <CardContent>
        {percentage && (
          <p className="text-2xl font-bold mb-4">
            Likelihood of being fake news:
            <span className={getColorClass(Number.parseFloat(percentage))}> {percentage}%</span>
          </p>
        )}
        <p>{result.text}</p>
      </CardContent>
    </Card>
  )
}

