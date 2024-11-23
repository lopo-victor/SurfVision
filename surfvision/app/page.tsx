"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BsWater } from "react-icons/bs";
import { supabase } from "../../src/components/ui/lib/supabaseClient";

interface SurfSpot {
  id: number;
  name: string;
  spot_info: string;
  video_url: string;
}

export default function SurfSpotsPage() {
  const [surfSpots, setSurfSpots] = useState<SurfSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpot, setSelectedSpot] = useState<SurfSpot | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [spotName, setSpotName] = useState("");
  const [spotInfo, setSpotInfo] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [permission, setPermission] = useState(""); // Novo estado para a permissão
  const router = useRouter();

  // Verifica se o usuário está autenticado e obtém a permissão
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login"); // Redireciona para a página de login se não estiver autenticado
      } else {
        setIsAuthenticated(true); // Define como autenticado se houver sessão
        // Obtém a permissão do usuário
        const userId = session.user.id;
        const { data, error } = await supabase
          .from("usuarios")
          .select("permissao")
          .eq("id", userId)
          .single();

        if (error || !data) {
          console.error("Erro ao obter a permissão do usuário:", error);
          // Você pode definir uma permissão padrão ou redirecionar o usuário
        } else {
          setPermission(data.permissao);
        }
      }
    };

    checkAuth();
  }, [router]);

  // Carrega os surf spots apenas se o usuário estiver autenticado
  useEffect(() => {
    if (isAuthenticated) {
      async function loadSpots() {
        try {
          const { data, error } = await supabase.from("surf_spots").select("*");
          if (error) {
            console.error("Erro ao buscar os spots de surfe:", error);
          } else {
            setSurfSpots(data);
          }
        } catch (error) {
          console.error("Erro ao conectar ao Supabase:", error);
        } finally {
          setLoading(false);
        }
      }
      loadSpots();
    }
  }, [isAuthenticated]);

  const handleVideoUpload = async () => {
    if (!selectedSpot || !videoFile) {
      alert("Por favor, selecione uma praia e um vídeo.");
      return;
    }

    try {
      const { data, error: uploadError } = await supabase.storage
        .from("spotView")
        .upload(`videos/${selectedSpot.id}/${videoFile.name}`, videoFile);

      if (uploadError) {
        console.error("Erro no upload do vídeo:", uploadError);
        alert("Falha no upload do vídeo");
        return;
      }

      const { publicUrl } = supabase.storage
        .from("spotView")
        .getPublicUrl(`videos/${selectedSpot.id}/${videoFile.name}`).data;

      const { error: updateError } = await supabase
        .from("surf_spots")
        .update({ video_url: publicUrl })
        .eq("id", selectedSpot.id);

      if (updateError) {
        console.error("Erro ao atualizar o spot:", updateError);
        alert("Erro ao atualizar o spot.");
      } else {
        alert("Vídeo enviado com sucesso!");
        setVideoFile(null);
        setSurfSpots(
          surfSpots.map((spot) =>
            spot.id === selectedSpot.id
              ? { ...spot, video_url: publicUrl }
              : spot
          )
        );
      }
    } catch (error) {
      console.error("Erro no processo de upload/atualização:", error);
    }
  };

  const handleEditSpot = async () => {
    if (!spotName || !spotInfo || !selectedSpot) {
      alert("Por favor, preencha os campos necessários.");
      return;
    }

    try {
      const { error } = await supabase
        .from("surf_spots")
        .update({
          name: spotName,
          spot_info: spotInfo,
        })
        .eq("id", selectedSpot.id);

      if (error) {
        alert("Erro ao atualizar o spot.");
      } else {
        const updatedSpots = surfSpots.map((spot) =>
          spot.id === selectedSpot.id
            ? { ...spot, name: spotName, spot_info: spotInfo }
            : spot
        );
        setSurfSpots(updatedSpots);
        alert("Spot atualizado com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao atualizar o spot:", error);
    }
  };

  const handleDeleteSpot = async (spotId) => {
    if (!confirm("Tem certeza que deseja excluir este spot?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("surf_spots")
        .delete()
        .eq("id", spotId);

      if (error) {
        alert("Erro ao excluir o spot.");
      } else {
        setSurfSpots(surfSpots.filter((spot) => spot.id !== spotId));
        alert("Spot excluído com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao excluir o spot:", error);
    }
  };

  if (!isAuthenticated || !permission) {
    return <div className="text-center text-white">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 via-blue-300 to-blue-600 p-4 text-gray-800">
      {/* Conteúdo da página, apenas se autenticado */}
      <div className="container mx-auto max-w-3xl">
        {/* Adiciona a logo no topo */}
        <div className="flex justify-center mb-6">
          <Image
            src="/logo.png"
            alt="SurfVision Logo"
            width={150 * 2}
            height={75 * 2}
            priority={true}
            className="rounded-lg"
          />
        </div>

        {/* Renderiza componentes de edição apenas para 'editor' e 'admin' */}
        {(permission === "editor" || permission === "admin") && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-10">
            <h2 className="text-2xl font-bold text-center text-blue-500 mb-4">
              Enviar/Editar Spot
            </h2>
            <div className="flex flex-col gap-4 items-center bg-white bg-opacity-50 backdrop-blur-md p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
              <select
                className="p-3 rounded-lg w-full md:w-2/3 bg-gradient-to-r from-gray-100 via-white to-gray-100 border border-gray-300 focus:ring-2 focus:ring-blue-500 shadow-sm transition-all duration-300 hover:bg-gray-50"
                onChange={(e) => {
                  const spot = surfSpots.find(
                    (spot) => spot.id === Number(e.target.value)
                  );
                  setSelectedSpot(spot || null);
                  setSpotName(spot?.name || "");
                  setSpotInfo(spot?.spot_info || "");
                }}
                value={selectedSpot?.id || ""}
              >
                <option value="" disabled>
                  Selecione uma praia
                </option>
                {surfSpots.map((spot) => (
                  <option key={spot.id} value={spot.id}>
                    {spot.name}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Nome da Praia"
                value={spotName}
                onChange={(e) => setSpotName(e.target.value)}
                className="p-3 rounded-lg w-full md:w-2/3 bg-gradient-to-r from-gray-100 via-white to-gray-100 border border-gray-300 focus:ring-2 focus:ring-blue-500 shadow-sm transition-all duration-300 hover:bg-gray-50"
              />

              <textarea
                placeholder="Informações do Spot (ex.: raso, tem muitas pedras)"
                value={spotInfo}
                onChange={(e) => setSpotInfo(e.target.value)}
                className="p-3 rounded-lg w-full md:w-2/3 bg-gradient-to-r from-gray-100 via-white to-gray-100 border border-gray-300 focus:ring-2 focus:ring-blue-500 shadow-sm transition-all duration-300 hover:bg-gray-50"
              />

              <input
                type="file"
                accept="video/*"
                onChange={(e) =>
                  setVideoFile(e.target.files ? e.target.files[0] : null)
                }
                className="p-3 rounded-lg w-full md:w-2/3 bg-gradient-to-r from-gray-100 via-white to-gray-100 border border-gray-300 focus:ring-2 focus:ring-blue-500 shadow-sm transition-all duration-300 hover:bg-gray-50"
              />

              <button
                onClick={handleVideoUpload}
                className="p-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg shadow-lg transition-all duration-300 md:w-2/3"
              >
                Enviar Vídeo
              </button>

              <button
                onClick={handleEditSpot}
                className="p-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg shadow-lg transition-all duration-300 md:w-2/3"
              >
                Editar Spot
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4 mb-8">
          {loading ? (
            <div className="flex justify-center">
              <div className="spinner-border animate-spin inline-block w-16 h-16 border-4 rounded-full border-white border-t-transparent"></div>
            </div>
          ) : surfSpots.length > 0 ? (
            surfSpots.map((spot) => (
              <div
                key={spot.id}
                onClick={() => setSelectedSpot(spot)}
                className={`cursor-pointer bg-white rounded-lg shadow-lg p-6 text-gray-800 hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${
                  selectedSpot?.id === spot.id ? "bg-blue-200" : ""
                }`}
              >
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                  <BsWater className="text-blue-500" /> {spot.name}
                </h2>
                <p className="text-lg">
                  Informações do Spot:{" "}
                  <span className="font-semibold">{spot.spot_info}</span>
                </p>

                {selectedSpot?.id === spot.id && (
                  <div className="mt-4 transition-all duration-500 opacity-100">
                    {spot.video_url ? (
                      <video
                        controls
                        className="w-full h-64 object-cover rounded-lg shadow-md mt-4"
                      >
                        <source src={spot.video_url} type="video/mp4" />
                        Seu navegador não suporta o elemento de vídeo.
                      </video>
                    ) : (
                      <p className="text-center text-gray-500">
                        Nenhum vídeo disponível para esta praia.
                      </p>
                    )}
                  </div>
                )}

                {/* Renderiza o botão de exclusão apenas para 'admin' */}
                {permission === "admin" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Evita acionar o onClick do div pai
                      handleDeleteSpot(spot.id);
                    }}
                    className="mt-4 p-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg shadow-lg transition-all duration-300"
                  >
                    Excluir Spot
                  </button>
                )}
              </div>
            ))
          ) : (
            <p className="text-center text-white">
              Nenhum surf spot encontrado.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
