import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Welcome to Admin Dashboard</h2>
        <p className="text-muted-foreground mt-2">
          Manage user contributions and moderate content
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Pending Contributions</CardTitle>
            <CardDescription>Review and moderate user submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-2">
              Items awaiting review
            </p>
            <Link href="/admin/moderation">
              <Button className="w-full mt-4">View Queue</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Actions</CardTitle>
            <CardDescription>Latest moderation activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-2">
              Actions in the last 24h
            </p>
            <Link href="/admin/audit">
              <Button variant="outline" className="w-full mt-4">View Audit Log</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Overall moderation health</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Healthy</div>
            <p className="text-xs text-muted-foreground mt-2">
              All systems operational
            </p>
            <Button variant="outline" className="w-full mt-4" disabled>
              View Details
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common moderation tasks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Link href="/admin/moderation" className="block">
            <Button variant="outline" className="w-full justify-start">
              Review Pending Contributions
            </Button>
          </Link>
          <Link href="/admin/audit" className="block">
            <Button variant="outline" className="w-full justify-start">
              View Audit Trail
            </Button>
          </Link>
          <Button variant="outline" className="w-full justify-start" disabled>
            Manage Moderators
          </Button>
          <Button variant="outline" className="w-full justify-start" disabled>
            System Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
