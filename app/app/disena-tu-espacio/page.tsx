"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Leaf, Pencil } from "lucide-react";
import { formatQ } from "@/lib/utils";
import { SpaceUpload } from "@/components/space-analysis/SpaceUpload";
import { SpacePhotoPreview } from "@/components/space-analysis/SpacePhotoPreview";
import { SpaceDesignDecoration } from "@/components/space-analysis/SpaceDesignDecoration";
import { SpaceDesignFeatures } from "@/components/space-analysis/SpaceDesignFeatures";
import { SpaceQuestionnaire } from "@/components/space-analysis/SpaceQuestionnaire";
import { AnalysisProgress } from "@/components/space-analysis/AnalysisProgress";
import { SpaceAnalyzingPreview } from "@/components/space-analysis/SpaceAnalyzingPreview";
import { RoomAnalysisSummary } from "@/components/space-analysis/RoomAnalysisSummary";
import { SpaceImageWithMarkers } from "@/components/space-analysis/SpaceImageWithMarkers";
import { ManualPlacementEditor } from "@/components/space-analysis/ManualPlacementEditor";
import { PlacementSizeSelector } from "@/components/space-analysis/PlacementSizeSelector";
import { RecommendationPanel } from "@/components/space-analysis/RecommendationPanel";
import { PlacementAccessorySelector } from "@/components/space-analysis/PlacementAccessorySelector";
import { ProposalSummary, SelectedPlant } from "@/components/space-analysis/ProposalSummary";
import { track } from "@/lib/analytics";
import {
  RoomAnalysis,
  SpaceQuestionnaire as SpaceQuestionnaireType,
  PlacementLocation,
} from "@/types/space-analysis";
import { Plant } from "@/types";
import { PlantScore } from "@/lib/recommendations/plant-scoring";
import { createProposal, updateProposal } from "@/lib/supabase/proposals";
import { createSpace } from "@/lib/supabase/spaces";
import { createSpaceImage } from "@/lib/supabase/space-images";
import { createSpaceAnalysis } from "@/lib/supabase/space-analyses";
import {
  getPlantersCached,
  getAccessoriesCached,
  getAccessoriesByCategory,
} from "@/lib/supabase-queries";
import { Planter } from "@/types";
import { Accessory } from "@/data/accessories";
import { getOrCreateSessionId } from "@/lib/session";
import { CreationComponent, useCartStore } from "@/lib/store";

function getPlanterPrice(planters: Planter[], planterId?: string): number {
  if (!planterId) return 0;
  return planters.find((p) => p.id === planterId)?.priceQ || 0;
}

function getPlatoPrice(platos: Accessory[], platoId?: string): number {
  if (!platoId) return 0;
  return platos.find((p) => p.id === platoId)?.priceQ || 0;
}

const manualReasoning = (type: PlacementLocation["placementType"]) =>
  ({
    floor: "En el piso, en el punto que elegiste",
    table: "Sobre una mesa o mueble, en el punto que elegiste",
    shelf: "Sobre una repisa, en el punto que elegiste",
    hanging: "Colgante, en el punto que elegiste",
  })[type];

type FlowState = "upload" | "questionnaire" | "analyzing" | "results";

interface PlacementRecommendations {
  [placementId: string]: Array<{ plant: Plant; score: PlantScore; reasons: string[]; warnings: string[] }>;
}

export default function DesignSpacePage() {
  const router = useRouter();
  const [flowState, setFlowState] = useState<FlowState>("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [questionnaire, setQuestionnaire] = useState<SpaceQuestionnaireType | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<RoomAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlacementId, setSelectedPlacementId] = useState<string | null>(null);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [placementRecommendations, setPlacementRecommendations] = useState<PlacementRecommendations>({});
  const [selectedPlants, setSelectedPlants] = useState<SelectedPlant[]>([]);
  const [spaceId, setSpaceId] = useState<string | null>(null);
  const [planters, setPlanters] = useState<Planter[]>([]);
  const [platos, setPlatos] = useState<Accessory[]>([]);
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [isSavingProposal, setIsSavingProposal] = useState(false);
  const [showFullCatalog, setShowFullCatalog] = useState(false);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [addMode, setAddMode] = useState(false);
  const [plantPickerExpanded, setPlantPickerExpanded] = useState(true);
  const [addedToCart, setAddedToCart] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(
    null
  );
  const [isGeneratingViz, setIsGeneratingViz] = useState(false);
  const [savedProposalId, setSavedProposalId] = useState<string | null>(null);
  const addToCart = useCartStore((s) => s.add);
  const visualizationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  }, [selectedFile]);

  useEffect(() => {
    getPlantersCached().then(setPlanters).catch(() => setPlanters([]));
    getAccessoriesCached()
      .then((accessories) =>
        setPlatos(getAccessoriesByCategory(accessories, "plato"))
      )
      .catch(() => setPlatos([]));
  }, []);

  const getRecommendationCacheKey = (placementId: string, fullCatalog: boolean) =>
    fullCatalog ? `${placementId}__all` : placementId;

  const loadPlacementRecommendations = useCallback(
    async (
      placementId: string,
      roomAnalysis: RoomAnalysis,
      options?: { fullCatalog?: boolean; force?: boolean }
    ) => {
      const fullCatalog = options?.fullCatalog ?? false;
      const cacheKey = getRecommendationCacheKey(placementId, fullCatalog);

      if (!options?.force && placementRecommendations[cacheKey]) return;

      if (fullCatalog) {
        setCatalogLoading(true);
      } else {
        setRecommendationsLoading(true);
      }

      try {
        const userPreferences = {
          roomType: questionnaire?.roomType,
          hasPets: questionnaire?.hasPets,
          directSun: questionnaire?.directSun,
          desiredMaintenance: questionnaire?.desiredMaintenance,
          maxBudget: questionnaire?.budget,
          preferredSizes: questionnaire?.preferredSizes,
        };

        const response = await fetch("/api/recommend-plants", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            fullCatalog
              ? {
                  analysis: roomAnalysis,
                  placementId,
                  userPreferences,
                }
              : {
                  analysis: roomAnalysis,
                  limit: 3,
                  userPreferences,
                }
          ),
        });

        if (!response.ok) {
          throw new Error("Error loading recommendations");
        }

        const result = await response.json();

        if (fullCatalog) {
          setPlacementRecommendations((prev) => ({
            ...prev,
            [cacheKey]: result.recommendations,
          }));
        } else {
          const placeRecs = result.recommendations.find(
            (r: { placementId: string }) => r.placementId === placementId
          );

          if (placeRecs) {
            setPlacementRecommendations((prev) => ({
              ...prev,
              [cacheKey]: placeRecs.recommendations,
            }));
          }
        }
      } catch (err) {
        console.error("Error loading recommendations:", err);
      } finally {
        setRecommendationsLoading(false);
        setCatalogLoading(false);
      }
    },
    [questionnaire, placementRecommendations]
  );

  useEffect(() => {
    if (!selectedPlacementId || !analysis) return;

    const cacheKey = getRecommendationCacheKey(selectedPlacementId, showFullCatalog);
    if (!placementRecommendations[cacheKey]) {
      loadPlacementRecommendations(selectedPlacementId, analysis, {
        fullCatalog: showFullCatalog,
      });
    }
  }, [
    selectedPlacementId,
    analysis,
    showFullCatalog,
    placementRecommendations,
    loadPlacementRecommendations,
  ]);

  const handleToggleCatalog = useCallback(
    (expanded: boolean) => {
      setShowFullCatalog(expanded);
      if (selectedPlacementId && analysis) {
        loadPlacementRecommendations(selectedPlacementId, analysis, {
          fullCatalog: expanded,
          force: !placementRecommendations[
            getRecommendationCacheKey(selectedPlacementId, expanded)
          ],
        });
      }
    },
    [selectedPlacementId, analysis, loadPlacementRecommendations, placementRecommendations]
  );

  const handleImageSelect = useCallback((file: File) => {
    track("space_upload_started", { fileSize: file.size });
    setSelectedFile(file);
    setFlowState("questionnaire");
    setError(null);
  }, []);

  const handleSelectPlant = useCallback(
    (plantId: string, plant: Plant) => {
      if (!selectedPlacementId) return;

      const existing = selectedPlants.find(
        (p) => p.placementId === selectedPlacementId && p.plantId === plantId
      );

      // One plant per placement: selecting a new plant replaces whatever
      // was already chosen for that spot instead of stacking selections.
      const withoutThisPlacement = selectedPlants.filter(
        (p) => p.placementId !== selectedPlacementId
      );

      if (existing) {
        setSelectedPlants(withoutThisPlacement);
      } else {
        setSelectedPlants([
          ...withoutThisPlacement,
          {
            placementId: selectedPlacementId,
            plantId,
            plant,
            quantity: 1,
          },
        ]);
        setPlantPickerExpanded(false);
      }

      track("plant_recommendation_selected", {
        plantId,
        placementId: selectedPlacementId,
      });
      setAddedToCart(false);
      setGeneratedImageUrl(null);
      setSavedProposalId(null);
    },
    [selectedPlacementId, selectedPlants]
  );

  const handleChangePlant = useCallback((placementId: string) => {
    setShowFullCatalog(false);
    setSelectedPlacementId(placementId);
    setPlantPickerExpanded(true);
  }, []);

  const handleAddPlacement = useCallback((x: number, y: number) => {
    const id = `manual_${Date.now()}`;
    const newPlacement: PlacementLocation = {
      id,
      x,
      y,
      placementType: "floor",
      recommendedPlantSize: "medium",
      availableWidth: "medium",
      reasoning: "En el piso, en el punto que elegiste",
      source: "manual",
    };
    setAnalysis((prev) =>
      prev ? { ...prev, placements: [...prev.placements, newPlacement] } : prev
    );
    setAddMode(false);
    setShowFullCatalog(false);
    setSelectedPlacementId(id);
    track("space_manual_placement_added", { x, y });
  }, []);

  const handleMovePlacement = useCallback((id: string, x: number, y: number) => {
    setAnalysis((prev) =>
      prev
        ? {
            ...prev,
            placements: prev.placements.map((p) =>
              p.id === id ? { ...p, x, y } : p
            ),
          }
        : prev
    );
  }, []);

  const handleUpdatePlacement = useCallback(
    (id: string, patch: Partial<PlacementLocation>) => {
      // Keep the location description in sync with the chosen type so it reads
      // well in the UI and guides the proposal-image generation.
      const fullPatch = patch.placementType
        ? { ...patch, reasoning: manualReasoning(patch.placementType) }
        : patch;
      setAnalysis((prev) =>
        prev
          ? {
              ...prev,
              placements: prev.placements.map((p) =>
                p.id === id ? { ...p, ...fullPatch } : p
              ),
            }
          : prev
      );
      // Placement props feed the scoring, so invalidate cached recommendations
      // for this spot; the effect will refetch with the updated placement.
      setPlacementRecommendations((prev) => {
        const next = { ...prev };
        delete next[id];
        delete next[`${id}__all`];
        return next;
      });
    },
    []
  );

  const handleRemovePlacement = useCallback((id: string) => {
    setAnalysis((prev) =>
      prev
        ? { ...prev, placements: prev.placements.filter((p) => p.id !== id) }
        : prev
    );
    setSelectedPlants((prev) => prev.filter((p) => p.placementId !== id));
    setSelectedPlacementId((cur) => (cur === id ? null : cur));
    setPlacementRecommendations((prev) => {
      const next = { ...prev };
      delete next[id];
      delete next[`${id}__all`];
      return next;
    });
  }, []);

  const handleChangePlanter = useCallback(
    (placementId: string, planterId: string | undefined) => {
      setSelectedPlants((prev) =>
        prev.map((p) => (p.placementId === placementId ? { ...p, planterId } : p))
      );
      setAddedToCart(false);
      setGeneratedImageUrl(null);
      setSavedProposalId(null);
    },
    []
  );

  const handleChangePlato = useCallback(
    (placementId: string, platoId: string | undefined) => {
      setSelectedPlants((prev) =>
        prev.map((p) => (p.placementId === placementId ? { ...p, platoId } : p))
      );
      setAddedToCart(false);
      setGeneratedImageUrl(null);
      setSavedProposalId(null);
    },
    []
  );

  const handleAddToCart = useCallback(
    (plants: SelectedPlant[]) => {
      plants.forEach((item) => {
        const planter = item.planterId
          ? planters.find((p) => p.id === item.planterId)
          : undefined;
        const plato = item.platoId
          ? platos.find((p) => p.id === item.platoId)
          : undefined;
        const planterPriceQ = getPlanterPrice(planters, item.planterId);
        const platoPriceQ = getPlatoPrice(platos, item.platoId);
        const priceQ = item.plant.basePriceQ + planterPriceQ + platoPriceQ;

        const components: CreationComponent[] = [
          {
            label: "Planta",
            name: item.plant.name,
            priceQ: item.plant.basePriceQ,
            image: item.plant.images?.[0],
            description:
              item.plant.shortDescription || item.plant.scientificName,
          },
        ];
        if (planter) {
          components.push({
            label: "Maceta",
            name: `${planter.name} (${planter.color})`,
            priceQ: planterPriceQ,
            image: planter.image,
            description: [planter.material, planter.color]
              .filter(Boolean)
              .join(" · "),
          });
        }
        if (plato) {
          components.push({
            label: "Plato",
            name: plato.attrs?.["Color"] || plato.name,
            priceQ: platoPriceQ,
            image: plato.image,
            description: plato.attrs?.["Material"],
          });
        }

        addToCart(
          {
            id: `diseno-${item.placementId}-${item.plantId}-${item.planterId ?? "x"}-${item.platoId ?? "x"}`,
            kind: "propuesta",
            name: item.plant.name,
            subtitle: "Diseña tu espacio",
            image:
              item.plant.images?.[0] || "/images/plant-placeholder.svg",
            priceQ,
            components,
          },
          item.quantity
        );
      });

      track("add_to_cart", {
        source: "design_space",
        itemCount: plants.length,
        priceQ: plants.reduce(
          (sum, p) =>
            sum +
            (p.plant.basePriceQ +
              getPlanterPrice(planters, p.planterId) +
              getPlatoPrice(platos, p.platoId)) *
              p.quantity,
          0
        ),
      });
      setAddedToCart(true);
    },
    [planters, platos, addToCart]
  );

  const handleGenerateVisualization = useCallback(
    async (plants: SelectedPlant[]) => {
      if (!analysis || !imagePreviewUrl || !selectedFile) return;
      if (plants.length === 0) return;

      setIsGeneratingViz(true);
      setError(null);
      try {
        const base64 = imagePreviewUrl.split(",")[1];
        const mimeType = selectedFile.type;

        const generationItems = plants
          .map((p) => {
            const placement = analysis.placements.find(
              (pl) => pl.id === p.placementId
            );
            if (!placement) return null;
            const planter = p.planterId
              ? planters.find((pl) => pl.id === p.planterId)
              : undefined;
            const plato = p.platoId
              ? platos.find((pl) => pl.id === p.platoId)
              : undefined;
            return {
              plant: p.plant,
              placement,
              quantity: p.quantity,
              planter: planter
                ? {
                    name: planter.name,
                    color: planter.color,
                    material: planter.material,
                    image: planter.image,
                  }
                : undefined,
              plato: plato
                ? {
                    name: plato.name,
                    color: plato.attrs?.["Color"],
                    material: plato.attrs?.["Material"],
                    image: plato.image,
                  }
                : undefined,
            };
          })
          .filter(Boolean);

        const imgResponse = await fetch("/api/generate-proposal-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageBase64: base64,
            imageMediaType: mimeType,
            items: generationItems,
          }),
        });

        if (!imgResponse.ok) {
          if (imgResponse.status === 504 || imgResponse.status === 503) {
            throw new Error(
              "La visualización tardó demasiado. Intenta con menos plantas o vuelve a intentar."
            );
          }
          const errBody = await imgResponse.json().catch(() => null);
          throw new Error(
            errBody?.error || "No se pudo generar la visualización"
          );
        }

        const imgResult = await imgResponse.json();
        const mediaType = imgResult.mediaType || "image/png";
        const dataUrl = `data:${mediaType};base64,${imgResult.imageBase64}`;
        setGeneratedImageUrl(dataUrl);
        setAddedToCart(false);
        setSavedProposalId(null);

        track("proposal_visualization_generated", {
          itemCount: generationItems.length,
        });

        setTimeout(() => {
          visualizationRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 100);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Error al generar la visualización";
        setError(message);
        track("proposal_visualization_failed", { error: message });
      } finally {
        setIsGeneratingViz(false);
      }
    },
    [analysis, imagePreviewUrl, selectedFile, planters, platos]
  );

  const handleSaveProposal = useCallback(
    async (plants: SelectedPlant[]) => {
      if (!spaceId || !analysisId || !analysis) return;

      setIsSavingProposal(true);
      try {
        const items = plants.map((p) => ({
          placementId: p.placementId,
          plantId: p.plantId,
          quantity: p.quantity,
          priceQ:
            p.plant.basePriceQ +
            getPlanterPrice(planters, p.planterId) +
            getPlatoPrice(platos, p.platoId),
          planterId: p.planterId,
          planterPriceQ: getPlanterPrice(planters, p.planterId),
          platoId: p.platoId,
          platoPriceQ: getPlatoPrice(platos, p.platoId),
        }));

        const proposal = await createProposal(
          getOrCreateSessionId(),
          spaceId,
          analysisId,
          items
        );

        track("proposal_created", {
          proposalId: proposal.id,
          itemCount: items.length,
          totalPrice: proposal.total_price_q,
        });

        if (generatedImageUrl) {
          await updateProposal(proposal.id, {
            generated_image_url: generatedImageUrl,
            generated_image_status: "completed",
          });
        }

        setSavedProposalId(proposal.id);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error al guardar";
        setError(message);
        track("proposal_save_failed", { error: message });
      } finally {
        setIsSavingProposal(false);
      }
    },
    [
      spaceId,
      analysisId,
      analysis,
      generatedImageUrl,
      planters,
      platos,
    ]
  );

  const handleQuestionnaireSubmit = useCallback(
    async (data: SpaceQuestionnaireType) => {
      if (!selectedFile || !imagePreviewUrl) return;

      track("space_analysis_started", {
        roomType: data.roomType,
        hasPets: data.hasPets,
      });

      setQuestionnaire(data);
      setFlowState("analyzing");
      setError(null);

      try {
        const base64 = imagePreviewUrl.split(",")[1];
        const mimeType = selectedFile.type as "image/jpeg" | "image/png" | "image/webp";

        const response = await fetch("/api/analyze-space", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageBase64: base64,
            imageMediaType: mimeType,
            questionnaire: data,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Análisis fallido");
        }

        const result = await response.json();
        setAnalysis(result.analysis);

        // Save to Supabase
        const sessionId = getOrCreateSessionId();
        const space = await createSpace(
          sessionId,
          undefined,
          data.roomType
        );
        setSpaceId(space.id);

        const spaceAnalysis = await createSpaceAnalysis(
          space.id,
          null,
          result.analysis
        );
        setAnalysisId(spaceAnalysis.id);

        setFlowState("results");
        track("space_analysis_completed", {
          confidence: result.analysis.confidence,
          spaceId: space.id,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error desconocido";
        setError(message);
        setFlowState("questionnaire");
        track("space_analysis_failed", { error: message });
      }
    },
    [selectedFile, imagePreviewUrl]
  );

  const handleChangePhoto = useCallback(() => {
    setSelectedFile(null);
    setImagePreviewUrl(null);
    setFlowState("upload");
  }, []);

  // The upload/questionnaire steps are laid out to fit the viewport without page
  // scroll (internal panels scroll instead), only on lg+ to keep mobile usable.
  // Results is intentionally excluded so the page scrolls naturally and the
  // recommendations/proposal panels are not squeezed.
  const fixedShell =
    flowState === "upload" || flowState === "questionnaire";

  return (
    <div
      className={
        fixedShell
          ? "relative flex flex-col lg:h-[calc(100dvh-4rem)] lg:overflow-hidden"
          : ""
      }
    >
      {flowState === "upload" && <SpaceDesignDecoration />}

      <div
        className={
          fixedShell
            ? "container-app relative flex min-h-0 flex-1 flex-col py-4 sm:py-5"
            : "container-app relative py-10"
        }
      >
        <div
          className={flowState === "analyzing" ? "mb-8" : "mb-4 shrink-0"}
        >
          <button
            type="button"
            onClick={() => {
              if (flowState === "questionnaire") handleChangePhoto();
              else if (flowState !== "upload") router.back();
            }}
            className="flex items-center gap-2 text-sm font-semibold text-brand-forest hover:opacity-70"
          >
            <ArrowLeft className="h-4 w-4" />
            Atrás
          </button>

          <span
            className={`eyebrow inline-flex items-center gap-2 ${
              flowState === "upload" ? "mt-3" : "mt-4"
            }`}
          >
            <Leaf className="h-3.5 w-3.5" />
            Diseña tu espacio
          </span>

          <h1
            className={`mt-2 font-serif text-brand-forest ${
              flowState === "upload"
                ? "text-3xl sm:text-4xl"
                : flowState === "results"
                  ? "text-2xl sm:text-3xl"
                  : "mt-3 text-4xl sm:text-5xl"
            }`}
          >
            {flowState === "upload" && "Sube una foto"}
            {flowState === "questionnaire" && "Cuéntanos sobre tu espacio"}
            {flowState === "analyzing" && "Analizando..."}
            {flowState === "results" && "Tus recomendaciones"}
          </h1>

          {flowState === "upload" && (
            <>
              <p className="mt-1 max-w-lg text-sm text-brand-carbon/65">
                Empieza a transformar tu espacio con el poder de la naturaleza.
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="h-px w-8 bg-brand-beige" />
                <Leaf className="h-3.5 w-3.5 text-brand-moss" />
                <span className="h-px w-8 bg-brand-beige" />
              </div>
            </>
          )}

          {flowState === "questionnaire" && (
            <p className="mt-2 max-w-2xl text-sm text-brand-carbon/65">
              Responde las siguientes preguntas para que podamos recomendarte las
              plantas ideales para tu espacio.
            </p>
          )}
        </div>

        {flowState === "upload" && (
          <div className="relative mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col gap-4">
            <div className="flex min-h-0 flex-1 items-center">
              <div className="w-full">
                <SpaceUpload onImageSelect={handleImageSelect} />
              </div>
            </div>
            <SpaceDesignFeatures />
          </div>
        )}

        {flowState === "questionnaire" && imagePreviewUrl && (
          <div className="mx-auto grid w-full max-w-6xl gap-6 lg:min-h-0 lg:flex-1 lg:grid-cols-2 lg:items-start lg:overflow-y-auto">
            <SpacePhotoPreview
              imageUrl={imagePreviewUrl}
              onChangePhoto={handleChangePhoto}
            />
            <SpaceQuestionnaire
              onSubmit={handleQuestionnaireSubmit}
              isLoading={false}
            />
          </div>
        )}

        {flowState === "analyzing" && (
          <div className="mx-auto w-full max-w-2xl space-y-8">
            {imagePreviewUrl && (
              <SpaceAnalyzingPreview imageUrl={imagePreviewUrl} />
            )}
            <AnalysisProgress
              steps={[
                { id: "upload", label: "Fotografía cargada", status: "completed" },
                { id: "analyze", label: "Analizando el espacio", status: "in-progress" },
                { id: "recommend", label: "Buscando plantas", status: "pending" },
              ]}
            />
          </div>
        )}

        {flowState === "results" && analysis && (
          <div className="grid gap-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
            {/* Izquierda: foto + análisis (sticky en escritorio) */}
            <div className="flex flex-col gap-3 lg:sticky lg:top-4 lg:self-start">
              <div className="lg:h-[60vh]">
                <SpaceImageWithMarkers
                  imageUrl={imagePreviewUrl || ""}
                  placements={analysis.placements}
                  selectedPlacementId={selectedPlacementId ?? undefined}
                  addMode={addMode}
                  onToggleAddMode={() => setAddMode((v) => !v)}
                  onAddPlacement={handleAddPlacement}
                  onMovePlacement={handleMovePlacement}
                  onPlacementSelect={(p) => {
                    setShowFullCatalog(false);
                    setSelectedPlacementId(p.id);
                    setPlantPickerExpanded(
                      !selectedPlants.some((sp) => sp.placementId === p.id)
                    );
                    track("space_marker_selected", { placementId: p.id });
                  }}
                />
              </div>
              <div className="shrink-0">
                <RoomAnalysisSummary analysis={analysis} />
              </div>
            </div>

            {/* Derecha: recomendaciones (arriba) + propuesta (abajo) */}
            <div className="flex min-w-0 flex-col gap-4">
              <div className="flex min-w-0 flex-col rounded-xl border border-brand-beige bg-white">
                <div className="shrink-0 border-b border-brand-beige/60 px-5 py-3">
                  <h3 className="font-semibold text-brand-forest">
                    {selectedPlacementId &&
                    selectedPlants.some(
                      (sp) => sp.placementId === selectedPlacementId
                    ) &&
                    !plantPickerExpanded
                      ? "Personaliza tu planta"
                      : "Recomendaciones"}
                  </h3>
                  <p className="text-xs text-brand-carbon/60">
                    {!selectedPlacementId
                      ? "Selecciona una ubicación en la foto"
                      : selectedPlants.some(
                            (sp) => sp.placementId === selectedPlacementId
                          ) && !plantPickerExpanded
                        ? "Elige maceta y plato para esta planta"
                        : "Elige una planta para esta ubicación"}
                  </p>
                </div>
                <div className="min-w-0 p-5">
                  {!selectedPlacementId ? (
                    <div className="flex min-h-[12rem] flex-col items-center justify-center text-center lg:h-full">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-sage">
                        <Leaf className="h-5 w-5 text-brand-forest" />
                      </div>
                      <p className="mt-3 text-sm font-medium text-brand-forest">
                        Toca un número en la foto
                      </p>
                      <p className="mt-1 max-w-[16rem] text-xs text-brand-carbon/60">
                        Cada punto es una ubicación sugerida, o usa “Agregar
                        punto” para elegir tú dónde va una planta.
                      </p>
                    </div>
                  ) : (
                    <>
                      {(() => {
                        const sel = analysis.placements.find(
                          (p) => p.id === selectedPlacementId
                        );
                        if (!sel) return null;

                        const currentSelection = selectedPlants.find(
                          (p) => p.placementId === selectedPlacementId
                        );

                        if (currentSelection && !plantPickerExpanded) {
                          const unitPrice =
                            currentSelection.plant.basePriceQ +
                            getPlanterPrice(
                              planters,
                              currentSelection.planterId
                            ) +
                            getPlatoPrice(platos, currentSelection.platoId);
                          return (
                            <div className="space-y-4">
                              <div className="flex items-center gap-3 rounded-xl border-2 border-brand-forest bg-brand-forest/5 p-3">
                                <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-white">
                                  <Image
                                    src={
                                      currentSelection.plant.images?.[0] ||
                                      "/images/plant-placeholder.svg"
                                    }
                                    alt={currentSelection.plant.name}
                                    fill
                                    sizes="56px"
                                    className="object-cover"
                                  />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-[10px] font-semibold uppercase text-brand-carbon/50">
                                    Planta elegida
                                  </p>
                                  <p className="truncate text-sm font-semibold text-brand-forest">
                                    {currentSelection.plant.name}
                                  </p>
                                  <p className="text-xs text-brand-carbon/60">
                                    {formatQ(unitPrice)}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setPlantPickerExpanded(true)}
                                  className="flex items-center gap-1 rounded-full border border-brand-forest/30 bg-white px-3 py-1.5 text-xs font-semibold text-brand-forest transition-colors hover:bg-brand-sage/50"
                                >
                                  <Pencil className="h-3 w-3" />
                                  Cambiar
                                </button>
                              </div>

                              <PlacementAccessorySelector
                                plant={currentSelection.plant}
                                planters={planters}
                                platos={platos}
                                planterId={currentSelection.planterId}
                                platoId={currentSelection.platoId}
                                onChangePlanter={(id) =>
                                  handleChangePlanter(sel.id, id)
                                }
                                onChangePlato={(id) =>
                                  handleChangePlato(sel.id, id)
                                }
                              />
                            </div>
                          );
                        }

                        return (
                          <>
                            {sel.source === "manual" ? (
                              <ManualPlacementEditor
                                placement={sel}
                                onUpdate={(patch) =>
                                  handleUpdatePlacement(sel.id, patch)
                                }
                                onRemove={() => handleRemovePlacement(sel.id)}
                              />
                            ) : (
                              <PlacementSizeSelector
                                placement={sel}
                                onUpdate={(patch) =>
                                  handleUpdatePlacement(sel.id, patch)
                                }
                              />
                            )}

                            {recommendationsLoading &&
                            !placementRecommendations[
                              getRecommendationCacheKey(
                                selectedPlacementId,
                                showFullCatalog
                              )
                            ] ? (
                              <div className="py-8 text-center">
                                <p className="text-sm text-brand-carbon/60">
                                  Cargando recomendaciones...
                                </p>
                              </div>
                            ) : (
                              <RecommendationPanel
                                placement={sel}
                                recommendations={
                                  placementRecommendations[
                                    getRecommendationCacheKey(
                                      selectedPlacementId,
                                      showFullCatalog
                                    )
                                  ] || []
                                }
                                selectedPlantId={currentSelection?.plantId}
                                onSelectPlant={handleSelectPlant}
                                showFullCatalog={showFullCatalog}
                                onToggleCatalog={handleToggleCatalog}
                                catalogLoading={catalogLoading}
                              />
                            )}
                          </>
                        );
                      })()}
                    </>
                  )}
                </div>
              </div>

              {generatedImageUrl && (
                <div
                  ref={visualizationRef}
                  className="scroll-mt-4 overflow-hidden rounded-xl border border-brand-beige bg-white"
                >
                  <div className="border-b border-brand-beige/60 px-5 py-3">
                    <h3 className="font-semibold text-brand-forest">
                      Así se vería tu espacio
                    </h3>
                    <p className="text-xs text-brand-carbon/60">
                      Visualización generada con tus plantas y accesorios
                    </p>
                  </div>
                  <div className="relative aspect-[4/3] w-full bg-brand-cream">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={generatedImageUrl}
                      alt="Visualización de tu espacio"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              )}

              <div>
                <ProposalSummary
                  selectedPlants={selectedPlants}
                  placements={analysis.placements}
                  planters={planters}
                  platos={platos}
                  onChangePlant={handleChangePlant}
                  onRemove={(placementId) => {
                    setSelectedPlants(
                      selectedPlants.filter((p) => p.placementId !== placementId)
                    );
                    setAddedToCart(false);
                    setGeneratedImageUrl(null);
                    setSavedProposalId(null);
                  }}
                  onGenerate={handleGenerateVisualization}
                  isGenerating={isGeneratingViz}
                  hasVisualization={!!generatedImageUrl}
                  onAddToCart={handleAddToCart}
                  addedToCart={addedToCart}
                  onSaveProposal={handleSaveProposal}
                  savedProposalId={savedProposalId}
                  isSaving={isSavingProposal}
                />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 shrink-0 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
