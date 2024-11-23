"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "../../../src/components/ui/lib/supabaseClient";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // Criação do usuário no Supabase Auth
      const { data, error } = await supabase.auth.signUp({ email, password });

      if (error) {
        console.error("Erro no cadastro:", error.message);
        setErrorMessage("Cadastro falhou. Verifique os dados.");
        setIsLoading(false);
        return;
      }

      const userId = data.user?.id;

      if (userId) {
        // Adiciona o usuário à tabela 'public.usuarios'
        const { error: insertError } = await supabase
          .from("usuarios")
          .insert([
            {
              id: userId, // ID do usuário gerado pelo Supabase Auth
              email: email,
              permissao: "common", // Define a permissão padrão como 'common'
            },
          ]);

        if (insertError) {
          console.error("Erro ao adicionar usuário à tabela 'usuarios':", insertError.message);
          setErrorMessage("Cadastro realizado, mas ocorreu um problema interno.");
        } else {
          setSuccessMessage("Cadastro realizado com sucesso! Verifique seu email.");
          setTimeout(() => router.push("/login"), 3000); // Redireciona após 3 segundos
        }
      } else {
        setErrorMessage("Erro ao recuperar informações do usuário.");
      }
    } catch (err) {
      console.error("Erro inesperado:", err);
      setErrorMessage("Ocorreu um erro inesperado.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-300 to-blue-700 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="bg-blue-500 py-6 text-center text-white">
          <h2 className="text-3xl font-bold">SurfVision</h2>
          <p className="text-sm mt-2">Cadastre-se para começar</p>
        </div>
        
        <div className="p-8">
          {errorMessage && (
            <p className="text-red-500 text-center mb-4 font-semibold">
              {errorMessage}
            </p>
          )}
          {successMessage && (
            <p className="text-green-500 text-center mb-4 font-semibold">
              {successMessage}
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
            onClick={handleSignup}
            disabled={isLoading}
          >
            {isLoading ? "Cadastrando..." : "Cadastrar"}
          </button>

          <p className="text-center mt-4 text-sm text-gray-600">
            Já tem uma conta?{" "}
            <a href="/login" className="text-blue-500 hover:underline font-semibold">
              Faça login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
