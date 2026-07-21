import { GraduationCap } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="w-6 h-6 text-secondary" />
            <span className="font-display text-xl font-semibold">StudentLink AI</span>
          </div>
          <p className="text-primary-foreground/70 text-sm max-w-md">
            Connecting students, alumni, and early-career professionals through one intelligent community hub.
          </p>
          <div className="mt-6 pt-6 border-t border-primary-foreground/10 w-full max-w-xs">
            <p className="text-xs text-primary-foreground/50">
              © {new Date().getFullYear()} StudentLink AI. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
