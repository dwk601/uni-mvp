/**
 * SearchFilterPanel Component
 * Multi-criteria filtering UI for institution search
 */

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { X, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { useSearchFilters } from "@/lib/stores/search-filters-store";

// Mock data - in production, these would come from API
const AVAILABLE_STATES = [
  { code: "CA", name: "California" },
  { code: "NY", name: "New York" },
  { code: "TX", name: "Texas" },
  { code: "FL", name: "Florida" },
  { code: "MA", name: "Massachusetts" },
  { code: "IL", name: "Illinois" },
  { code: "PA", name: "Pennsylvania" },
];

const AVAILABLE_MAJORS = [
  { id: "cs", name: "Computer Science", category: "Technology" },
  { id: "business", name: "Business Administration", category: "Business" },
  { id: "engineering", name: "Engineering", category: "Technology" },
  { id: "medicine", name: "Medicine", category: "Health" },
  { id: "law", name: "Law", category: "Legal" },
  { id: "arts", name: "Liberal Arts", category: "Arts" },
];

const INSTITUTION_TYPES = [
  { value: "4-year", label: "4-year" },
  { value: "2-year", label: "2-year" },
  { value: "Less than 2-year", label: "Less than 2-year" },
];

interface SearchFilterPanelProps {
  onApplyFilters?: () => void;
}

export function SearchFilterPanel({ onApplyFilters }: SearchFilterPanelProps) {
  const [mounted, setMounted] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    location: true,
    majors: false,
    cost: false,
    type: false,
    ranking: false,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    countries,
    majors,
    costRange,
    institutionTypes,
    rankings,
    setCountries,
    setMajors,
    setCostRange,
    setInstitutionTypes,
    setRankings,
    clearAllFilters,
    hasActiveFilters,
    activeFilterCount,
  } = useSearchFilters();

  const [costValues, setCostValues] = useState([0, 100000]);
  const [rankingValues, setRankingValues] = useState([1, 500]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleStateChange = (stateCode: string, checked: boolean) => {
    if (checked) {
      setCountries([...countries.values, stateCode]);
    } else {
      setCountries(countries.values.filter((c) => c !== stateCode));
    }
  };

  const handleMajorChange = (majorId: string, checked: boolean) => {
    if (checked) {
      setMajors([...majors.values, majorId]);
    } else {
      setMajors(majors.values.filter((m) => m !== majorId));
    }
  };

  const handleTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      setInstitutionTypes([...institutionTypes.values, type]);
    } else {
      setInstitutionTypes(institutionTypes.values.filter((t) => t !== type));
    }
  };

  const handleApplyCostRange = () => {
    setCostRange({
      min: costValues[0],
      max: costValues[1],
      currency: "USD",
    });
  };

  const handleApplyRankings = () => {
    setRankings({
      min: rankingValues[0],
      max: rankingValues[1],
    });
  };

  const handleClearAll = () => {
    clearAllFilters();
    setCostValues([0, 100000]);
    setRankingValues([1, 500]);
  };

  const handleApply = () => {
    onApplyFilters?.();
  };

  const FilterSection = ({
    id,
    title,
    children,
  }: {
    id: string;
    title: string;
    children: React.ReactNode;
  }) => (
    <div className="border-b last:border-0">
      <button
        onClick={() => toggleSection(id)}
        className="flex items-center justify-between w-full p-4 hover:bg-muted/50 transition-colors"
      >
        <span className="font-medium">{title}</span>
        {expandedSections[id] ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>
      {expandedSections[id] && <div className="p-4 pt-0 space-y-3">{children}</div>}
    </div>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <CardTitle>Filters</CardTitle>
            {mounted && activeFilterCount() > 0 && (
              <Badge variant="secondary">
                {activeFilterCount()}
              </Badge>
            )}
          </div>
          {mounted && hasActiveFilters() && (
            <Button variant="ghost" size="sm" onClick={handleClearAll}>
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Location Filter */}
        <FilterSection id="location" title="Location (State)">
          <div className="space-y-2">
            {AVAILABLE_STATES.map((state) => (
              <div key={state.code} className="flex items-center space-x-2">
                <Checkbox
                  id={`state-${state.code}`}
                  checked={countries.values.includes(state.code)}
                  onCheckedChange={(checked) =>
                    handleStateChange(state.code, checked as boolean)
                  }
                />
                <Label
                  htmlFor={`state-${state.code}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {state.name}
                </Label>
              </div>
            ))}
          </div>
        </FilterSection>

        {/* Major Filter */}
        <FilterSection id="majors" title="Major / Field of Study">
          <div className="space-y-2">
            {AVAILABLE_MAJORS.map((major) => (
              <div key={major.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`major-${major.id}`}
                  checked={majors.values.includes(major.id)}
                  onCheckedChange={(checked) =>
                    handleMajorChange(major.id, checked as boolean)
                  }
                />
                <Label
                  htmlFor={`major-${major.id}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {major.name}
                  <span className="text-muted-foreground ml-1">({major.category})</span>
                </Label>
              </div>
            ))}
          </div>
        </FilterSection>

        {/* Cost Range Filter */}
        <FilterSection id="cost" title="Tuition Cost Range">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span>${costValues[0].toLocaleString()}</span>
              <span>${costValues[1].toLocaleString()}</span>
            </div>
            <Slider
              min={0}
              max={100000}
              step={5000}
              value={costValues}
              onValueChange={setCostValues}
              className="w-full"
            />
            <Button variant="outline" size="sm" onClick={handleApplyCostRange} className="w-full">
              Apply Cost Range
            </Button>
          </div>
        </FilterSection>

        {/* Institution Type Filter */}
        <FilterSection id="type" title="Institution Type">
          <div className="space-y-2">
            {INSTITUTION_TYPES.map((type) => (
              <div key={type.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`type-${type.value}`}
                  checked={institutionTypes.values.includes(type.value as any)}
                  onCheckedChange={(checked) =>
                    handleTypeChange(type.value, checked as boolean)
                  }
                />
                <Label
                  htmlFor={`type-${type.value}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {type.label}
                </Label>
              </div>
            ))}
          </div>
        </FilterSection>

        {/* Ranking Filter */}
        <FilterSection id="ranking" title="Ranking Range">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span>Rank {rankingValues[0]}</span>
              <span>Rank {rankingValues[1]}</span>
            </div>
            <Slider
              min={1}
              max={500}
              step={10}
              value={rankingValues}
              onValueChange={setRankingValues}
              className="w-full"
            />
            <Button variant="outline" size="sm" onClick={handleApplyRankings} className="w-full">
              Apply Ranking Range
            </Button>
          </div>
        </FilterSection>

        {/* Apply Filters Button */}
        <div className="p-4 border-t">
          <Button onClick={handleApply} className="w-full">
            Apply Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
