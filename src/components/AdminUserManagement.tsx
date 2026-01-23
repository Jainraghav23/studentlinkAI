import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, UserPlus, Trash2, Shield } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface AdminUser {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
  email?: string;
}

const AdminUserManagement = () => {
  const { user } = useAuth();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [removingAdmin, setRemovingAdmin] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchAdmins = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("user_roles")
      .select("*")
      .eq("role", "admin")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load admin users");
      console.error(error);
    } else {
      setAdmins(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleAddAdmin = async () => {
    if (!newAdminEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newAdminEmail.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }

    setAddingAdmin(true);

    try {
      // First, we need to find the user by email
      // We'll use the alumni_profiles table as a reference since we can't directly query auth.users
      // Alternatively, the admin can provide the user_id directly
      
      // For now, we'll create a simple approach: check if there's an alumni profile with this email
      const { data: profileData, error: profileError } = await supabase
        .from("alumni_profiles")
        .select("user_id, email")
        .eq("email", newAdminEmail.trim().toLowerCase())
        .not("user_id", "is", null)
        .maybeSingle();

      if (profileError) {
        throw profileError;
      }

      if (!profileData || !profileData.user_id) {
        toast.error("No user found with this email. The user must have a claimed alumni profile first.");
        setAddingAdmin(false);
        return;
      }

      // Check if user is already an admin
      const existingAdmin = admins.find(a => a.user_id === profileData.user_id);
      if (existingAdmin) {
        toast.error("This user is already an admin");
        setAddingAdmin(false);
        return;
      }

      // Add the admin role
      const { error: insertError } = await supabase
        .from("user_roles")
        .insert({
          user_id: profileData.user_id,
          role: "admin",
        });

      if (insertError) {
        throw insertError;
      }

      toast.success(`Admin role granted to ${newAdminEmail}`);
      setNewAdminEmail("");
      setDialogOpen(false);
      fetchAdmins();
    } catch (error: any) {
      console.error("Error adding admin:", error);
      toast.error(error.message || "Failed to add admin");
    } finally {
      setAddingAdmin(false);
    }
  };

  const handleRemoveAdmin = async (adminRole: AdminUser) => {
    if (adminRole.user_id === user?.id) {
      toast.error("You cannot remove your own admin role");
      return;
    }

    setRemovingAdmin(adminRole.id);

    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("id", adminRole.id);

      if (error) throw error;

      toast.success("Admin role revoked successfully");
      fetchAdmins();
    } catch (error: any) {
      console.error("Error removing admin:", error);
      toast.error(error.message || "Failed to remove admin");
    } finally {
      setRemovingAdmin(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-display text-xl flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Admin Users
            </CardTitle>
            <CardDescription>
              Manage users who have admin access to approve/reject submissions
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Add Admin
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Admin</DialogTitle>
                <DialogDescription>
                  Enter the email address of the user you want to grant admin access to.
                  The user must have a claimed alumni profile.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    disabled={addingAdmin}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={addingAdmin}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddAdmin} disabled={addingAdmin}>
                  {addingAdmin ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Grant Admin Access"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {admins.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No admin users found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User ID</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell className="font-mono text-sm">
                      {admin.user_id}
                      {admin.user_id === user?.id && (
                        <span className="ml-2 text-xs text-muted-foreground">(You)</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {admin.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(admin.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {admin.user_id !== user?.id ? (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              disabled={removingAdmin === admin.id}
                            >
                              {removingAdmin === admin.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Revoke Admin Access?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will remove admin privileges from this user. They will no longer be able to approve or reject alumni submissions.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleRemoveAdmin(admin)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Revoke Access
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminUserManagement;
