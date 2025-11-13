"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertCircle, Loader2, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface AuditAction {
  id: string;
  contributionId: string;
  action: "APPROVE" | "REJECT" | "REQUEST_CHANGES";
  reason: string;
  moderatorId: string;
  moderatorName: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

interface AuditTrailProps {
  contributionId: string;
  className?: string;
}

export function AuditTrail({ contributionId, className }: AuditTrailProps) {
  const [actions, setActions] = useState<AuditAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAuditTrail();
  }, [contributionId]);

  const fetchAuditTrail = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/moderation/audit/${contributionId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch audit trail");
      }

      const data = await response.json();
      setActions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "APPROVE":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "REJECT":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "REQUEST_CHANGES":
        return <AlertCircle className="h-5 w-5 text-orange-600" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "APPROVE":
        return "bg-green-500/10 text-green-700 dark:text-green-400";
      case "REJECT":
        return "bg-red-500/10 text-red-700 dark:text-red-400";
      case "REQUEST_CHANGES":
        return "bg-orange-500/10 text-orange-700 dark:text-orange-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">Audit Trail</CardTitle>
          <CardDescription>Loading history...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">Audit Trail</CardTitle>
          <CardDescription>Error loading history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (actions.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">Audit Trail</CardTitle>
          <CardDescription>No moderation actions recorded yet</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            This contribution hasn't been reviewed yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Audit Trail</CardTitle>
        <CardDescription>
          {actions.length} {actions.length === 1 ? "action" : "actions"} recorded
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {actions.map((action, index) => (
            <div
              key={action.id}
              className="relative flex gap-4 pb-4 border-b last:border-b-0 last:pb-0"
            >
              {/* Timeline connector */}
              {index < actions.length - 1 && (
                <div className="absolute left-[22px] top-8 bottom-0 w-px bg-border" />
              )}

              {/* Action icon */}
              <div className="relative flex-shrink-0 mt-1">
                {getActionIcon(action.action)}
              </div>

              {/* Action details */}
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Badge variant="secondary" className={getActionColor(action.action)}>
                      {action.action}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(action.timestamp), {
                      addSuffix: true,
                    })}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium">{action.moderatorName}</p>
                  <p className="text-xs text-muted-foreground">
                    Moderator ID: {action.moderatorId}
                  </p>
                </div>

                <div className="rounded-md bg-muted p-3">
                  <p className="text-sm font-medium mb-1">Reason:</p>
                  <p className="text-sm text-muted-foreground">{action.reason}</p>
                </div>

                {action.metadata && Object.keys(action.metadata).length > 0 && (
                  <details className="text-xs">
                    <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                      View metadata
                    </summary>
                    <pre className="mt-2 rounded-md bg-muted p-2 overflow-x-auto">
                      {JSON.stringify(action.metadata, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
