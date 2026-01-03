import { useState, useMemo } from "react";
import { alumni } from "@/data/alumni";
import AlumniCard from "./AlumniCard";
import YearFilter from "./YearFilter";
import SearchBar from "./SearchBar";
import { Users } from "lucide-react";

const AlumniDirectory = () => {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAlumni = useMemo(() => {
    return alumni.filter((person) => {
      const matchesYear = selectedYear === null || person.graduationYear === selectedYear;
      const matchesSearch =
        searchQuery === "" ||
        person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        person.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        person.currentRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
        person.specialization.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesYear && matchesSearch;
    });
  }, [selectedYear, searchQuery]);

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Our Alumni Network
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Browse through our distinguished alumni from the past decade. Filter by graduation year or search for specific individuals.
          </p>
        </div>

        {/* Filters */}
        <div className="space-y-6 mb-12">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <YearFilter selectedYear={selectedYear} onYearSelect={setSelectedYear} />
        </div>

        {/* Results count */}
        <div className="flex items-center justify-center gap-2 mb-8 text-muted-foreground">
          <Users className="w-5 h-5" />
          <span>
            Showing <span className="font-semibold text-foreground">{filteredAlumni.length}</span> alumni
            {selectedYear && <span> from class of {selectedYear}</span>}
          </span>
        </div>

        {/* Alumni grid */}
        {filteredAlumni.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAlumni.map((person, index) => (
              <AlumniCard key={person.id} alumni={person} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              No alumni found
            </h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default AlumniDirectory;
