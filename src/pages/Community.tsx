import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PostForm } from "@/components/posts/PostForm";
import { PostList } from "@/components/posts/PostList";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Users, Home, MessageSquare, User } from "lucide-react";

const Community = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const sidebarLinks = [
    { icon: Home, label: "Home", href: "/" },
    { icon: MessageSquare, label: "Community", href: "/community", active: true },
    { icon: Users, label: "Directory", href: "/#directory" },
    ...(user ? [{ icon: User, label: "My Profile", href: "/my-profile" }] : []),
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex gap-8">
            {/* Left Sidebar */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24 space-y-6">
                {/* Navigation */}
                <nav className="space-y-1">
                  {sidebarLinks.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        link.active
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <link.icon className="w-5 h-5" />
                      <span>{link.label}</span>
                    </Link>
                  ))}
                </nav>

                {/* Post Form in Sidebar */}
                {user && (
                  <div className="border-t pt-6">
                    <h3 className="font-medium text-sm text-muted-foreground mb-3 px-1">
                      Create a Post
                    </h3>
                    <PostForm
                      onPostCreated={() =>
                        queryClient.invalidateQueries({ queryKey: ["posts"] })
                      }
                    />
                  </div>
                )}

                {!user && (
                  <div className="border-t pt-6">
                    <div className="p-4 bg-muted rounded-lg text-center">
                      <p className="text-sm text-muted-foreground mb-3">
                        Log in to create posts
                      </p>
                      <Button asChild size="sm" className="w-full">
                        <Link to="/auth">Log In</Link>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 max-w-2xl">
              <h1 className="text-3xl font-bold mb-6">Community Feed</h1>

              {/* Mobile-only post form */}
              <div className="lg:hidden mb-6">
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
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Community;
