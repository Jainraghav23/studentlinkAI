import { useMemo } from "react";
import { Sparkles, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Milestone {
  year: number;
  yearsAgo: number;
  label: string;
}

interface AnniversaryBannerProps {
  availableYears: number[];
  selectedYear: number | null;
  onSelectYear: (year: number) => void;
}

const MILESTONES = [25, 20, 15, 10, 5];

const AnniversaryBanner = ({ availableYears, selectedYear, onSelectYear }: AnniversaryBannerProps) => {
  const milestones: Milestone[] = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return MILESTONES
      .map((yearsAgo) => ({
        year: currentYear - yearsAgo,
        yearsAgo,
        label: `${yearsAgo} Year Reunion`,
      }))
      .filter((m) => availableYears.includes(m.year));
  }, [availableYears]);

  if (milestones.length === 0) return null;

  return (
    <section className="container mx-auto px-4 pt-10">
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-accent/5 to-background p-6 md:p-8 shadow-card">
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-primary/10 blur-3xl" aria-hidden />
        <div className="absolute -bottom-16 -left-10 w-56 h-56 rounded-full bg-accent/10 blur-3xl" aria-hidden />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-12 h-12 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
              <PartyPopper className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-primary font-semibold mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                Anniversary Celebration
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                Celebrating Milestone Reunions
              </h2>
              <p className="text-muted-foreground text-sm md:text-base mt-1">
                Honoring classes marking a special anniversary this year. Click a class to explore its alumni.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 md:justify-end">
            {milestones.map((m) => {
              const isActive = selectedYear === m.year;
              return (
                <Button
                  key={m.year}
                  size="sm"
                  variant={isActive ? "default" : "outline"}
                  onClick={() => onSelectYear(m.year)}
                  className="rounded-full"
                >
                  <span className="font-semibold">Class of {m.year}</span>
                  <span className="ml-2 text-xs opacity-80">· {m.yearsAgo} yrs</span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AnniversaryBanner;
