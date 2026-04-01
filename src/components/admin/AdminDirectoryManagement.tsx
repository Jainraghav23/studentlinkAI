import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, Trash2, Search, BookOpen, Pencil } from "lucide-react";
import { toast } from "sonner";

interface AlumniProfile {
  id: string;
  full_name: string;
  email: string | null;
  graduation_year: number;
  job_title: string | null;
  company: string | null;
  location: string | null;
  specialization: string | null;
  linkedin_url: string | null;
  bio: string | null;
  claimed: boolean | null;
  candidate_type: string | null;
  country: string | null;
  
  created_at: string;
}

const AdminDirectoryManagement = () => {
  const [profiles, setProfiles] = useState<AlumniProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<AlumniProfile | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editTarget, setEditTarget] = useState<AlumniProfile | null>(null);
  const [editForm, setEditForm] = useState<Partial<AlumniProfile>>({});
  const [saving, setSaving] = useState(false);

  const fetchProfiles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("alumni_profiles")
      .select("id, full_name, email, graduation_year, job_title, company, location, specialization, linkedin_url, bio, claimed, candidate_type, country, is_distinguished, created_at")
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

  const toggleDistinguished = async (profile: AlumniProfile) => {
    const newValue = !profile.is_distinguished;
    try {
      const { error } = await supabase
        .from("alumni_profiles")
        .update({ is_distinguished: newValue })
        .eq("id", profile.id);
      if (error) throw error;
      toast.success(`${profile.full_name} ${newValue ? "marked as" : "removed from"} distinguished`);
      fetchProfiles();
    } catch (error: any) {
      toast.error(error.message || "Failed to update");
    }
  };

  const openEdit = (profile: AlumniProfile) => {
    setEditTarget(profile);
    setEditForm({
      full_name: profile.full_name,
      email: profile.email,
      graduation_year: profile.graduation_year,
      job_title: profile.job_title,
      company: profile.company,
      location: profile.location,
      specialization: profile.specialization,
      linkedin_url: profile.linkedin_url,
      bio: profile.bio,
      candidate_type: profile.candidate_type,
      country: profile.country,
    });
  };

  const handleSaveEdit = async () => {
    if (!editTarget) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("alumni_profiles")
        .update({
          full_name: editForm.full_name!,
          email: editForm.email,
          graduation_year: editForm.graduation_year!,
          job_title: editForm.job_title,
          company: editForm.company,
          location: editForm.location,
          specialization: editForm.specialization,
          linkedin_url: editForm.linkedin_url,
          bio: editForm.bio,
          candidate_type: editForm.candidate_type || "domestic",
          country: editForm.candidate_type === "international" ? editForm.country : null,
        })
        .eq("id", editTarget.id);
      if (error) throw error;
      toast.success(`${editForm.full_name} updated successfully`);
      setEditTarget(null);
      fetchProfiles();
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
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
                  <TableHead>Distinguished</TableHead>
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
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(profile)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteTarget(profile)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleDistinguished(profile)}
                        className={profile.is_distinguished ? "text-amber-500 hover:text-amber-600" : "text-muted-foreground hover:text-amber-500"}
                      >
                        <Award className="w-4 h-4" />
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

      {/* Edit Profile Dialog */}
      <Dialog open={!!editTarget} onOpenChange={() => setEditTarget(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Edit Alumni Profile</DialogTitle>
            <DialogDescription>Update the profile details below</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={editForm.full_name || ""} onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={editForm.email || ""} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Graduation Year</Label>
              <Input type="number" value={editForm.graduation_year || ""} onChange={(e) => setEditForm({ ...editForm, graduation_year: parseInt(e.target.value) || 0 })} />
            </div>
            <div className="space-y-2">
              <Label>Job Title</Label>
              <Input value={editForm.job_title || ""} onChange={(e) => setEditForm({ ...editForm, job_title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Company</Label>
              <Input value={editForm.company || ""} onChange={(e) => setEditForm({ ...editForm, company: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input value={editForm.location || ""} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Specialization</Label>
              <Input value={editForm.specialization || ""} onChange={(e) => setEditForm({ ...editForm, specialization: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>LinkedIn URL</Label>
              <Input value={editForm.linkedin_url || ""} onChange={(e) => setEditForm({ ...editForm, linkedin_url: e.target.value })} />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Candidate Type</Label>
              <Select
                value={editForm.candidate_type || "domestic"}
                onValueChange={(value) => setEditForm({ ...editForm, candidate_type: value, country: value === "domestic" ? null : editForm.country })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="domestic">Domestic</SelectItem>
                  <SelectItem value="international">International</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {editForm.candidate_type === "international" && (
              <div className="col-span-2 space-y-2">
                <Label>Country</Label>
                <Input value={editForm.country || ""} onChange={(e) => setEditForm({ ...editForm, country: e.target.value })} />
              </div>
            )}
            <div className="col-span-2 space-y-2">
              <Label>Bio</Label>
              <Textarea value={editForm.bio || ""} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>Cancel</Button>
            <Button onClick={handleSaveEdit} disabled={saving || !editForm.full_name}>
              {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving...</> : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AdminDirectoryManagement;
