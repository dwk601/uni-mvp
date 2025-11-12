"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTheme } from "@/components/providers/theme-provider";
import { Moon, Sun, Check } from "lucide-react";

export default function ComponentsTestPage() {
  const { theme, setTheme } = useTheme();

  const sampleUniversities = [
    {
      id: 1,
      name: "Massachusetts Institute of Technology",
      location: "Massachusetts, USA",
      acceptanceRate: "3.5%",
      tuition: "$59,750",
    },
    {
      id: 2,
      name: "Stanford University",
      location: "California, USA",
      acceptanceRate: "3.7%",
      tuition: "$61,731",
    },
    {
      id: 3,
      name: "Harvard University",
      location: "Massachusetts, USA",
      acceptanceRate: "3.2%",
      tuition: "$57,261",
    },
  ];

  return (
    <div className="min-h-screen p-8 space-y-8">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">shadcnUI Component Test</h1>
          <p className="text-muted-foreground mt-2">
            Testing Button, Card, Table, and Dialog components
          </p>
        </div>
        
        {/* Theme Switcher */}
        <div className="flex gap-2">
          <Button
            variant={theme === "light" ? "default" : "outline"}
            size="icon"
            onClick={() => setTheme("light")}
          >
            <Sun className="h-[1.2rem] w-[1.2rem]" />
          </Button>
          <Button
            variant={theme === "dark" ? "default" : "outline"}
            size="icon"
            onClick={() => setTheme("dark")}
          >
            <Moon className="h-[1.2rem] w-[1.2rem]" />
          </Button>
          <Button
            variant={theme === "system" ? "default" : "outline"}
            onClick={() => setTheme("system")}
          >
            System
          </Button>
        </div>
      </div>

      {/* Button Variants Section */}
      <Card>
        <CardHeader>
          <CardTitle>Button Component</CardTitle>
          <CardDescription>
            All button variants with different sizes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button>Default</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <Button size="lg">Large</Button>
            <Button>Default</Button>
            <Button size="sm">Small</Button>
            <Button size="icon">
              <Check className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card description goes here</CardDescription>
          </CardHeader>
          <CardContent>
            <p>This is a basic card with header and content.</p>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Action Button</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
            <CardDescription>Key metrics at a glance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Universities:</span>
                <span className="font-bold">2,388</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">States:</span>
                <span className="font-bold">50</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Majors:</span>
                <span className="font-bold">600+</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Access</CardTitle>
            <CardDescription>Common actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              Search Universities
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Compare Options
            </Button>
            <Button variant="outline" className="w-full justify-start">
              View Saved
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Table Section */}
      <Card>
        <CardHeader>
          <CardTitle>Table Component</CardTitle>
          <CardDescription>Sample university data in a table</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>Top 3 Universities by Selectivity</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">ID</TableHead>
                <TableHead>University Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Acceptance Rate</TableHead>
                <TableHead className="text-right">Annual Tuition</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleUniversities.map((uni) => (
                <TableRow key={uni.id}>
                  <TableCell className="font-medium">{uni.id}</TableCell>
                  <TableCell>{uni.name}</TableCell>
                  <TableCell>{uni.location}</TableCell>
                  <TableCell>{uni.acceptanceRate}</TableCell>
                  <TableCell className="text-right">{uni.tuition}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog Section */}
      <Card>
        <CardHeader>
          <CardTitle>Dialog (Modal) Component</CardTitle>
          <CardDescription>Click to open a dialog</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button>Open Simple Dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>University Details</DialogTitle>
                <DialogDescription>
                  This is a modal dialog showing detailed information.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">About MIT</h4>
                  <p className="text-sm text-muted-foreground">
                    The Massachusetts Institute of Technology is a private land-grant
                    research university in Cambridge, Massachusetts.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Key Facts</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Founded: 1861</li>
                    <li>• Students: 11,934</li>
                    <li>• Faculty: 1,074</li>
                  </ul>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline">Learn More</Button>
                <Button>Save to Favorites</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Open Confirmation Dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you sure?</DialogTitle>
                <DialogDescription>
                  This action will add MIT to your saved universities list.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button variant="default">Confirm</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Accessibility Features */}
      <Card>
        <CardHeader>
          <CardTitle>Accessibility Features ✓</CardTitle>
          <CardDescription>
            All components are built with accessibility in mind
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 mt-0.5 text-green-600 dark:text-green-400" />
              <span>Keyboard navigation support (Tab, Enter, Escape)</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 mt-0.5 text-green-600 dark:text-green-400" />
              <span>ARIA labels and roles properly implemented</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 mt-0.5 text-green-600 dark:text-green-400" />
              <span>Focus indicators visible and clear</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 mt-0.5 text-green-600 dark:text-green-400" />
              <span>Screen reader compatible</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 mt-0.5 text-green-600 dark:text-green-400" />
              <span>Color contrast meets WCAG AA standards</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
