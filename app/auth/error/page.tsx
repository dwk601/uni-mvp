import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function AuthErrorPage({
  searchParams,
}: {
  searchParams: { message?: string };
}) {
  const errorMessage = searchParams.message || "An authentication error occurred";

  return (
    <div className="container flex items-center justify-center min-h-screen py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle>Authentication Error</CardTitle>
          </div>
          <CardDescription>
            There was a problem with your authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{errorMessage}</p>
          <div className="flex gap-2">
            <Button asChild className="flex-1">
              <Link href="/signup">Try Again</Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/">Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
