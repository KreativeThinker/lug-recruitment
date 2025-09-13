"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function UnauthorizedPage() {
  const [userInfo, setUserInfo] = useState<{
    email?: string;
    role?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserInfo = async () => {
      const supabase = createClient();

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          const { data: userData } = await supabase
            .from("users")
            .select("role")
            .eq("id", session.user.id)
            .single();

          setUserInfo({
            email: session.user.email,
            role: userData?.role || "not found",
          });
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
      } finally {
        setLoading(false);
      }
    };

    getUserInfo();
  }, []);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <Card className="w-full max-w-md bg-gray-900 border-gray-800">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-red-400">Access Denied</CardTitle>
          <CardDescription className="text-gray-400">
            You don't have permission to access this panel
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {!loading && userInfo && (
            <div className="bg-gray-800 p-3 rounded text-left text-sm">
              <p className="text-gray-300">
                <strong>Email:</strong> {userInfo.email}
              </p>
              <p className="text-gray-300">
                <strong>Current Role:</strong> {userInfo.role}
              </p>
              <p className="text-gray-300">
                <strong>Required Role:</strong> panelist
              </p>
            </div>
          )}

          <p className="text-gray-300 text-sm">
            Only users with the "panelist" role can access the recruitment admin
            panel. Please contact an administrator to update your role if you
            should have access.
          </p>

          <div className="space-y-2">
            <Button
              asChild
              className="bg-yellow-500 hover:bg-yellow-600 text-black w-full"
            >
              <Link href="/auth/login">Back to Login</Link>
            </Button>

            <Button
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-800 w-full bg-transparent"
              onClick={async () => {
                const supabase = createClient();
                await supabase.auth.signOut();
                window.location.href = "/auth/login";
              }}
            >
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
