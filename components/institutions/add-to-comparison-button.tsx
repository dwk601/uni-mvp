"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useComparisonStore } from "@/lib/stores/comparison-store";
import type { Institution } from "@/types/database";
import { Plus, Check } from "lucide-react";

interface AddToComparisonButtonProps {
  institution: Institution;
  variant?: "button" | "checkbox";
  className?: string;
}

export function AddToComparisonButton({
  institution,
  variant = "button",
  className = "",
}: AddToComparisonButtonProps) {
  const [mounted, setMounted] = useState(false);
  const { addInstitution, removeInstitution, isSelected, canAddMore } =
    useComparisonStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Avoid hydration mismatch
  }

  const selected = isSelected(institution.unitid);
  const canAdd = canAddMore();

  const handleToggle = () => {
    if (selected) {
      removeInstitution(institution.unitid);
    } else {
      const added = addInstitution(institution);
      if (!added && !selected) {
        // Show feedback that max limit reached
        alert("Maximum 3 schools can be compared at once");
      }
    }
  };

  if (variant === "checkbox") {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Checkbox
          id={`compare-${institution.unitid}`}
          checked={selected}
          onCheckedChange={handleToggle}
          disabled={!selected && !canAdd}
        />
        <label
          htmlFor={`compare-${institution.unitid}`}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
        >
          Compare
        </label>
      </div>
    );
  }

  return (
    <Button
      variant={selected ? "default" : "outline"}
      size="sm"
      onClick={handleToggle}
      disabled={!selected && !canAdd}
      className={className}
    >
      {selected ? (
        <>
          <Check className="h-4 w-4 mr-1" />
          Selected
        </>
      ) : (
        <>
          <Plus className="h-4 w-4 mr-1" />
          Compare
        </>
      )}
    </Button>
  );
}
