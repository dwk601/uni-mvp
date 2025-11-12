"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

interface ModerationActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: "approve" | "reject";
  selectedCount: number;
  onConfirm: (reason: string) => Promise<void>;
}

export function ModerationActionDialog({
  open,
  onOpenChange,
  action,
  selectedCount,
  onConfirm,
}: ModerationActionDialogProps) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isApprove = action === "approve";
  const title = isApprove ? "Approve Contributions" : "Reject Contributions";
  const description = isApprove
    ? `You are about to approve ${selectedCount} contribution${selectedCount > 1 ? "s" : ""}. Please provide a reason for approval.`
    : `You are about to reject ${selectedCount} contribution${selectedCount > 1 ? "s" : ""}. Please provide a reason for rejection.`;

  const handleConfirm = async () => {
    if (!reason.trim()) {
      setError("Reason is required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onConfirm(reason.trim());
      setReason("");
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setReason("");
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {isApprove ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-destructive" />
            )}
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">
              Reason <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="reason"
              placeholder={
                isApprove
                  ? "e.g., Data verified and accurate, sources confirmed"
                  : "e.g., Insufficient evidence, contradicts official sources"
              }
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError(null);
              }}
              disabled={isSubmitting}
              className="min-h-[100px]"
              aria-required="true"
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm font-medium mb-2">Summary:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• {selectedCount} contribution{selectedCount > 1 ? "s" : ""} selected</li>
              <li>• Action: {isApprove ? "Approve" : "Reject"}</li>
              <li>• This action cannot be undone</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant={isApprove ? "default" : "destructive"}
            onClick={handleConfirm}
            disabled={isSubmitting || !reason.trim()}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isApprove ? "Approving..." : "Rejecting..."}
              </>
            ) : (
              <>
                {isApprove ? "Approve" : "Reject"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
