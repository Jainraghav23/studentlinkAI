import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PostForm } from "@/components/posts/PostForm";
import { PostList } from "@/components/posts/PostList";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { CommunitySidebar } from "@/components/community/CommunitySidebar";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";

const Community = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <SidebarProvider>
        <div className="flex flex-1 w-full">
          <CommunitySidebar />
          <SidebarInset>
            <main className="flex-grow bg-background">
              {/* Mobile header with sidebar trigger */}
              <div className="flex items-center gap-2 p-4 border-b md:hidden">
                <SidebarTrigger />
                <h1 className="text-xl font-bold">Community Feed</h1>
              </div>

              <div className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                  {/* Desktop title */}
                  <div className="hidden md:flex items-center gap-4 mb-6">
                    <SidebarTrigger />
                    <h1 className="text-3xl font-bold">Community Feed</h1>
                  </div>

                  {/* Mobile-only post form */}
                  <div className="md:hidden mb-6">
                    {user ? (
                      <PostForm
                        onPostCreated={() =>
                          queryClient.invalidateQueries({ queryKey: ["posts"] })
                        }
                      />
                    ) : (
                      <div className="p-4 bg-muted rounded-lg text-center">
                        <p className="text-muted-foreground mb-2">
                          Log in to create posts and interact with the community
                        </p>
                        <Button asChild>
                          <Link to="/auth">Log In</Link>
                        </Button>
                      </div>
                    )}
                  </div>

                  <PostList />
                </div>
              </div>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
      <Footer />
    </div>
  );
};

export default Community;
