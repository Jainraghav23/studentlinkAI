import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/use-admin";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GraduationCap, LogOut, User, Edit, Shield } from "lucide-react";
import ProfileForm from "./ProfileForm";
import { AlumniSubmissionForm } from "./AlumniSubmissionForm";
import { useNavigate } from "react-router-dom";

interface AlumniProfile {
  id: string;
  full_name: string;
  graduation_year: number;
  job_title: string | null;
  company: string | null;
  location: string | null;
  specialization: string | null;
  linkedin_url: string | null;
  email: string | null;
  bio: string | null;
  avatar_url: string | null;
  claimed: boolean | null;
}

interface NavbarProps {
  onProfileUpdate?: () => void;
}

const Navbar = ({ onProfileUpdate }: NavbarProps) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const [profile, setProfile] = useState<AlumniProfile | null>(null);
  const [showProfileForm, setShowProfileForm] = useState(false);

  const fetchProfile = async () => {
    if (!user) {
      setProfile(null);
      return;
    }

    const { data } = await supabase
      .from("alumni_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    setProfile(data);
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
  };

  const handleProfileSuccess = () => {
    fetchProfile();
    onProfileUpdate?.();
  };

  const initials = profile?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display text-lg font-semibold hidden sm:block">
                MBA Alumni
              </span>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center gap-6">
              <Link to="/community" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Community
              </Link>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <AlumniSubmissionForm />
              {user ? (
                <>
                  {!profile && (
                    <Button onClick={() => setShowProfileForm(true)} size="sm">
                      Create Profile
                    </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={profile?.avatar_url || undefined} />
                          <AvatarFallback className="bg-primary text-primary-foreground font-display">
                            {initials || <User className="w-4 h-4" />}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <div className="px-2 py-1.5">
                        <p className="text-sm font-medium">{profile?.full_name || "Alumni"}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                      <DropdownMenuSeparator />
                      {profile ? (
                        <DropdownMenuItem onClick={() => navigate("/my-profile")}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Profile
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => setShowProfileForm(true)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Create Profile
                        </DropdownMenuItem>
                      )}
                      {isAdmin && (
                        <DropdownMenuItem onClick={() => navigate("/admin")}>
                          <Shield className="w-4 h-4 mr-2" />
                          Admin Dashboard
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut}>
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </nav>

      <ProfileForm
        open={showProfileForm}
        onOpenChange={setShowProfileForm}
        existingProfile={profile}
        onSuccess={handleProfileSuccess}
      />
    </>
  );
};

export default Navbar;
