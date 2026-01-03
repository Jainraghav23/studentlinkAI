import { graduationYears } from "@/data/alumni";
import { cn } from "@/lib/utils";

interface YearFilterProps {
  selectedYear: number | null;
  onYearSelect: (year: number | null) => void;
}

const YearFilter = ({ selectedYear, onYearSelect }: YearFilterProps) => {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      <button
        onClick={() => onYearSelect(null)}
        className={cn(
          "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
          selectedYear === null
            ? "bg-primary text-primary-foreground shadow-md"
            : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground shadow-card"
        )}
      >
        All Years
      </button>
      
      {graduationYears.map((year) => (
        <button
          key={year}
          onClick={() => onYearSelect(year)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
            selectedYear === year
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground shadow-card"
          )}
        >
          {year}
        </button>
      ))}
    </div>
  );
};

export default YearFilter;
