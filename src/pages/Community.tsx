import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PostForm } from "@/components/posts/PostForm";
import { PostList } from "@/components/posts/PostList";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

const Community = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Community Feed</h1>
            
            {user ? (
              <div className="mb-6">
                <PostForm
                  onPostCreated={() =>
                    queryClient.invalidateQueries({ queryKey: ["posts"] })
                  }
                />
              </div>
            ) : (
              <div className="mb-6 p-4 bg-muted rounded-lg text-center">
                <p className="text-muted-foreground mb-2">
                  Log in to create posts and interact with the community
                </p>
                <Button asChild>
                  <Link to="/auth">Log In</Link>
                </Button>
              </div>
            )}

            <PostList />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Community;
