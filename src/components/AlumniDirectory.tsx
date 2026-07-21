import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import AlumniCard from "./AlumniCard";
import YearFilter from "./YearFilter";
import SearchBar from "./SearchBar";
import AnniversaryBanner from "./AnniversaryBanner";
import { Users, Loader2 } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export interface AlumniProfile {
  id: string;
  full_name: string;
  graduation_year: number;
  job_title: string | null;
  company: string | null;
  location: string | null;
  specialization: string | null;
  linkedin_url: string | null;
  bio: string | null;
  avatar_url: string | null;
  candidate_type: string | null;
  country: string | null;
  
}

interface AlumniDirectoryProps {
  refreshKey?: number;
}

const AlumniDirectory = ({ refreshKey }: AlumniDirectoryProps) => {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [candidateTypeFilter, setCandidateTypeFilter] = useState<string>("all");
  const [specializationFilter, setSpecializationFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [alumni, setAlumni] = useState<AlumniProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlumni = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc("get_directory_profiles" as any);

    if (error) {
      console.error("Directory load error:", error);
      toast.error("Could not load the alumni directory. Please try again.");
    } else if (data) {
      setAlumni(data as unknown as AlumniProfile[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAlumni();
  }, [refreshKey]);

  const uniqueSpecializations = useMemo(() => {
    return [...new Set(alumni.map(a => a.specialization).filter(Boolean))] as string[];
  }, [alumni]);

  const uniqueLocations = useMemo(() => {
    return [...new Set(alumni.map(a => a.location).filter(Boolean))] as string[];
  }, [alumni]);

  const availableYears = useMemo(() => {
    return [...new Set(alumni.map((a) => a.graduation_year).filter(Boolean))] as number[];
  }, [alumni]);

  const handleMilestoneSelect = (year: number) => {
    setSelectedYear((current) => (current === year ? null : year));
    setTimeout(() => {
      document.getElementById("alumni-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const filteredAlumni = useMemo(() => {
    return alumni.filter((person) => {
      const matchesYear = selectedYear === null || person.graduation_year === selectedYear;
      const matchesSearch =
        searchQuery === "" ||
        person.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (person.company?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        (person.job_title?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        (person.specialization?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      const matchesCandidateType =
        candidateTypeFilter === "all" || (person.candidate_type || "domestic") === candidateTypeFilter;
      const matchesSpecialization =
        specializationFilter === "all" || person.specialization === specializationFilter;
      const matchesLocation =
        locationFilter === "all" || person.location === locationFilter;

      return matchesYear && matchesSearch && matchesCandidateType && matchesSpecialization && matchesLocation;
    });
  }, [selectedYear, searchQuery, candidateTypeFilter, specializationFilter, locationFilter, alumni]);

  return (
    <section className="py-16 md:py-24">
      <AnniversaryBanner
        availableYears={availableYears}
        selectedYear={selectedYear}
        onSelectYear={handleMilestoneSelect}
      />
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div id="alumni-results" className="text-center mb-12 pt-12 scroll-mt-24">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Our Alumni Network
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Browse through our alumni from the past decade. Filter by graduation year or search for specific individuals.
          </p>
        </div>

        {/* Filters */}
        <div className="space-y-6 mb-12">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <YearFilter selectedYear={selectedYear} onYearSelect={setSelectedYear} />
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={candidateTypeFilter} onValueChange={setCandidateTypeFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Candidate Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Candidates</SelectItem>
                <SelectItem value="domestic">Domestic</SelectItem>
                <SelectItem value="international">International</SelectItem>
              </SelectContent>
            </Select>
            <Select value={specializationFilter} onValueChange={setSpecializationFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Specialization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specializations</SelectItem>
                {uniqueSpecializations.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {uniqueLocations.map((l) => (
                  <SelectItem key={l} value={l}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-center gap-2 mb-8 text-muted-foreground">
          <Users className="w-5 h-5" />
          <span>
            Showing <span className="font-semibold text-foreground">{filteredAlumni.length}</span> alumni
            {selectedYear && <span> from class of {selectedYear}</span>}
          </span>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredAlumni.length > 0 ? (
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
              {alumni.length === 0 ? "No alumni profiles yet" : "No alumni found"}
            </h3>
            <p className="text-muted-foreground">
              {alumni.length === 0
                ? "Be the first to create your alumni profile!"
                : "Try adjusting your search or filter criteria."}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default AlumniDirectory;
