/**
 * SortableInstitutionList Component
 * Institution list with sorting controls
 */

"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpDown, ArrowUp, ArrowDown, SortAsc } from "lucide-react";
import { InstitutionList } from "./institution-list";
import type { Institution } from "@/types/database";
import {
  sortInstitutions,
  toggleSortDirection,
  type SortConfig,
  type SortField,
  type SortDirection,
} from "@/lib/utils/sort-institutions";

interface SortableInstitutionListProps {
  institutions: Institution[];
  variant?: "card" | "table";
  className?: string;
  defaultSort?: SortConfig;
}

const SORT_OPTIONS: Array<{ value: SortField; label: string }> = [
  { value: "name", label: "Institution Name" },
  { value: "city", label: "City" },
  { value: "state", label: "State" },
  { value: "rank", label: "Ranking" },
  { value: "level", label: "Institution Level" },
  { value: "control", label: "Control Type" },
  { value: "created", label: "Date Created" },
  { value: "updated", label: "Date Updated" },
];

export function SortableInstitutionList({
  institutions,
  variant = "card",
  className = "",
  defaultSort = { field: "name", direction: "asc" },
}: SortableInstitutionListProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>(defaultSort);

  const sortedInstitutions = useMemo(() => {
    return sortInstitutions(institutions, sortConfig);
  }, [institutions, sortConfig]);

  const handleSortChange = (field: SortField) => {
    setSortConfig((prev) => ({
      field,
      direction: prev.field === field ? toggleSortDirection(prev.direction) : "asc",
    }));
  };

  const handleDirectionToggle = () => {
    setSortConfig((prev) => ({
      ...prev,
      direction: toggleSortDirection(prev.direction),
    }));
  };

  const currentSortLabel =
    SORT_OPTIONS.find((opt) => opt.value === sortConfig.field)?.label || "Sort By";

  return (
    <div className="space-y-4">
      {/* Sort Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SortAsc className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Sorted by <span className="font-medium text-foreground">{currentSortLabel}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDirectionToggle}
            aria-label={`Sort ${sortConfig.direction === "asc" ? "descending" : "ascending"}`}
          >
            {sortConfig.direction === "asc" ? (
              <>
                <ArrowUp className="h-4 w-4 mr-2" />
                Ascending
              </>
            ) : (
              <>
                <ArrowDown className="h-4 w-4 mr-2" />
                Descending
              </>
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                Sort By
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Sort By Field</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {SORT_OPTIONS.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => handleSortChange(option.value)}
                  className={sortConfig.field === option.value ? "bg-muted" : ""}
                >
                  {option.label}
                  {sortConfig.field === option.value && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      {sortConfig.direction === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {sortedInstitutions.length} institution{sortedInstitutions.length !== 1 ? "s" : ""}
      </div>

      {/* Institution List */}
      <InstitutionList
        institutions={sortedInstitutions}
        variant={variant}
        className={className}
      />
    </div>
  );
}
