/**
 * SearchResults Component
 * Displays institution search results with real-time updates
 */

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, TrendingUp, DollarSign, Users } from "lucide-react";
import type { Institution } from "@/types/database";

interface SearchResultsProps {
  institutions: Institution[];
  total: number;
  isLoading: boolean;
  page: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
}

export function SearchResults({
  institutions,
  total,
  isLoading,
  page,
  totalPages,
  onPageChange,
}: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (institutions.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">
            No institutions found matching your criteria. Try adjusting your filters.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {institutions.length} of {total} institutions
        </p>
        <p className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </p>
      </div>

      {/* Results List */}
      {institutions.map((institution) => (
        <Card key={institution.unitid} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-1">{institution.institution_name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {institution.city}, {institution.state_code}
                    </span>
                  </div>
                </div>
                {institution.rank && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Rank #{institution.rank}
                  </Badge>
                )}
              </div>

              {/* Attributes */}
              <div className="flex flex-wrap gap-2">
                {institution.level_of_institution && (
                  <Badge variant="outline">{institution.level_of_institution}</Badge>
                )}
                {institution.control_of_institution && (
                  <Badge variant="outline">{institution.control_of_institution}</Badge>
                )}
                {institution.degree_of_urbanization && (
                  <Badge variant="outline">{institution.degree_of_urbanization}</Badge>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="default" size="sm">
                  View Details
                </Button>
                <Button variant="outline" size="sm">
                  Compare
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => onPageChange?.(page - 1)}
          >
            Previous
          </Button>
          <div className="flex items-center gap-1">
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const pageNum = i + 1;
              return (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange?.(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
            {totalPages > 5 && <span className="px-2">...</span>}
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={page === totalPages}
            onClick={() => onPageChange?.(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
