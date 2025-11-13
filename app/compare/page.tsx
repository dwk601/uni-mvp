"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useComparisonStore } from "@/lib/stores/comparison-store";
import { exportToCSV } from "@/lib/utils/csv-export";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Download, X } from "lucide-react";
import type { Institution } from "@/types/database";

// Fields to display in comparison table
const comparisonFields = [
  { key: "institution_name", label: "Institution Name", category: "basic" },
  { key: "city", label: "City", category: "basic" },
  { key: "state_code", label: "State", category: "basic" },
  { key: "level_of_institution", label: "Institution Level", category: "basic" },
  { key: "control_of_institution", label: "Control Type", category: "basic" },
  { key: "rank", label: "Rank", category: "rankings", format: (val: any) => val ? `#${val}` : "N/A" },
  { key: "undergraduate_headcount", label: "Undergraduate Students", category: "enrollment", format: (val: any) => val?.toLocaleString() || "N/A" },
  { key: "percent_us_nonresident", label: "International Students %", category: "enrollment", format: (val: any) => val ? `${val}%` : "N/A" },
  { key: "percent_admitted", label: "Acceptance Rate %", category: "admissions", format: (val: any) => val ? `${val}%` : "N/A" },
  { key: "tuition_and_fees", label: "Tuition & Fees", category: "costs", format: (val: any) => val ? `$${val.toLocaleString()}` : "N/A" },
  { key: "total_price_out_of_state_on_campus", label: "Total Price (Out-of-State)", category: "costs", format: (val: any) => val ? `$${val.toLocaleString()}` : "N/A" },
  { key: "toefl_minimum", label: "Minimum TOEFL", category: "requirements", format: (val: any) => val || "N/A" },
  { key: "ielts_minimum", label: "Minimum IELTS", category: "requirements", format: (val: any) => val || "N/A" },
];

export default function ComparePage() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { selectedInstitutions, removeInstitution, clearAll } = useComparisonStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Redirect if less than 2 schools selected
    if (mounted && selectedInstitutions.length < 2) {
      router.push("/search");
    }
  }, [mounted, selectedInstitutions.length, router]);

  if (!mounted) {
    return null;
  }

  if (selectedInstitutions.length < 2) {
    return null; // Will redirect
  }

  const handleExport = () => {
    // Prepare data in transposed format (each row is a school, each column is a field)
    const exportData = selectedInstitutions.map((institution) => {
      const row: Record<string, any> = {};
      comparisonFields.forEach((field) => {
        row[field.key] = formatValue(institution, field);
      });
      return row;
    });

    // Export with formatted filename
    const timestamp = new Date().toISOString().split('T')[0];
    const schoolNames = selectedInstitutions
      .map(inst => inst.institution_name.replace(/[^a-zA-Z0-9]/g, '-'))
      .join('_')
      .substring(0, 50); // Limit filename length
    
    exportToCSV({
      filename: `school-comparison-${schoolNames}-${timestamp}.csv`,
      columns: comparisonFields.map(field => ({
        key: field.key,
        label: field.label,
      })),
      data: exportData,
    });
  };

  const formatValue = (institution: Institution, field: typeof comparisonFields[0]) => {
    const value = institution[field.key as keyof Institution];
    if (field.format) {
      return field.format(value);
    }
    return value?.toString() || "N/A";
  };

  // Check if values are different across institutions for a given field
  const hasDifferences = (fieldKey: string): boolean => {
    const values = selectedInstitutions.map(inst => inst[fieldKey as keyof Institution]);
    const uniqueValues = new Set(values.map(v => JSON.stringify(v)));
    return uniqueValues.size > 1;
  };

  // Get cell background class based on value comparison
  const getCellClass = (fieldKey: string, institution: Institution): string => {
    if (!hasDifferences(fieldKey)) {
      return ""; // No highlighting if all values are the same
    }

    const value = institution[fieldKey as keyof Institution];
    
    // For numeric comparisons, highlight best/worst
    if (typeof value === "number") {
      const values = selectedInstitutions
        .map(inst => inst[fieldKey as keyof Institution] as number)
        .filter(v => v != null);
      
      if (values.length === 0) return "";
      
      const max = Math.max(...values);
      const min = Math.min(...values);
      
      // For costs, lower is better
      if (fieldKey.includes("tuition") || fieldKey.includes("price") || fieldKey.includes("cost")) {
        if (value === min) return "bg-green-100 dark:bg-green-950/30";
        if (value === max) return "bg-red-100 dark:bg-red-950/30";
      }
      // For rank, lower number is better
      else if (fieldKey === "rank") {
        if (value === min) return "bg-green-100 dark:bg-green-950/30";
        if (value === max) return "bg-red-100 dark:bg-red-950/30";
      }
      // For other metrics (enrollment, acceptance rate, international %), higher is generally highlighted
      else {
        if (value === max) return "bg-blue-100 dark:bg-blue-950/30";
        if (value === min) return "bg-yellow-100 dark:bg-yellow-950/30";
      }
    }
    
    // For non-numeric differences, just use a neutral highlight
    return "bg-muted/40";
  };

  // Group fields by category
  const categories = Array.from(new Set(comparisonFields.map(f => f.category)));

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/search")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Search
          </Button>
          <h1 className="text-2xl font-bold">Compare Schools</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={clearAll}
          >
            Clear All
          </Button>
          <Button
            size="sm"
            onClick={handleExport}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Comparison Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="sticky top-0 z-10 bg-card border-b-2">
                  <th className="sticky left-0 z-20 bg-card border-r-2 p-4 text-left font-semibold min-w-[200px]">
                    Criteria
                  </th>
                  {selectedInstitutions.map((institution) => (
                    <th
                      key={institution.unitid}
                      className="p-4 text-left font-semibold min-w-[250px] relative"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="font-bold text-sm">
                            {institution.institution_name}
                          </div>
                          <div className="text-xs text-muted-foreground font-normal mt-1">
                            {institution.city}, {institution.state_code}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => removeInstitution(institution.unitid)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => {
                  const categoryFields = comparisonFields.filter(f => f.category === category);
                  return (
                    <React.Fragment key={category}>
                      {/* Category Header */}
                      <tr className="bg-muted/50">
                        <td
                          colSpan={selectedInstitutions.length + 1}
                          className="sticky left-0 p-3 font-semibold text-sm uppercase tracking-wide text-muted-foreground"
                        >
                          {category}
                        </td>
                      </tr>
                      {/* Category Fields */}
                      {categoryFields.map((field) => (
                        <tr key={field.key} className="border-b hover:bg-muted/20 transition-colors">
                          <td className="sticky left-0 z-10 bg-card border-r p-4 font-medium text-sm">
                            {field.label}
                          </td>
                          {selectedInstitutions.map((institution) => (
                            <td 
                              key={institution.unitid} 
                              className={`p-4 text-sm transition-colors ${getCellClass(field.key, institution)}`}
                            >
                              {formatValue(institution, field)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-sm">Color Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 dark:bg-green-950/30 border rounded" />
              <span>Best Value (costs) / Highest Rank</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 dark:bg-red-950/30 border rounded" />
              <span>Highest Cost / Lowest Rank</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-100 dark:bg-blue-950/30 border rounded" />
              <span>Highest Value (metrics)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-100 dark:bg-yellow-950/30 border rounded" />
              <span>Lowest Value (metrics)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <div className="mt-6 text-sm text-muted-foreground text-center">
        <p>Comparing {selectedInstitutions.length} school{selectedInstitutions.length !== 1 ? 's' : ''}. 
        {selectedInstitutions.length < 3 && " You can add up to " + (3 - selectedInstitutions.length) + " more from the search page."}</p>
      </div>
    </div>
  );
}
