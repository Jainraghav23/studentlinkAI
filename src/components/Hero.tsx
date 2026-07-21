import { GraduationCap, Users, Building2 } from "lucide-react";

const Hero = () => {
  return (
    <header className="relative gradient-hero text-primary-foreground overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 py-20 md:py-28">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 mb-8 animate-fade-in">
            <GraduationCap className="w-4 h-4" />
            <span className="text-sm font-medium">StudentLink AI Network</span>
          </div>

          {/* Title */}
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in" style={{ animationDelay: "100ms" }}>
            Student Connections,{" "}
            <span className="text-gradient">Powered by AI</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-12 animate-fade-in" style={{ animationDelay: "200ms" }}>
            Connect students, alumni, and early-career professionals through profiles, events, referrals, groups, and community updates.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto animate-fade-in" style={{ animationDelay: "300ms" }}>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-full bg-secondary/20">
                <Users className="w-6 h-6 text-secondary" />
              </div>
              <p className="text-2xl md:text-3xl font-display font-bold">300+</p>
              <p className="text-sm text-primary-foreground/70">Members</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-full bg-secondary/20">
                <GraduationCap className="w-6 h-6 text-secondary" />
              </div>
              <p className="text-2xl md:text-3xl font-display font-bold">10</p>
              <p className="text-sm text-primary-foreground/70">Cohorts</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-full bg-secondary/20">
                <Building2 className="w-6 h-6 text-secondary" />
              </div>
              <p className="text-2xl md:text-3xl font-display font-bold">50+</p>
              <p className="text-sm text-primary-foreground/70">Countries</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          <path d="M0 60L1440 60V30C1440 30 1320 0 1080 0C840 0 600 60 360 60C120 60 0 30 0 30V60Z" fill="hsl(var(--background))" />
        </svg>
      </div>
    </header>
  );
};

export default Hero;
