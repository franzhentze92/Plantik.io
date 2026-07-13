-- Gives every plant the same placeholder photo so the catalog, recommendation
-- cards, and proposal pages have something to render until real product
-- photography is uploaded.

INSERT INTO plant_images (plant_id, image_url, alt_text, display_order)
SELECT id, '/images/plant-placeholder.svg', commercial_name, 0
FROM plants
WHERE id NOT IN (SELECT plant_id FROM plant_images WHERE plant_id IS NOT NULL);
