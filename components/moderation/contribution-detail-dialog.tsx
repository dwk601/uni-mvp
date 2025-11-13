"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { AuditTrail } from "./audit-trail";
import { formatDistanceToNow } from "date-fns";
import { CheckCircle2, XCircle } from "lucide-react";
import type { UserContribution } from "@/types/moderation";

interface ContributionDetailDialogProps {
  contribution: UserContribution | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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

export function ContributionDetailDialog({
  contribution,
  open,
  onOpenChange,
}: ContributionDetailDialogProps) {
  if (!contribution) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>Contribution Details</DialogTitle>
            <Badge
              variant="secondary"
              className={contributionTypeColors[contribution.type]}
            >
              {contributionTypeLabels[contribution.type]}
            </Badge>
          </div>
          <DialogDescription>
            Submitted {formatDistanceToNow(new Date(contribution.submittedAt), { addSuffix: true })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Submitter Information */}
          <div className="rounded-lg border p-4 space-y-3">
            <h3 className="font-semibold text-sm">Submitted By</h3>
            <div className="space-y-1">
              <p className="font-medium">{contribution.userName}</p>
              <p className="text-sm text-muted-foreground">{contribution.userEmail}</p>
              <p className="text-xs text-muted-foreground">User ID: {contribution.userId}</p>
            </div>
          </div>

          {/* Contribution Data */}
          <div className="rounded-lg border p-4 space-y-3">
            <h3 className="font-semibold text-sm">Contribution Details</h3>
            
            {contribution.data.institutionName && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Institution</p>
                <p className="text-sm">{contribution.data.institutionName}</p>
              </div>
            )}

            {contribution.data.field && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Field</p>
                <p className="text-sm">{contribution.data.field}</p>
              </div>
            )}

            {contribution.data.description && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Description</p>
                <p className="text-sm">{contribution.data.description}</p>
              </div>
            )}

            {contribution.data.oldValue && contribution.data.newValue && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Changes</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 rounded-md bg-red-500/10 p-2">
                    <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                    <span className="text-sm line-through">{String(contribution.data.oldValue)}</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-md bg-green-500/10 p-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{String(contribution.data.newValue)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Show full data as JSON if there's additional info */}
            {Object.keys(contribution.data).length > 0 && (
              <details className="text-xs">
                <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                  View raw data
                </summary>
                <pre className="mt-2 rounded-md bg-muted p-3 overflow-x-auto">
                  {JSON.stringify(contribution.data, null, 2)}
                </pre>
              </details>
            )}
          </div>

          {/* Status Information */}
          {contribution.status !== "PENDING" && contribution.reviewedAt && (
            <div className="rounded-lg border p-4 space-y-3">
              <h3 className="font-semibold text-sm">Review Status</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge variant={contribution.status === "APPROVED" ? "default" : "destructive"}>
                    {contribution.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Reviewed</p>
                  <p className="text-sm">
                    {formatDistanceToNow(new Date(contribution.reviewedAt), { addSuffix: true })}
                  </p>
                </div>
                {contribution.reviewedBy && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Reviewed By</p>
                    <p className="text-sm">{contribution.reviewedBy}</p>
                  </div>
                )}
                {contribution.reason && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Reason</p>
                    <p className="text-sm">{contribution.reason}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Audit Trail */}
          <AuditTrail contributionId={contribution.id} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
