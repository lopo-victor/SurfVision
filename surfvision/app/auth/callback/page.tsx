// auth/callback/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { supabase } from "../../../../src/components/ui/lib/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      // Pega os parâmetros da URL (access_token, refresh_token, etc.)
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.replace("#", ""));
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");

      if (accessToken && refreshToken) {
        // Armazena a sessão manualmente
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          console.error("Erro ao configurar a sessão:", error);
          router.push("/login");
        } else {
          // Redireciona para a página inicial após o login bem-sucedido
          router.push("/");
        }
      } else {
        console.error("Tokens não encontrados na URL");
        router.push("/login");
      }
    };

    handleOAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-500 to-green-500 p-4">
      <div className="flex items-center space-x-3 mb-6">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-white"></div>
        <h2 className="text-2xl text-white font-semibold">Processando login...</h2>
      </div>
      <p className="text-center text-white opacity-75">
        Por favor, aguarde enquanto configuramos sua sessão.
      </p>
    </div>
  );
}


