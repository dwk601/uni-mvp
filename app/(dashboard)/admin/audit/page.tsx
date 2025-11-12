"use client";

import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useModerationStore } from "@/lib/stores/moderation-store";
import { CheckCircle2, XCircle, History, RefreshCw } from "lucide-react";
import { format } from "date-fns";

export default function AuditPage() {
  const recentActions = useModerationStore((state) => state.recentActions);
  const contributions = useModerationStore((state) => state.contributions);
  const fetchContributions = useModerationStore((state) => state.fetchContributions);

  useEffect(() => {
    fetchContributions();
  }, [fetchContributions]);

  const getContributionInfo = (contributionId: string) => {
    return contributions.find((c) => c.id === contributionId);
  };

  const handleRefresh = () => {
    fetchContributions();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Audit Trail</h2>
          <p className="text-muted-foreground mt-2">
            Complete history of moderation actions
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                {recentActions.length} action{recentActions.length !== 1 ? "s" : ""} recorded
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <CheckCircle2 className="h-3 w-3 text-green-600" />
                {recentActions.filter((a) => a.action === "APPROVE").length} Approved
              </Badge>
              <Badge variant="outline" className="gap-1">
                <XCircle className="h-3 w-3 text-destructive" />
                {recentActions.filter((a) => a.action === "REJECT").length} Rejected
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {recentActions.length === 0 ? (
            <div className="text-center py-12">
              <History className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-lg font-semibold mb-2">No actions recorded</p>
              <p className="text-muted-foreground">
                Moderation actions will appear here once you approve or reject contributions
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-24">Action</TableHead>
                      <TableHead>Moderator</TableHead>
                      <TableHead>Contribution</TableHead>
                      <TableHead>Institution</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead className="w-40">Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentActions.map((action) => {
                      const contribution = getContributionInfo(action.contributionId);
                      const isApproved = action.action === "APPROVE";

                      return (
                        <TableRow key={action.id}>
                          <TableCell>
                            <Badge
                              variant={isApproved ? "default" : "destructive"}
                              className="gap-1"
                            >
                              {isApproved ? (
                                <>
                                  <CheckCircle2 className="h-3 w-3" />
                                  Approved
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-3 w-3" />
                                  Rejected
                                </>
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-medium">{action.moderatorName}</p>
                              <p className="text-xs text-muted-foreground">
                                ID: {action.moderatorId}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="text-sm font-medium">
                                {contribution ? (
                                  <Badge variant="outline" className="font-normal">
                                    {contribution.type.replace(/_/g, " ")}
                                  </Badge>
                                ) : (
                                  <span className="text-muted-foreground">
                                    ID: {action.contributionId}
                                  </span>
                                )}
                              </p>
                              {contribution && (
                                <p className="text-xs text-muted-foreground">
                                  By {contribution.userName}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {contribution?.data.institutionName ? (
                              <div className="space-y-1">
                                <p className="font-medium">
                                  {contribution.data.institutionName}
                                </p>
                                {contribution.data.field && (
                                  <p className="text-xs text-muted-foreground">
                                    Field: {contribution.data.field}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">N/A</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <p className="text-sm max-w-xs line-clamp-2">
                              {action.reason}
                            </p>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="text-sm font-medium">
                                {format(new Date(action.timestamp), "PPp")}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(action.timestamp), "EEEE")}
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {recentActions.length >= 20 && (
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm text-muted-foreground">
                    <strong>Note:</strong> Only the last 20 actions are persisted. Older
                    actions are cleared to optimize storage.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
