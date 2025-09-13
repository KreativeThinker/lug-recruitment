"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const supabase = createClient();

      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Auth callback error:", error);
          router.push("/auth/login?error=" + encodeURIComponent(error.message));
          return;
        }

        if (data.session) {
          const user = data.session.user;
          console.log("[v0] User authenticated:", user.email);

          const { data: existingUser, error: fetchError } = await supabase
            .from("users")
            .select("role")
            .eq("id", user.id)
            .single();

          if (fetchError && fetchError.code !== "PGRST116") {
            console.error("[v0] Error fetching user:", fetchError);
            router.push("/auth/unauthorized");
            return;
          }

          if (!existingUser) {
            console.log("[v0] Creating user record for:", user.email);
            const { error: insertError } = await supabase.from("users").insert({
              id: user.id,
              email: user.email,
              role: "user", // Default role
            });

            if (insertError) {
              console.error("[v0] Error creating user:", insertError);
              router.push("/auth/unauthorized");
              return;
            }
          }

          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("role")
            .eq("id", user.id)
            .single();

          if (userError) {
            console.error("[v0] User data error:", userError);
            router.push("/auth/unauthorized");
            return;
          }

          console.log("[v0] User role:", userData?.role);

          if (userData?.role === "panelist") {
            router.push("/dashboard");
          } else {
            console.log(
              "[v0] User does not have panelist role, redirecting to unauthorized",
            );
            router.push("/auth/unauthorized");
          }
        } else {
          router.push("/auth/login");
        }
      } catch (error) {
        console.error("Callback handling error:", error);
        router.push("/auth/login");
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white">Completing sign in...</p>
      </div>
    </div>
  );
}
