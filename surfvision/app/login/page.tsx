// login/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "../../../src/components/ui/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setErrorMessage("Login falhou. Verifique suas credenciais.");
    } else {
      setErrorMessage(null);
      router.push("/"); // Redireciona para a página principal após login
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:3000/auth/callback", // Altere para o URL da sua aplicação em produção
      },
    });

    if (error) {
      console.error("Erro no login com Google:", error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-700 to-blue-300 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="bg-blue-500 py-6 text-center text-white">
          <h2 className="text-3xl font-bold">SurfVision</h2>
          <p className="text-sm mt-2">Faça login para continuar</p>
        </div>
        
        <div className="p-8">
          {errorMessage && (
            <p className="text-red-500 text-center mb-4 font-semibold">
              {errorMessage}
            </p>
          )}

          <input
            type="email"
            placeholder="Email"
            className="p-3 w-full mb-4 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200 transition"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Senha"
            className="p-3 w-full mb-4 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200 transition"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold p-3 w-full rounded-lg shadow-md transition-all duration-300"
            onClick={handleLogin}
          >
            Entrar
          </button>

          <p className="text-center mt-4 text-sm text-gray-600">
            Não tem uma conta?{" "}
            <a href="/signup" className="text-blue-500 hover:underline font-semibold">
              Cadastre-se
            </a>
          </p>

          <div className="mt-6 flex items-center justify-center">
            <span className="border-t w-1/5"></span>
            <span className="text-gray-500 mx-2">ou</span>
            <span className="border-t w-1/5"></span>
          </div>

          <button
            className="bg-red-500 hover:bg-red-600 text-white font-semibold p-3 w-full rounded-lg shadow-md mt-4 transition-all duration-300 flex items-center justify-center"
            onClick={handleGoogleLogin}
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
            >
              <path
                fill="#4285F4"
                d="M24 9.5c3.9 0 7.2 1.3 9.8 3.6l7.2-7.2C36.6 2.7 30.7 0 24 0 14.5 0 6.4 5.7 2.4 13.9l8.2 6.4C12.9 14.2 18 9.5 24 9.5z"
              />
              <path
                fill="#34A853"
                d="M46.6 24.3c0-1.7-.1-3.3-.4-4.9H24v9.3h12.8c-.6 3.1-2.4 5.8-5.2 7.5v6.2h8.3c4.9-4.6 6.7-11.5 6.7-18.1z"
              />
              <path
                fill="#FBBC05"
                d="M10.6 29.1c-.6-1.9-.9-4-.9-6.1s.3-4.2.9-6.1V10.6H2.4C.9 14.1 0 18 0 22s.9 7.9 2.4 11.4l8.2-6.4z"
              />
              <path
                fill="#EA4335"
                d="M24 48c6.5 0 12-2.1 16.1-5.7l-8.3-6.2c-2.2 1.5-5 2.4-7.8 2.4-6.1 0-11.2-4.3-13.1-10.1H2.4l-8.2 6.4C6.4 42.3 14.5 48 24 48z"
              />
            </svg>
            Entrar com Google
          </button>
        </div>
      </div>
    </div>
  );
}
