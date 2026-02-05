import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/use-admin";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, Loader2, Check, X, Eye, ArrowLeft, ShieldAlert, Users, FileText } from "lucide-react";
import { toast } from "sonner";
import AdminUserManagement from "@/components/AdminUserManagement";

interface AlumniSubmission {
  id: string;
  full_name: string;
  email: string;
  graduation_year: number;
  job_title: string | null;
  company: string | null;
  location: string | null;
  specialization: string | null;
  linkedin_url: string | null;
  bio: string | null;
  status: string;
  created_at: string;
  user_id: string | null;
}

const Admin = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [submissions, setSubmissions] = useState<AlumniSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<AlumniSubmission | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const fetchSubmissions = async () => {
    const { data, error } = await supabase
      .from("alumni_submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load submissions");
      console.error(error);
    } else {
      setSubmissions(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchSubmissions();
    }
  }, [user]);

  const handleApprove = async (submission: AlumniSubmission) => {
    setProcessing(submission.id);
    
    try {
      // Create alumni profile linked to the user who submitted
      // If user_id exists, profile is immediately claimed; otherwise unclaimed
      const { error: profileError } = await supabase
        .from("alumni_profiles")
        .insert({
          user_id: submission.user_id, // Link to the auth user who submitted
          full_name: submission.full_name,
          email: submission.email,
          graduation_year: submission.graduation_year,
          job_title: submission.job_title,
          company: submission.company,
          location: submission.location,
          specialization: submission.specialization,
          linkedin_url: submission.linkedin_url,
          bio: submission.bio,
          claimed: submission.user_id ? true : false, // Claimed if user_id exists
          claim_token: submission.user_id ? null : crypto.randomUUID(),
        });

      if (profileError) throw profileError;

      // Update submission status
      const { error: updateError } = await supabase
        .from("alumni_submissions")
        .update({ status: "approved" })
        .eq("id", submission.id);

      if (updateError) throw updateError;

      const message = submission.user_id 
        ? `${submission.full_name} has been approved and their profile is now live!`
        : `${submission.full_name} has been approved! They can claim their profile using their email.`;
      
      toast.success(message);
      fetchSubmissions();
      setSelectedSubmission(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to approve submission");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (submission: AlumniSubmission) => {
    setProcessing(submission.id);
    
    try {
      const { error } = await supabase
        .from("alumni_submissions")
        .update({ status: "rejected" })
        .eq("id", submission.id);

      if (error) throw error;

      toast.success(`${submission.full_name}'s submission has been rejected.`);
      fetchSubmissions();
      setSelectedSubmission(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to reject submission");
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100">Pending</Badge>;
      case "approved":
        return <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>;
      case "rejected":
        return <Badge variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (authLoading || adminLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="font-display text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground max-w-md">
            You don't have permission to access this page. Only administrators can view the admin dashboard.
          </p>
          <Button onClick={() => navigate("/")} className="mt-4">
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  const pendingCount = submissions.filter(s => s.status === "pending").length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-hero py-8">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            className="text-primary-foreground hover:bg-primary-foreground/10 mb-4"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Directory
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-primary-foreground">
                Admin Dashboard
              </h1>
              <p className="text-primary-foreground/80">
                Review and manage alumni submissions
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="submissions" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="submissions" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Submissions
            </TabsTrigger>
            <TabsTrigger value="admins" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Admin Users
            </TabsTrigger>
          </TabsList>

          <TabsContent value="submissions">
            <Card className="shadow-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-display text-xl">Alumni Submissions</CardTitle>
                    <CardDescription>
                      {pendingCount > 0 
                        ? `${pendingCount} pending submission${pendingCount > 1 ? "s" : ""} to review`
                        : "No pending submissions"
                      }
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {submissions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No submissions yet.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Year</TableHead>
                          <TableHead>Company</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Submitted</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {submissions.map((submission) => (
                          <TableRow key={submission.id}>
                            <TableCell className="font-medium">{submission.full_name}</TableCell>
                            <TableCell>{submission.email}</TableCell>
                            <TableCell>{submission.graduation_year}</TableCell>
                            <TableCell>{submission.company || "-"}</TableCell>
                            <TableCell>{getStatusBadge(submission.status)}</TableCell>
                            <TableCell>
                              {new Date(submission.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setSelectedSubmission(submission)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                {submission.status === "pending" && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                      onClick={() => handleApprove(submission)}
                                      disabled={processing === submission.id}
                                    >
                                      {processing === submission.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                      ) : (
                                        <Check className="w-4 h-4" />
                                      )}
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                      onClick={() => handleReject(submission)}
                                      disabled={processing === submission.id}
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="admins">
            <AdminUserManagement />
          </TabsContent>
        </Tabs>
      </main>

      {/* Submission Detail Dialog */}
      <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Submission Details</DialogTitle>
            <DialogDescription>
              Review the alumni submission details below
            </DialogDescription>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{selectedSubmission.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedSubmission.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Graduation Year</p>
                  <p className="font-medium">{selectedSubmission.graduation_year}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  {getStatusBadge(selectedSubmission.status)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Job Title</p>
                  <p className="font-medium">{selectedSubmission.job_title || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Company</p>
                  <p className="font-medium">{selectedSubmission.company || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{selectedSubmission.location || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Specialization</p>
                  <p className="font-medium">{selectedSubmission.specialization || "-"}</p>
                </div>
              </div>
              {selectedSubmission.linkedin_url && (
                <div>
                  <p className="text-sm text-muted-foreground">LinkedIn</p>
                  <a 
                    href={selectedSubmission.linkedin_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {selectedSubmission.linkedin_url}
                  </a>
                </div>
              )}
              {selectedSubmission.bio && (
                <div>
                  <p className="text-sm text-muted-foreground">Bio</p>
                  <p className="text-sm">{selectedSubmission.bio}</p>
                </div>
              )}
              {selectedSubmission.status === "pending" && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleApprove(selectedSubmission)}
                    disabled={processing === selectedSubmission.id}
                  >
                    {processing === selectedSubmission.id ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Check className="w-4 h-4 mr-2" />
                    )}
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleReject(selectedSubmission)}
                    disabled={processing === selectedSubmission.id}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
