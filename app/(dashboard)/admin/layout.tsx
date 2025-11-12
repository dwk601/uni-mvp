import { redirect } from "next/navigation";

// TODO: Replace with actual authentication check
// This is a placeholder for demonstration purposes
async function checkAdminAuth() {
  // In production, this would check:
  // 1. User session/token
  // 2. User role from database
  // 3. Admin permissions
  
  // For now, we'll use an environment variable for demo purposes
  const isAdminMode = process.env.NEXT_PUBLIC_ADMIN_MODE === "true";
  
  return isAdminMode;
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAdmin = await checkAdminAuth();

  if (!isAdmin) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="flex h-16 items-center px-8">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <div className="ml-auto flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              Moderation Panel
            </span>
          </div>
        </div>
      </div>
      <main className="p-8">{children}</main>
    </div>
  );
}
