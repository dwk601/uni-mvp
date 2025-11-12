/**
 * Institution List Demo/Test Page
 * Tests data rendering and responsive behavior
 */

"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SortableInstitutionList } from "@/components/institutions/sortable-institution-list";
import type { Institution } from "@/types/database";

// Mock data for testing various scenarios
const mockInstitutions: Institution[] = [
  {
    unitid: 100654,
    institution_name: "University of California-Los Angeles",
    city: "Los Angeles",
    state_code: "CA",
    level_of_institution: "4-year",
    control_of_institution: "Public",
    degree_of_urbanization: "City",
    rank: 15,
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-11-01T14:30:00Z",
  },
  {
    unitid: 190150,
    institution_name: "Stanford University",
    city: "Stanford",
    state_code: "CA",
    level_of_institution: "4-year",
    control_of_institution: "Private nonprofit",
    degree_of_urbanization: "Suburb",
    rank: 3,
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-11-01T14:30:00Z",
  },
  {
    unitid: 166027,
    institution_name: "Massachusetts Institute of Technology",
    city: "Cambridge",
    state_code: "MA",
    level_of_institution: "4-year",
    control_of_institution: "Private nonprofit",
    degree_of_urbanization: "City",
    rank: 1,
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-11-01T14:30:00Z",
  },
  {
    unitid: 130794,
    institution_name: "Columbia University in the City of New York",
    city: "New York",
    state_code: "NY",
    level_of_institution: "4-year",
    control_of_institution: "Private nonprofit",
    degree_of_urbanization: "City",
    rank: 7,
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-11-01T14:30:00Z",
  },
  {
    unitid: 215062,
    institution_name: "University of Texas at Austin",
    city: "Austin",
    state_code: "TX",
    level_of_institution: "4-year",
    control_of_institution: "Public",
    degree_of_urbanization: "City",
    rank: 38,
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-11-01T14:30:00Z",
  },
];

// Edge case: Long name
const longNameInstitution: Institution = {
  unitid: 999991,
  institution_name:
    "The Very Long Name University of Advanced Technology and Scientific Research Institute for International Students",
  city: "Longville",
  state_code: "CA",
  level_of_institution: "4-year",
  control_of_institution: "Private nonprofit",
  degree_of_urbanization: "City",
  rank: null,
  created_at: "2024-01-15T10:00:00Z",
  updated_at: "2024-11-01T14:30:00Z",
};

// Edge case: Missing data
const missingDataInstitution: Institution = {
  unitid: 999992,
  institution_name: "Data-Missing University",
  city: "Unknown",
  state_code: "XX",
  level_of_institution: null,
  control_of_institution: null,
  degree_of_urbanization: null,
  rank: null,
  created_at: "2024-01-15T10:00:00Z",
  updated_at: "2024-11-01T14:30:00Z",
};

export default function InstitutionsPage() {
  const [dataSet, setDataSet] = useState<"normal" | "large" | "edge">("normal");

  const getLargeDataSet = (): Institution[] => {
    const large: Institution[] = [];
    for (let i = 0; i < 50; i++) {
      large.push({
        ...mockInstitutions[i % mockInstitutions.length],
        unitid: 100000 + i,
        institution_name: `${mockInstitutions[i % mockInstitutions.length].institution_name} ${
          i + 1
        }`,
      });
    }
    return large;
  };

  const getEdgeCaseDataSet = (): Institution[] => {
    return [...mockInstitutions, longNameInstitution, missingDataInstitution];
  };

  const getCurrentDataSet = (): Institution[] => {
    switch (dataSet) {
      case "large":
        return getLargeDataSet();
      case "edge":
        return getEdgeCaseDataSet();
      default:
        return mockInstitutions;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Institution List Display</h1>
        <p className="text-muted-foreground">
          Testing data rendering, sorting, and responsive behavior
        </p>
      </div>

      {/* Test Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Scenarios</CardTitle>
          <CardDescription>Switch between different data sets to test rendering</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant={dataSet === "normal" ? "default" : "outline"}
              onClick={() => setDataSet("normal")}
            >
              Normal Data (5 items)
            </Button>
            <Button
              variant={dataSet === "large" ? "default" : "outline"}
              onClick={() => setDataSet("large")}
            >
              Large Dataset (50 items)
            </Button>
            <Button
              variant={dataSet === "edge" ? "default" : "outline"}
              onClick={() => setDataSet("edge")}
            >
              Edge Cases (7 items)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Display Variants */}
      <Tabs defaultValue="card" className="space-y-4">
        <TabsList>
          <TabsTrigger value="card">Card View</TabsTrigger>
          <TabsTrigger value="table">Table View</TabsTrigger>
        </TabsList>

        <TabsContent value="card" className="space-y-4">
          <SortableInstitutionList
            institutions={getCurrentDataSet()}
            variant="card"
            defaultSort={{ field: "rank", direction: "asc" }}
          />
        </TabsContent>

        <TabsContent value="table" className="space-y-4">
          <SortableInstitutionList
            institutions={getCurrentDataSet()}
            variant="table"
            defaultSort={{ field: "name", direction: "asc" }}
          />
        </TabsContent>
      </Tabs>

      {/* Responsive Testing Guide */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Responsive Testing Checklist</CardTitle>
          <CardDescription>Manual testing steps for various devices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Mobile (320px - 639px)</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Cards stack vertically</li>
                <li>Text wraps appropriately</li>
                <li>Buttons are touch-friendly (44x44px minimum)</li>
                <li>Sort controls remain accessible</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Tablet (640px - 1023px)</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Optimized spacing and layout</li>
                <li>Table scrolls horizontally if needed</li>
                <li>Expanded content displays properly</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Desktop (1024px+)</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Full feature set visible</li>
                <li>Optimal spacing and readability</li>
                <li>Hover states work correctly</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
