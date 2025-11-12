"use client";

/**
 * Signup Page
 * 
 * Free account creation with email verification.
 * Target: < 30 second signup time
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { signupSchema, type SignupFormData, countries, commonMajors } from "@/lib/auth/schemas";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      country: '',
      intendedMajor: '',
      testType: "None" as const,
      testScore: '',
    },
    mode: 'onBlur', // Validate on blur for better UX
    reValidateMode: 'onChange', // Re-validate on change after first validation
  });

  async function onSubmit(data: any) {
    // data has transformed types: testScore is number | null
    setIsLoading(true);
    setError(null);

    try {
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Signup failed");
      }

      // Successfully created account
      setIsSuccess(true);
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          setError("Request timed out. Please check your connection and try again.");
        } else {
          setError(err.message);
        }
      } else {
        setError("An error occurred during signup");
      }
    } finally {
      setIsLoading(false);
    }
  }

  if (isSuccess) {
    return (
      <div className="container flex items-center justify-center min-h-screen py-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Check Your Email</CardTitle>
            <CardDescription>
              We've sent you a verification email. Please check your inbox and click the verification link to
              complete your signup.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Didn't receive the email? Check your spam folder or{" "}
              <Button variant="link" className="p-0 h-auto" onClick={() => setIsSuccess(false)}>
                try again
              </Button>
              .
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container flex items-center justify-center min-h-screen py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Your Free Account</CardTitle>
          <CardDescription>
            Start discovering universities that match your goals. No credit card required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control as any}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        autoComplete="new-password"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      At least 8 characters with uppercase, lowercase, and number
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="intendedMajor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Intended Major</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your intended major" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {commonMajors.map((major) => (
                          <SelectItem key={major} value={major}>
                            {major}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="testType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>English Test (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || "None"}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select test type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="None">None</SelectItem>
                        <SelectItem value="TOEFL">TOEFL</SelectItem>
                        <SelectItem value="IELTS">IELTS</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch("testType") && form.watch("testType") !== "None" && (
                <FormField
                  control={form.control as any}
                  name="testScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {form.watch("testType")} Score 
                        <span className="text-muted-foreground text-xs ml-1">
                          ({form.watch("testType") === "TOEFL" ? "0-120" : "0-9"})
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder={form.watch("testType") === "TOEFL" ? "e.g., 110" : "e.g., 7.5"}
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {error && (
                <div className="rounded-md bg-destructive/15 p-3">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>

              <p className="text-sm text-center text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  Log in
                </Link>
              </p>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
