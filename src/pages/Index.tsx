import { useState } from "react";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import AlumniDirectory from "@/components/AlumniDirectory";
import Footer from "@/components/Footer";
import ClaimProfileBanner from "@/components/ClaimProfileBanner";
import { useAuth } from "@/contexts/AuthContext";
import { Helmet } from "react-helmet-async";

const Index = () => {
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleProfileUpdate = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <>
      <Helmet>
        <title>UW-Madison MBA Alumni Directory | A Decade of Excellence</title>
        <meta
          name="description"
          content="Explore the University of Wisconsin-Madison MBA alumni network spanning 10 years of exceptional graduates. Connect with alumni across 50+ countries."
        />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Navbar onProfileUpdate={handleProfileUpdate} />
        <Hero />
        <div className="container mx-auto px-4 -mt-8 relative z-10">
          {user && <ClaimProfileBanner onClaimed={handleProfileUpdate} />}
        </div>
        <AlumniDirectory refreshKey={refreshKey} />
        <Footer />
      </div>
    </>
  );
};

export default Index;
