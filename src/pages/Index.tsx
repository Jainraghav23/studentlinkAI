import { useState } from "react";
import { Link } from "react-router-dom";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import AlumniDirectory from "@/components/AlumniDirectory";
import Footer from "@/components/Footer";
import ClaimProfileBanner from "@/components/ClaimProfileBanner";
import { useAuth } from "@/contexts/AuthContext";
import { useApprovedAccess } from "@/hooks/use-approved-access";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { user } = useAuth();
  const { loading: accessLoading, isApproved } = useApprovedAccess();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleProfileUpdate = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <>
      <Helmet>
        <title>StudentLink AI | Student and Alumni Network</title>
        <meta
          name="description"
          content="Explore StudentLink AI, an AI-powered network for students, alumni, events, referrals, groups, and community updates."
        />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Navbar onProfileUpdate={handleProfileUpdate} />
        <Hero />
        {user && accessLoading ? (
          <div className="container mx-auto px-4 py-16 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          </div>
        ) : user && isApproved ? (
          <>
            <div className="container mx-auto px-4 -mt-8 relative z-10">
              <ClaimProfileBanner onClaimed={handleProfileUpdate} />
            </div>
            <AlumniDirectory refreshKey={refreshKey} />
          </>
        ) : user ? (
          <div className="container mx-auto px-4 py-16 text-center">
            <p className="text-lg text-muted-foreground mb-4">
              Your account is signed in. The directory unlocks after an admin approves your profile.
            </p>
            <Button asChild>
              <Link to="/auth">Check Application Status</Link>
            </Button>
          </div>
        ) : (
          <div className="container mx-auto px-4 py-16 text-center">
            <p className="text-lg text-muted-foreground mb-4">
              Please log in to view the alumni directory.
            </p>
            <Button asChild>
              <Link to="/auth">Login to View Directory</Link>
            </Button>
          </div>
        )}
        <Footer />
      </div>
    </>
  );
};

export default Index;
