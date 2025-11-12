"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ModerationActionDialog } from "@/components/moderation/moderation-action-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useModerationStore } from "@/lib/stores/moderation-store";
import { Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const contributionTypeLabels = {
  NEW_INSTITUTION: "New Institution",
  EDIT_INSTITUTION: "Edit Institution",
  NEW_MAJOR: "New Major",
  EDIT_DATA: "Edit Data",
  CORRECTION: "Correction",
};

const contributionTypeColors = {
  NEW_INSTITUTION: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  EDIT_INSTITUTION: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  NEW_MAJOR: "bg-green-500/10 text-green-700 dark:text-green-400",
  EDIT_DATA: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  CORRECTION: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
};

export default function ModerationPage() {
  const contributions = useModerationStore((state) => state.contributions);
  const selectedContributions = useModerationStore((state) => state.selectedContributions);
  const isLoading = useModerationStore((state) => state.isLoading);
  const error = useModerationStore((state) => state.error);

  const toggleSelection = useModerationStore((state) => state.toggleSelection);
  const selectAll = useModerationStore((state) => state.selectAll);
  const deselectAll = useModerationStore((state) => state.deselectAll);
  const fetchContributions = useModerationStore((state) => state.fetchContributions);

  // Compute derived values in the component
  const pendingContributions = contributions.filter((c) => c.status === "PENDING");
  const selectedCount = selectedContributions.size;
  const hasSelection = selectedContributions.size > 0;

  useEffect(() => {
    fetchContributions();
  }, [fetchContributions]);

  const allSelected = pendingContributions.length > 0 && 
    pendingContributions.every((c) => selectedContributions.has(c.id));

  const handleSelectAll = () => {
    if (allSelected) {
      deselectAll();
    } else {
      selectAll();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">Loading contributions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p className="font-semibold">Error loading contributions</p>
            </div>
            <p className="text-sm text-muted-foreground mt-2">{error}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => fetchContributions()}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Moderation Queue</h2>
          <p className="text-muted-foreground mt-2">
            Review and moderate pending user contributions
          </p>
        </div>
        
        {hasSelection && (
          <div className="flex gap-2 items-center">
            <span className="text-sm text-muted-foreground">
              {selectedCount} selected
            </span>
            <Button variant="outline" size="sm" onClick={deselectAll}>
              Clear Selection
            </Button>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Pending Contributions</CardTitle>
              <CardDescription>
                {pendingContributions.length} {pendingContributions.length === 1 ? 'item' : 'items'} awaiting review
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => fetchContributions()}>
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {pendingContributions.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-4" />
              <p className="text-lg font-semibold mb-2">All caught up!</p>
              <p className="text-muted-foreground">
                No pending contributions at this time
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Submitted By</TableHead>
                    <TableHead>Institution</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="w-24">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingContributions.map((contribution) => (
                    <TableRow
                      key={contribution.id}
                      className={
                        selectedContributions.has(contribution.id)
                          ? "bg-muted/50"
                          : ""
                      }
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedContributions.has(contribution.id)}
                          onCheckedChange={() => toggleSelection(contribution.id)}
                          aria-label={`Select ${contribution.id}`}
                        />
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={contributionTypeColors[contribution.type]}
                        >
                          {contributionTypeLabels[contribution.type]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{contribution.userName}</p>
                          <p className="text-xs text-muted-foreground">
                            {contribution.userEmail}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">
                          {contribution.data.institutionName || "N/A"}
                        </p>
                        {contribution.data.field && (
                          <p className="text-xs text-muted-foreground">
                            Field: {contribution.data.field}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <p className="text-sm max-w-xs truncate">
                          {contribution.data.description || "No description"}
                        </p>
                        {contribution.data.oldValue && contribution.data.newValue && (
                          <div className="text-xs text-muted-foreground mt-1 space-y-1">
                            <div className="flex items-center gap-1">
                              <XCircle className="h-3 w-3 text-red-500" />
                              <span className="line-through">
                                {String(contribution.data.oldValue)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3 text-green-500" />
                              <span>{String(contribution.data.newValue)}</span>
                            </div>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">
                          {formatDistanceToNow(new Date(contribution.submittedAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSelection(contribution.id)}
                        >
                          {selectedContributions.has(contribution.id)
                            ? "Deselect"
                            : "Select"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Moderation Action Buttons */}
      {hasSelection && (
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-lg mb-1">
                  {selectedCount} contribution{selectedCount > 1 ? "s" : ""} selected
                </p>
                <p className="text-sm text-muted-foreground">
                  Choose an action to perform on the selected items
                </p>
              </div>
              <div className="flex gap-2">
                <ModerationActions />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ModerationActions() {
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

  const selectedContributions = useModerationStore((state) => state.selectedContributions);
  const selectedCount = selectedContributions.size;
  const approveContributions = useModerationStore((state) => state.approveContributions);
  const rejectContributions = useModerationStore((state) => state.rejectContributions);

  const handleApprove = async (reason: string) => {
    const ids = Array.from(selectedContributions);
    // TODO: Replace with actual moderator info from auth
    await approveContributions(ids, reason, "moderator-1", "Admin User");
  };

  const handleReject = async (reason: string) => {
    const ids = Array.from(selectedContributions);
    // TODO: Replace with actual moderator info from auth
    await rejectContributions(ids, reason, "moderator-1", "Admin User");
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setRejectDialogOpen(true)}
        className="text-destructive hover:text-destructive"
      >
        <XCircle className="h-4 w-4 mr-2" />
        Reject {selectedCount > 1 ? `(${selectedCount})` : ""}
      </Button>
      <Button
        onClick={() => setApproveDialogOpen(true)}
      >
        <CheckCircle2 className="h-4 w-4 mr-2" />
        Approve {selectedCount > 1 ? `(${selectedCount})` : ""}
      </Button>

      <ModerationActionDialog
        open={approveDialogOpen}
        onOpenChange={setApproveDialogOpen}
        action="approve"
        selectedCount={selectedCount}
        onConfirm={handleApprove}
      />

      <ModerationActionDialog
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        action="reject"
        selectedCount={selectedCount}
        onConfirm={handleReject}
      />
    </>
  );
}
