import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserCheck, Loader2 } from "lucide-react";
import { useClaimableProfile } from "@/hooks/use-claimable-profile";
import { toast } from "sonner";

interface ClaimProfileBannerProps {
  onClaimed: () => void;
}

const ClaimProfileBanner = ({ onClaimed }: ClaimProfileBannerProps) => {
  const { claimableProfile, loading, claiming, claimProfile } = useClaimableProfile();

  if (loading || !claimableProfile) return null;

  const handleClaim = async () => {
    const success = await claimProfile();
    if (success) {
      toast.success("Profile claimed successfully! You can now manage your profile.");
      onClaimed();
    } else {
      toast.error("Failed to claim profile. Please try again.");
    }
  };

  return (
    <Card className="border-primary/20 bg-primary/5 mb-6">
      <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <UserCheck className="w-5 h-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="font-medium">Your alumni profile is ready to claim!</p>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                Class of {claimableProfile.graduation_year}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              We found a profile for <strong>{claimableProfile.full_name}</strong> matching your email. 
              Claim it to manage your information in the alumni directory.
            </p>
          </div>
        </div>
        <Button onClick={handleClaim} disabled={claiming} className="flex-shrink-0">
          {claiming ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Claiming...
            </>
          ) : (
            <>
              <UserCheck className="w-4 h-4 mr-2" />
              Claim Profile
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ClaimProfileBanner;
