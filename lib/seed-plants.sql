-- 25 core plant catalog for Verdea
-- Prices in Quetzales (GTM currency)

INSERT INTO plants (
  id, slug, commercial_name, scientific_name, description, short_description,
  price_q, cost_q, current_size_cm, pot_diameter_cm, mature_height_cm,
  light_level, care_difficulty, watering_frequency_days, humidity_preference,
  min_temperature_c, max_temperature_c, indoor_outdoor,
  pet_friendly, smart_care_compatible,
  categories, decorative_styles, room_types,
  stock_quantity, available, featured
) VALUES
-- 1. Pothos Golden
('pothos-golden', 'pothos-golden', 'Pothos Golden', 'Epipremnum aureum',
'Trepadora resistente con hojas doradas. Excelente para principiantes.',
'Dorado y verde, muy resistente',
89, 35, 20, 12, 100,
'media', 'facil', 7, 'media',
15, 28, 'interior',
false, true,
'interior,bajo-mantenimiento,escritorio,popular', 'minimalist,boho,modern', 'office,bedroom,living-room',
8, true, true),

-- 2. Pothos Marble Queen
('pothos-marble', 'pothos-marble', 'Pothos Marble Queen', 'Epipremnum pinnatum',
'Variante con hojas moteadas de blanco. Impactante sin complejidad.',
'Blanco y verde moteado',
99, 40, 20, 12, 100,
'media', 'facil', 7, 'media',
15, 28, 'interior',
false, true,
'interior,bajo-mantenimiento,escritorio,moderno', 'minimalist,boho,modern', 'office,bedroom,living-room',
6, true, false),

-- 3. Sansevieria Laurentii
('sansevieria-laurentii', 'sansevieria-laurentii', 'Sansevieria Laurentii', 'Dracaena trifasciata',
'Hojas erguidas con bordes dorados. Sobrevive casi cualquier negligencia.',
'Escultural, bordes dorados, aire puro',
99, 38, 30, 15, 90,
'baja', 'facil', 14, 'baja',
10, 30, 'interior',
false, true,
'interior,bajo-mantenimiento,oficina,poca-luz,escultural', 'minimalist,industrial,modern', 'office,bedroom,living-room',
5, true, true),

-- 4. Sansevieria Moonshine
('sansevieria-moonshine', 'sansevieria-moonshine', 'Sansevieria Moonshine', 'Dracaena trifasciata',
'Tonos plateados, más claros que Laurentii. Dramática.',
'Plateada, escultural',
119, 45, 30, 15, 90,
'baja', 'facil', 14, 'baja',
10, 30, 'interior',
false, true,
'interior,bajo-mantenimiento,oficina,poca-luz', 'minimalist,industrial,boho', 'office,bedroom',
4, true, false),

-- 5. Zamioculca
('zamioculca', 'zamioculca', 'Zamioculca', 'Zamioculcas zamiifolia',
'Follaje brillante y grueso. Prospera en luz baja.',
'Brillante, grueso, bajo mantenimiento',
149, 60, 35, 18, 80,
'baja', 'facil', 14, 'media',
12, 30, 'interior',
false, true,
'interior,bajo-mantenimiento,oficina,poca-luz,grandes', 'minimalist,modern,boho', 'office,bedroom,living-room',
7, true, true),

-- 6. Monstera Deliciosa
('monstera-deliciosa', 'monstera-deliciosa', 'Monstera Deliciosa', 'Monstera deliciosa',
'Hojas perforadas icónicas. Trepadora elegante con presencia.',
'Hojas perforadas, tropical',
199, 80, 40, 20, 200,
'media', 'moderado', 7, 'alta',
18, 28, 'interior',
false, true,
'interior,grandes,tropical,tendencia', 'boho,tropical,modern', 'living-room,bedroom',
6, true, true),

-- 7. Monstera Adansonii
('monstera-adansonii', 'monstera-adansonii', 'Monstera Adansonii', 'Rhaphidophora tetrasperma',
'Versión compacta de Monstera. Perforaciones intrincadas.',
'Perforaciones pequeñas, compacta',
139, 55, 25, 12, 60,
'media', 'facil', 7, 'alta',
16, 28, 'interior',
false, true,
'interior,tropical,tendencia,escritorio', 'boho,tropical,modern', 'bedroom,office,living-room',
5, true, false),

-- 8. Peperomia Obtusifolia
('peperomia', 'peperomia', 'Peperomia Obtusifolia', 'Peperomia obtusifolia',
'Hojas redondas y carnudas. Compacta y decorativa.',
'Carnuda, redonda, compacta',
69, 28, 15, 10, 25,
'media', 'facil', 7, 'media',
15, 28, 'interior',
false, false,
'interior,bajo-mantenimiento,escritorio,pequeña', 'minimalist,boho,modern', 'office,bedroom',
8, true, false),

-- 9. Aglaonema
('aglaonema', 'aglaonema', 'Aglaonema (Evergreen Chino)', 'Aglaonema modestum',
'Hojas variegadas con tonos plateados. Muy colorida.',
'Variegada, plateada, colorida',
79, 32, 20, 12, 50,
'baja', 'facil', 7, 'media',
15, 28, 'interior',
false, false,
'interior,bajo-mantenimiento,poca-luz,colorida', 'boho,tropical,modern', 'office,bedroom,bathroom',
7, true, false),

-- 10. Philodendron Brasil
('philodendron-brasil', 'philodendron-brasil', 'Philodendron Brasil', 'Philodendron hederaceum',
'Hojas con variegación amarilla. Trepadora fácil.',
'Amarillo y verde, trepadora',
89, 36, 20, 12, 100,
'media', 'facil', 7, 'media',
15, 28, 'interior',
false, true,
'interior,bajo-mantenimiento,escritorio,tendencia', 'boho,modern,tropical', 'office,bedroom,living-room',
9, true, false),

-- 11. Philodendron Birkin
('philodendron-birkin', 'philodendron-birkin', 'Philodendron Birkin', 'Philodendron bipinnatifidum',
'Hojas profundamente divididas con venas blancas. Estructura dramática.',
'Venas blancas, dramática',
179, 72, 35, 20, 100,
'media', 'moderado', 7, 'alta',
18, 28, 'interior',
false, true,
'interior,grandes,moderna,tendencia', 'minimalist,modern,boho', 'living-room,bedroom',
4, true, true),

-- 12. Philodendron Heartleaf
('philodendron-heartleaf', 'philodendron-heartleaf', 'Philodendron Heartleaf', 'Philodendron scandens',
'Hojas en forma de corazón. Clásica y colgante.',
'Hojas de corazón, colgante',
69, 28, 15, 10, 80,
'baja', 'facil', 7, 'media',
12, 28, 'interior',
false, true,
'interior,bajo-mantenimiento,poca-luz,colgante', 'boho,tropical,modern', 'office,bedroom,bathroom',
10, true, false),

-- 13. Syngonium
('syngonium', 'syngonium', 'Syngonium Podophyllum', 'Syngonium podophyllum',
'Hojas en forma de flecha. Colorida, compacta.',
'Hojas de flecha, colorida',
79, 32, 18, 12, 50,
'media', 'facil', 7, 'media',
15, 28, 'interior',
false, true,
'interior,bajo-mantenimiento,escritorio,colorida', 'boho,tropical,modern', 'office,bedroom,bathroom',
8, true, false),

-- 14. Ficus Elastica (Rubber Plant)
('ficus-elastica', 'ficus-elastica', 'Ficus Elastica', 'Ficus elastica',
'Hojas grandes y lustrosas. Presencia arquitectónica.',
'Grande, lustrosa, arquitectónica',
159, 64, 35, 20, 150,
'media', 'moderado', 7, 'media',
18, 28, 'interior',
false, true,
'interior,grandes,moderna', 'minimalist,industrial,modern', 'living-room,office',
5, true, false),

-- 15. Dracaena Marginata
('dracaena-marginata', 'dracaena-marginata', 'Dracaena Marginata', 'Dracaena marginata',
'Hojas alargadas con bordes rojos. Estructura elegante.',
'Bordes rojos, elegante',
119, 48, 30, 15, 120,
'media', 'facil', 10, 'media',
12, 28, 'interior',
false, true,
'interior,bajo-mantenimiento,moderna', 'minimalist,modern,boho', 'living-room,bedroom,office',
6, true, false),

-- 16. Schefflera Arboricola
('schefflera', 'schefflera', 'Schefflera Arboricola', 'Schefflera arboricola',
'Hojas compuestas como paraguas. Robusta y tupida.',
'Como paraguas, tupida, robusta',
129, 52, 40, 20, 150,
'media', 'facil', 7, 'media',
18, 28, 'interior',
false, true,
'interior,grandes,moderna', 'boho,tropical,modern', 'living-room,office',
5, true, false),

-- 17. Palma de Salón (Chamaedorea)
('chamaedorea', 'chamaedorea', 'Palma de Salón', 'Chamaedorea elegans',
'Elegante, tropical, de bajo mantenimiento.',
'Tropical, elegante, aire puro',
139, 56, 40, 18, 120,
'media', 'facil', 7, 'alta',
16, 28, 'interior',
false, false,
'interior,tropical,grandes,aire-puro', 'boho,tropical,classic', 'living-room,office',
4, true, false),

-- 18. Cinta (Spider Plant)
('cinta', 'cinta', 'Cinta', 'Chlorophytum comosum',
'Hojas arqueadas, produce vástagos. Muy resistente.',
'Arqueada, vástagos, muy resistente',
59, 24, 20, 12, 40,
'media', 'facil', 7, 'media',
12, 28, 'interior',
true, false,
'interior,bajo-mantenimiento,aire-puro,colgante,pet-friendly', 'boho,classic,tropical', 'office,bedroom,bathroom',
10, true, true),

-- 19. Maranta (Prayer Plant)
('maranta', 'maranta', 'Maranta Leuconeura', 'Maranta leuconeura',
'Hojas con patrones intrincados que se pliegan. Artística.',
'Patrones intrincados, se pliega',
89, 36, 15, 12, 25,
'media', 'moderado', 7, 'alta',
18, 26, 'interior',
true, false,
'interior,poca-luz,pequeña,artistica,pet-friendly', 'boho,tropical,minimalist', 'bedroom,bathroom,office',
5, true, false),

-- 20. Helecho Boston
('helecho-boston', 'helecho-boston', 'Helecho Boston', 'Nephrolepis exaltata',
'Frondes plumosas. Requiere humedad pero es espectacular.',
'Plumoso, esponjoso, humedad',
99, 40, 25, 14, 50,
'media', 'moderado', 3, 'muy-alta',
18, 24, 'interior',
true, false,
'interior,poca-luz,colgante,humedad', 'tropical,boho,classic', 'bathroom,office,bedroom',
4, true, false),

-- 21. Calathea
('calathea', 'calathea', 'Calathea Orbifolia', 'Goeppertia orbifolia',
'Hojas con rayas blancas impactantes. Requiere cuidado.',
'Rayas blancas, artistica',
129, 52, 25, 14, 60,
'media', 'exigente', 7, 'muy-alta',
18, 26, 'interior',
true, false,
'interior,poca-luz,artistica,humedad,decorativa', 'boho,tropical,minimalist', 'bedroom,bathroom,office',
3, true, false),

-- 22. Aloe Vera
('aloe-vera', 'aloe-vera', 'Aloe Vera', 'Aloe barbadensis',
'Suculenta medicinal. Práctica y hermosa.',
'Suculenta, medicinal, útil',
59, 24, 20, 12, 40,
'alta', 'facil', 14, 'baja',
10, 35, 'ambos',
true, false,
'interior,exterior,succulenta,bajo-mantenimiento,pet-friendly', 'minimalist,modern,boho', 'office,bedroom,balcony',
8, true, false),

-- 23. Echeveria
('echeveria', 'echeveria', 'Echeveria', 'Echeveria elegans',
'Suculenta en roseta con tonos púrpura. Hermosa.',
'Roseta, púrpura, suculenta',
49, 20, 10, 8, 15,
'alta', 'facil', 14, 'baja',
10, 35, 'ambos',
true, false,
'interior,exterior,succulenta,bajo-mantenimiento,pequeña', 'minimalist,modern,boho', 'office,bedroom,shelf',
12, true, false),

-- 24. Cactus Pequeño (Mammillaria)
('cactus-mammillaria', 'cactus-mammillaria', 'Cactus Mammillaria', 'Mammillaria elongata',
'Pequeño, con flores amarillas. Para amantes de suculentas.',
'Pequeño, flores amarillas',
49, 20, 8, 8, 15,
'alta', 'facil', 14, 'baja',
10, 40, 'ambos',
true, false,
'interior,exterior,succulenta,bajo-mantenimiento,pequeña', 'minimalist,modern,rustic', 'office,shelf,bedroom',
10, true, false),

-- 25. Croton
('croton', 'croton', 'Croton (Codiaeum)', 'Codiaeum variegatum',
'Hojas multicolores dramáticas (rojo, naranja, amarillo). Impactante.',
'Multicolor, dramática, impactante',
139, 56, 30, 16, 100,
'alta', 'moderado', 7, 'alta',
20, 28, 'interior',
false, true,
'interior,colorida,decorativa,moderna,grandes', 'tropical,boho,modern', 'living-room,bedroom,office',
3, true, false);

-- Insert some plant variants (sizes)
INSERT INTO plant_variants (id, plant_id, size_label, height_cm, price_q, stock_quantity) VALUES
('pothos-golden-s', 'pothos-golden', 'Pequeño (15 cm)', 15, 89, 8),
('pothos-golden-m', 'pothos-golden', 'Mediano (25 cm)', 25, 129, 5),
('sansevieria-laurentii-s', 'sansevieria-laurentii', 'Pequeño (20 cm)', 20, 99, 5),
('sansevieria-laurentii-m', 'sansevieria-laurentii', 'Mediano (35 cm)', 35, 169, 3),
('monstera-deliciosa-s', 'monstera-deliciosa', 'Joven (30 cm)', 30, 199, 4),
('monstera-deliciosa-m', 'monstera-deliciosa', 'Adulta (50 cm)', 50, 349, 2);
