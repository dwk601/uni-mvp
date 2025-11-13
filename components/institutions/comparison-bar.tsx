"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useComparisonStore } from "@/lib/stores/comparison-store";
import { X, ArrowRight } from "lucide-react";

export function ComparisonBar() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { selectedInstitutions, removeInstitution, clearAll, getSelectionCount } =
    useComparisonStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Avoid hydration mismatch
  }

  const count = getSelectionCount();

  if (count === 0) {
    return null;
  }

  const handleCompare = () => {
    if (count >= 2) {
      router.push("/compare");
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom-5">
      <Card className="max-w-6xl mx-auto p-4 shadow-lg border-2">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">
                Compare Schools
              </span>
              <Badge variant="secondary">
                {count}/3
              </Badge>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              {selectedInstitutions.map((institution) => (
                <Badge
                  key={institution.unitid}
                  variant="outline"
                  className="gap-1 pr-1"
                >
                  <span className="max-w-[150px] truncate">
                    {institution.institution_name}
                  </span>
                  <button
                    onClick={() => removeInstitution(institution.unitid)}
                    className="ml-1 hover:bg-destructive/20 rounded-full p-0.5 transition-colors"
                    aria-label={`Remove ${institution.institution_name}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
            >
              Clear All
            </Button>
            <Button
              onClick={handleCompare}
              disabled={count < 2}
              size="sm"
            >
              Compare
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
