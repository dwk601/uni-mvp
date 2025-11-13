/**
 * InstitutionList Component
 * Displays a clean, scrollable list of institutions with key international information
 */

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, MapPin, TrendingUp, Users, DollarSign } from "lucide-react";
import { AddToComparisonButton } from "./add-to-comparison-button";
import type { Institution } from "@/types/database";

export interface InstitutionListProps {
  institutions: Institution[];
  variant?: "card" | "table";
  className?: string;
}

export function InstitutionList({
  institutions,
  variant = "card",
  className = "",
}: InstitutionListProps) {
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const toggleExpanded = (unitid: number) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(unitid)) {
        newSet.delete(unitid);
      } else {
        newSet.add(unitid);
      }
      return newSet;
    });
  };

  if (variant === "card") {
    return (
      <div className={`space-y-4 ${className}`}>
        {institutions.map((institution) => (
          <InstitutionCard
            key={institution.unitid}
            institution={institution}
            isExpanded={expandedIds.has(institution.unitid)}
            onToggle={() => toggleExpanded(institution.unitid)}
          />
        ))}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Institution Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Control</TableHead>
                <TableHead className="text-right">Rank</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {institutions.map((institution) => (
                <InstitutionTableRow
                  key={institution.unitid}
                  institution={institution}
                  isExpanded={expandedIds.has(institution.unitid)}
                  onToggle={() => toggleExpanded(institution.unitid)}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

interface InstitutionCardProps {
  institution: Institution;
  isExpanded: boolean;
  onToggle: () => void;
}

function InstitutionCard({ institution, isExpanded, onToggle }: InstitutionCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold truncate">{institution.institution_name}</h3>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">
                {institution.city}, {institution.state_code}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {institution.rank && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                #{institution.rank}
              </Badge>
            )}
            <AddToComparisonButton
              institution={institution}
              variant="button"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              aria-label={isExpanded ? "Collapse details" : "Expand details"}
              aria-expanded={isExpanded}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Always Visible Info */}
        <div className="flex flex-wrap gap-2 mb-3">
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

        {/* Expandable Details */}
        {isExpanded && (
          <div
            className="pt-3 border-t space-y-3 animate-in slide-in-from-top-2"
            role="region"
            aria-label="Additional institution details"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-medium text-muted-foreground">Unit ID:</span>
                <span className="ml-2">{institution.unitid}</span>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Level:</span>
                <span className="ml-2">{institution.level_of_institution || "N/A"}</span>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Control:</span>
                <span className="ml-2">{institution.control_of_institution || "N/A"}</span>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Urbanization:</span>
                <span className="ml-2">{institution.degree_of_urbanization || "N/A"}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button size="sm" variant="default">
                View Full Details
              </Button>
              <Button size="sm" variant="outline">
                Compare
              </Button>
              <Button size="sm" variant="outline">
                Save
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface InstitutionTableRowProps {
  institution: Institution;
  isExpanded: boolean;
  onToggle: () => void;
}

function InstitutionTableRow({ institution, isExpanded, onToggle }: InstitutionTableRowProps) {
  return (
    <>
      <TableRow className="hover:bg-muted/50">
        <TableCell>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            aria-label={isExpanded ? "Collapse details" : "Expand details"}
            aria-expanded={isExpanded}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </TableCell>
        <TableCell className="font-medium">{institution.institution_name}</TableCell>
        <TableCell>
          {institution.city}, {institution.state_code}
        </TableCell>
        <TableCell>
          <Badge variant="outline">{institution.level_of_institution || "N/A"}</Badge>
        </TableCell>
        <TableCell>
          <Badge variant="outline">{institution.control_of_institution || "N/A"}</Badge>
        </TableCell>
        <TableCell className="text-right">
          {institution.rank ? (
            <Badge variant="secondary">#{institution.rank}</Badge>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </TableCell>
      </TableRow>

      {/* Expanded Row */}
      {isExpanded && (
        <TableRow>
          <TableCell colSpan={6} className="bg-muted/30">
            <div
              className="py-4 space-y-3 animate-in slide-in-from-top-2"
              role="region"
              aria-label="Additional institution details"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium text-muted-foreground block mb-1">Unit ID</span>
                  <span>{institution.unitid}</span>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground block mb-1">
                    Urbanization
                  </span>
                  <span>{institution.degree_of_urbanization || "N/A"}</span>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground block mb-1">Created</span>
                  <span>{new Date(institution.created_at).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground block mb-1">Updated</span>
                  <span>{new Date(institution.updated_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="default">
                  View Full Details
                </Button>
                <Button size="sm" variant="outline">
                  Compare
                </Button>
                <Button size="sm" variant="outline">
                  Save
                </Button>
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
