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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { GraduationCap, LogOut, User, Edit, Shield, Menu } from "lucide-react";
import ProfileForm from "./ProfileForm";
import { AlumniSubmissionForm } from "./AlumniSubmissionForm";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  const [profile, setProfile] = useState<AlumniProfile | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
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

  const navLinks = (
    <>
      <Button variant="outline" asChild className="font-bold text-foreground border-foreground/30 hover:bg-muted w-full md:w-auto justify-start md:justify-center">
        <Link to="/community" onClick={() => setMobileOpen(false)}>Community</Link>
      </Button>
      <Button variant="outline" asChild className="font-bold text-foreground border-foreground/30 hover:bg-muted w-full md:w-auto justify-start md:justify-center">
        <Link to="/events" onClick={() => setMobileOpen(false)}>Events</Link>
      </Button>
      <Button variant="outline" asChild className="font-bold text-foreground border-foreground/30 hover:bg-muted w-full md:w-auto justify-start md:justify-center">
        <Link to="/interviews" onClick={() => setMobileOpen(false)}>Interviews</Link>
      </Button>
      <Button variant="outline" asChild className="font-bold text-foreground border-foreground/30 hover:bg-muted w-full md:w-auto justify-start md:justify-center">
        <Link to="/referrals" onClick={() => setMobileOpen(false)}>Referrals</Link>
      </Button>
      <Button variant="outline" asChild className="font-bold text-accent-foreground border-accent hover:bg-accent/10 w-full md:w-auto justify-start md:justify-center">
        <Link to="/hall-of-fame" onClick={() => setMobileOpen(false)}>Hall of Fame</Link>
      </Button>
    </>
  );

  const userActions = (
    <>
      {!user && <AlumniSubmissionForm />}
      {user ? (
        <>
          {!profile && (
            <Button onClick={() => { setShowProfileForm(true); setMobileOpen(false); }} size="sm">
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
      ) : (
        <Button asChild>
          <Link to="/auth" onClick={() => setMobileOpen(false)}>Login</Link>
        </Button>
      )}
    </>
  );

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

            {/* Desktop Navigation */}
            {!isMobile && (
              <div className="flex items-center gap-2">
                {navLinks}
                {userActions}
              </div>
            )}

            {/* Mobile Navigation */}
            {isMobile && (
              <div className="flex items-center gap-2">
                {userActions}
                <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-72">
                    <SheetHeader>
                      <SheetTitle>Menu</SheetTitle>
                    </SheetHeader>
                    <div className="flex flex-col gap-2 mt-6">
                      {navLinks}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            )}
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
