import { SpaceQuestionnaire } from "@/types/space-analysis";

export function generateRoomAnalysisPrompt(
  questionnaire: SpaceQuestionnaire
): string {
  return `You are an expert interior designer analyzing a room for plant placement recommendations.

Analyze the provided image and answer the following questionnaire about the space.

USER QUESTIONNAIRE:
- Room type: ${questionnaire.roomType || "not specified"}
- Direct sunlight: ${questionnaire.directSun !== undefined ? (questionnaire.directSun ? "Yes" : "No") : "not specified"}
- Has pets: ${questionnaire.hasPets !== undefined ? (questionnaire.hasPets ? "Yes" : "No") : "not specified"}
- Desired maintenance: ${questionnaire.desiredMaintenance || "not specified"}

RESPOND WITH VALID JSON (no markdown, no code blocks) matching this exact structure:

{
  "roomType": "bedroom|living-room|office|bathroom|balcony|dining-room|kitchen|other",
  "lightLevel": "very-low|low|medium|bright",
  "directSun": boolean,
  "estimatedSpaceSize": "small|medium|large",
  "styles": ["minimalist", "modern", "boho", "tropical", "rustic", "industrial", "classic", "japandi"],
  "dominantColors": ["color1", "color2", "color3"],
  "placements": [
    {
      "id": "placement_1",
      "x": 25,
      "y": 50,
      "placementType": "floor|table|shelf|hanging",
      "recommendedPlantSize": "desktop|small|medium|large",
      "availableWidth": "narrow|medium|wide",
      "reasoning": "Why this location works for plants"
    }
  ],
  "warnings": ["warning1", "warning2"],
  "confidence": 0.85
}

ANALYSIS RULES:
1. lightLevel: Based on apparent natural light in image. "very-low" if mostly dark, "low" if some indirect light, "medium" if good indirect light, "bright" if lots of light.
2. directSun: True ONLY if you see direct sunlight entering the room. Default to false if uncertain.
3. estimatedSpaceSize: Based on visible dimensions and furniture scale.
4. styles: Identify 1-3 dominant design styles from image.
5. dominantColors: List 3-5 most prominent colors in the space.
6. placements: Identify 2-6 suitable locations for plants. First, scan the photo for surfaces that are ACTUALLY EMPTY and VISIBLE. Real rooms only have a few valid spots — it is better to return 2 excellent placements than 6 that break the rules below.

   WHERE PLANTS MAY GO (allowed):
   - Floor plants ONLY when the spot is against a wall, tucked into a corner, or immediately beside/between existing furniture (e.g. the corner next to a window, the floor gap beside a nightstand or dresser, beside a sofa arm). A real plant always rests against something — a wall, a corner, or a piece of furniture.
   - On top of stable furniture surfaces: nightstands, dressers, desks, consoles, side tables, sideboards, shelving units, cabinets.
   - On an existing visible shelf.
   - Hanging from a visible ceiling hook, beam, or curtain rod.

   WHERE PLANTS MUST NEVER GO (forbidden — do NOT output these):
   - In the open middle of the floor, in a walkway, or in front of a bed/sofa where someone walks. Floor points floating in open central floor are the most common mistake — do not do it.
   - On top of a bed, sofa, couch, armchair, dining chair, stool, ottoman, or any seating/sleeping surface.
   - On top of a lamp, TV, screen, artwork, sink, stove, or appliance.
   - On a person, pet, or on a rug that sits in open floor.
   - Floating in mid-air, on a bare wall with no surface, or on the ceiling.

   WALL RULE: A bare wall cannot hold a plant by itself. If the best opportunity is an empty wall, use placementType "shelf" (a wall shelf will be added under the plant) or "hanging" (a hanger will be added) — NEVER "floor" or "table" against a bare wall with no furniture.

   - x, y: You were given a second copy of this photo with a RED REFERENCE GRID overlaid (lines every 10%, labeled 0-100 on the top and left edges). For each empty surface you identified, look at the grid image and read off the closest labeled grid lines to get accurate x,y percentages. For floor plants, place x,y at the BASE of where the pot sits on the floor (against the wall/corner/furniture), not at the plant's center height. Do not guess numbers without checking the grid image.
   - placementType "floor": the x,y point sits on visible, unobstructed floor that is directly against a wall, in a corner, or beside furniture (never open central floor, never under a table, never on a bed/rug in a walkway). "table": on the visible top surface of real furniture (nightstand, desk, dresser, console) — not floating above it. "shelf": on a visible shelf surface, or a wall spot where a shelf will be added. "hanging": near a visible ceiling, beam, hook, or rod.
   - recommendedPlantSize: relative to available space. Use "large" for tall floor corners/beside tall furniture, "medium" for floor beside low furniture, "small"/"desktop" for tabletop and shelf spots.
   - availableWidth: narrow (<30cm), medium (30-60cm), wide (>60cm)
   - reasoning: must explicitly name the visible empty surface AND what it rests against (e.g. "the empty floor in the corner to the right of the window, against the wall" or "the open top of the left nightstand"), not a vague description.
7. warnings: Any concerns (low light, pets, no windows, etc.)
8. confidence: 0-1 score of how certain you are about this analysis.

Double-check before responding: for EVERY placement, look again at the grid image and confirm ALL of the following in THIS photo: (a) the x,y lands on empty, visible space; (b) it is NOT on a bed/sofa/chair/lamp/appliance/person/pet; (c) it is NOT floating in mid-air or on a bare wall; (d) if it is a floor plant, it is against a wall, in a corner, or beside furniture — NOT in the open middle of the floor. Delete or fix any placement that fails any check.

Be specific. Respond with ONLY the JSON object, no explanations.`;
}

export function generateServerAnalysisPrompt(
  questionnaire: SpaceQuestionnaire
): string {
  return generateRoomAnalysisPrompt(questionnaire);
}
