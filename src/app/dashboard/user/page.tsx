
"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, MessageSquare, Settings, Star, Bookmark, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getUserDashboardStatsAction } from "@/lib/actions";
import type { UserDashboardStats } from "@/types/server";
import { useLanguage } from "@/context/language-context";

export default function UserDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<UserDashboardStats | null>(null);
  const { dictionary } = useLanguage();
  const t = dictionary.user_dashboard;

  const isLoadingAuth = status === 'loading';
  const isLoadingStats = status === 'authenticated' && stats === null;

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      getUserDashboardStatsAction()
        .then(setStats)
        .catch(error => {
          console.error("Failed to fetch dashboard stats:", error);
          setStats({
            feedbackSubmitted: 0,
            bookmarkedProjects: 0,
            bookmarkedNews: 0,
            averageRating: 0,
          });
        });
    }
  }, [status, router]);


  if (isLoadingAuth || isLoadingStats) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <Loader2 className="animate-spin h-12 w-12 text-primary" />
        <p className="ml-3 text-lg">Loading dashboard data...</p>
      </div>
    );
  }

  const user = session?.user;
  if (!user) {
    return (
         <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
            <Loader2 className="animate-spin h-12 w-12 text-primary" />
            <p className="ml-3 text-lg">Redirecting to login...</p>
        </div>
    );
  }

  const userName = user.name || user.email?.split('@')[0] || "User";
  const avatarName = user.name || user.email?.split('@')[0] || "User";
  const avatarUrl = user.image;


  return (
    <div className="space-y-8">
      <Card className="bg-gradient-to-r from-primary/10 via-background to-background shadow-sm">
        <CardHeader>
          <div className="flex flex-col items-center text-center sm:flex-row sm:items-center sm:text-left sm:space-x-4 space-y-2 sm:space-y-0">
            <Image
                src={avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(avatarName)}&background=13714C&color=fff&font-size=0.5`}
                alt={userName}
                width={80}
                height={80}
                className="rounded-full border-2 border-primary shrink-0"
            />
            <div>
                <CardTitle className="font-headline text-3xl text-primary">{t.title.replace('{name}', userName)}</CardTitle>
                <CardDescription className="text-md text-foreground/80">{t.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/dashboard/user/feedback" className="block h-full">
            <Card className="card-hover shadow-md h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.feedback_submitted}</CardTitle>
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats?.feedbackSubmitted ?? 0}</div>
                <p className="text-xs text-muted-foreground">
                {t.feedback_description}
                </p>
            </CardContent>
            </Card>
        </Link>
         <Card className="card-hover shadow-md h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.bookmarked_projects}</CardTitle>
            <Star className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.bookmarkedProjects ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              {t.bookmarked_description}
            </p>
          </CardContent>
        </Card>
         <Link href="/dashboard/user/bookmarked-news" className="block h-full">
            <Card className="card-hover shadow-md h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.bookmarked_news}</CardTitle>
                <Bookmark className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats?.bookmarkedNews ?? 0}</div>
                <p className="text-xs text-muted-foreground">
                {t.bookmarked_news_description}
                </p>
            </CardContent>
            </Card>
         </Link>
         <Card className="card-hover shadow-md h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.average_rating}</CardTitle>
            <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats?.averageRating ?? 0).toFixed(1)} / 5</div>
            <p className="text-xs text-muted-foreground">
             {t.average_rating_description}
            </p>
          </CardContent>
        </Card>
      </div>

 <Card className="shadow-xl rounded-2xl border border-muted bg-background/80 backdrop-blur-sm">
  <CardHeader className="pb-2">
    <CardTitle className="font-headline text-2xl">{t.quick_actions}</CardTitle>
  </CardHeader>

  <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {/* Action: Manage Profile */}
    <Button
      variant="outline"
      asChild
      className="group p-6 h-full text-left rounded-xl border hover:shadow-md transition-all duration-300"
    >
      <Link href="/dashboard/user/profile" className="flex items-start gap-4 w-full">
        <Settings className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-200 mt-1 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-lg font-semibold truncate">{t.manage_profile}</p>
          <p className="text-sm text-muted-foreground truncate">{t.manage_profile_description}</p>
        </div>
      </Link>
    </Button>

    {/* Action: View Feedback */}
    <Button
      variant="outline"
      asChild
      className="group p-6 h-full text-left rounded-xl border hover:shadow-md transition-all duration-300"
    >
      <Link href="/dashboard/user/feedback" className="flex items-start gap-4 w-full">
        <FileText className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-200 mt-1 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-lg font-semibold truncate">{t.view_my_feedback}</p>
          <p className="text-sm text-muted-foreground truncate">{t.view_my_feedback_description}</p>
        </div>
      </Link>
    </Button>

    {/* Action: Explore Projects */}
    <Button
      variant="default"
      asChild
      className="group p-6 h-full text-left rounded-xl sm:col-span-2 lg:col-span-1 hover:shadow-lg transition-all duration-300"
    >
      <Link href="/projects" className="flex items-start gap-4 w-full">
        <MessageSquare className="h-8 w-8 text-white group-hover:scale-110 transition-transform duration-200 mt-1 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-lg font-semibold text-white truncate">{t.explore_projects}</p>
          <p className="text-sm text-white/80 truncate">{t.explore_projects_description}</p>
        </div>
      </Link>
    </Button>
  </CardContent>
</Card>


    </div>
  );
}
