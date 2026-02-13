import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Trash2, Search, BookOpen } from "lucide-react";
import { toast } from "sonner";

interface AlumniProfile {
  id: string;
  full_name: string;
  email: string | null;
  graduation_year: number;
  job_title: string | null;
  company: string | null;
  location: string | null;
  claimed: boolean | null;
  created_at: string;
}

const AdminDirectoryManagement = () => {
  const [profiles, setProfiles] = useState<AlumniProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<AlumniProfile | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProfiles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("alumni_profiles")
      .select("id, full_name, email, graduation_year, job_title, company, location, claimed, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load profiles");
      console.error(error);
    } else {
      setProfiles(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const { error } = await supabase
        .from("alumni_profiles")
        .delete()
        .eq("id", deleteTarget.id);
      if (error) throw error;
      toast.success(`${deleteTarget.full_name} removed from directory`);
      setDeleteTarget(null);
      fetchProfiles();
    } catch (error: any) {
      toast.error(error.message || "Failed to remove profile");
    } finally {
      setDeleting(false);
    }
  };

  const filtered = profiles.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.full_name.toLowerCase().includes(q) ||
      (p.email?.toLowerCase().includes(q) ?? false) ||
      (p.company?.toLowerCase().includes(q) ?? false) ||
      p.graduation_year.toString().includes(q)
    );
  });

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
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle className="font-display text-xl flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Alumni Directory
            </CardTitle>
            <CardDescription>
              {profiles.length} alumni in the directory
            </CardDescription>
          </div>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            {search ? "No matching profiles found." : "No alumni profiles yet."}
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
                  <TableHead>Claimed</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell className="font-medium">{profile.full_name}</TableCell>
                    <TableCell>{profile.email || "—"}</TableCell>
                    <TableCell>{profile.graduation_year}</TableCell>
                    <TableCell>{profile.company || "—"}</TableCell>
                    <TableCell>
                      <span className={`text-xs font-medium ${profile.claimed ? "text-green-700" : "text-muted-foreground"}`}>
                        {profile.claimed ? "Yes" : "No"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteTarget(profile)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from Directory</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{deleteTarget?.full_name}</strong> from the alumni directory? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default AdminDirectoryManagement;
