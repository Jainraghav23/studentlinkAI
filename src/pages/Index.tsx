import Hero from "@/components/Hero";
import AlumniDirectory from "@/components/AlumniDirectory";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet-async";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>MBA Alumni Directory | A Decade of Excellence</title>
        <meta
          name="description"
          content="Explore our MBA alumni network spanning 10 years of exceptional graduates. Connect with 300+ alumni across 50+ countries working at top global companies."
        />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Hero />
        <AlumniDirectory />
        <Footer />
      </div>
    </>
  );
};

export default Index;
