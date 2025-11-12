// Types for user contributions and moderation
export type ContributionType = 
  | "NEW_INSTITUTION"
  | "EDIT_INSTITUTION"
  | "NEW_MAJOR"
  | "EDIT_DATA"
  | "CORRECTION";

export type ContributionStatus = 
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "IN_REVIEW";

export interface UserContribution {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  type: ContributionType;
  status: ContributionStatus;
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  reason?: string;
  
  // Data payload depends on contribution type
  data: {
    institutionId?: number;
    institutionName?: string;
    field?: string;
    oldValue?: any;
    newValue?: any;
    description?: string;
    [key: string]: any;
  };
}

export interface ModerationAction {
  id: string;
  contributionId: string;
  action: "APPROVE" | "REJECT";
  reason: string;
  moderatorId: string;
  moderatorName: string;
  timestamp: Date;
}

export interface ModerationFilters {
  type?: ContributionType;
  status?: ContributionStatus;
  dateFrom?: Date;
  dateTo?: Date;
  searchQuery?: string;
}
