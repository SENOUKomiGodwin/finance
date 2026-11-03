INSERT INTO employes (nom, prenom, poste, salaire, date_embauche) VALUES
('ADJOVI', 'Koffi', 'Directeur Général', 850000.00, '2021-01-15 08:00:00'),
('AMOUZOU', 'Kodjo', 'Directeur Administratif', 700000.00, '2021-02-10 08:00:00'),
('ASSOGBA', 'Yao', 'Responsable Financier', 650000.00, '2021-03-05 08:00:00'),
('AKAKPO', 'Komlan', 'Comptable', 480000.00, '2021-04-12 08:00:00'),
('AYITE', 'Mensah', 'Comptable', 450000.00, '2021-05-20 08:00:00'),
('KOFFI', 'Sena', 'Assistant Comptable', 350000.00, '2021-06-18 08:00:00'),
('GBESSIA', 'Dodzi', 'Responsable Ressources Humaines', 580000.00, '2021-07-22 08:00:00'),
('LAWSON', 'Esso', 'Assistant RH', 360000.00, '2021-08-09 08:00:00'),
('KOUASSI', 'Folly', 'Responsable Commercial', 550000.00, '2021-09-14 08:00:00'),
('AGBODJAN', 'Prince', 'Commercial', 400000.00, '2021-10-11 08:00:00'),

('DOSSOU', 'Richard', 'Commercial', 420000.00, '2021-11-08 08:00:00'),
('TCHALLA', 'Emmanuel', 'Chef des Ventes', 500000.00, '2021-12-06 08:00:00'),
('KPODAR', 'Blaise', 'Responsable Marketing', 530000.00, '2022-01-17 08:00:00'),
('SODJI', 'Kevin', 'Chargé Marketing', 390000.00, '2022-02-14 08:00:00'),
('TOGBE', 'Mawuli', 'Community Manager', 380000.00, '2022-03-21 08:00:00'),
('AMENYI', 'Joël', 'Responsable Informatique', 620000.00, '2022-04-18 08:00:00'),
('GNAKPO', 'Fabrice', 'Développeur Web', 550000.00, '2022-05-16 08:00:00'),
('BODJONA', 'Daniel', 'Développeur Backend', 600000.00, '2022-06-13 08:00:00'),
('KASSA', 'Mickaël', 'Développeur Frontend', 570000.00, '2022-07-11 08:00:00'),
('EDOH', 'Arnaud', 'Administrateur Système', 520000.00, '2022-08-08 08:00:00'),

('AGBEME', 'Samuel', 'Technicien Informatique', 400000.00, '2022-09-12 08:00:00'),
('DOVI', 'Christian', 'Data Analyst', 580000.00, '2022-10-10 08:00:00'),
('ATCHOLI', 'Isidore', 'Data Engineer', 650000.00, '2022-11-14 08:00:00'),
('KUEVI', 'Marcel', 'Analyste Financier', 560000.00, '2022-12-12 08:00:00'),
('ASSIH', 'Franck', 'Contrôleur de Gestion', 590000.00, '2023-01-16 08:00:00'),
('AYEVA', 'Patrick', 'Responsable Production', 610000.00, '2023-02-13 08:00:00'),
('DJIFA', 'Nicolas', 'Chef de Production', 520000.00, '2023-03-20 08:00:00'),
('KOMLA', 'Serge', 'Technicien de Production', 380000.00, '2023-04-17 08:00:00'),
('AKPAGANA', 'François', 'Technicien de Production', 390000.00, '2023-05-15 08:00:00'),
('AMEGBO', 'Robert', 'Opérateur de Production', 330000.00, '2023-06-12 08:00:00'),

('TETTEH', 'Augustin', 'Opérateur de Production', 340000.00, '2023-07-10 08:00:00'),
('ADJETE', 'Luc', 'Responsable Logistique', 540000.00, '2023-08-14 08:00:00'),
('KODJO', 'Thomas', 'Gestionnaire de Stock', 410000.00, '2023-09-11 08:00:00'),
('SOGLO', 'Michel', 'Magasinier', 320000.00, '2023-10-16 08:00:00'),
('AZIADOME', 'Franck', 'Magasinier', 315000.00, '2023-11-13 08:00:00'),
('KPATCHA', 'Alexandre', 'Responsable Achats', 530000.00, '2023-12-11 08:00:00'),
('ESSOH', 'Mathieu', 'Acheteur', 420000.00, '2024-01-15 08:00:00'),
('LAWANI', 'Bernard', 'Assistant Achats', 350000.00, '2024-02-12 08:00:00'),
('TOSSOU', 'Valentin', 'Responsable Qualité', 570000.00, '2024-03-18 08:00:00'),
('DANKLOU', 'Éric', 'Contrôleur Qualité', 430000.00, '2024-04-15 08:00:00'),

('KPESSI', 'Gérard', 'Contrôleur Qualité', 440000.00, '2024-05-13 08:00:00'),
('AGBODJI', 'Jean', 'Responsable Maintenance', 560000.00, '2024-06-10 08:00:00'),
('KPADONOU', 'Yves', 'Technicien Maintenance', 410000.00, '2024-07-15 08:00:00'),
('DAGBA', 'Serge', 'Technicien Maintenance', 400000.00, '2024-08-12 08:00:00'),
('SENAME', 'David', 'Agent de Sécurité', 300000.00, '2024-09-16 08:00:00'),
('GBADAMASSI', 'Joseph', 'Agent de Sécurité', 300000.00, '2024-10-14 08:00:00'),
('KOFFIME', 'Alexis', 'Chauffeur', 320000.00, '2024-11-11 08:00:00'),
('AMOUSSOU', 'Brice', 'Chauffeur-Livreur', 350000.00, '2025-01-13 08:00:00'),
('TCHAKALA', 'Richard', 'Assistant Administratif', 340000.00, '2025-02-10 08:00:00'),
('KPONOU', 'Martin', 'Secrétaire Administratif', 360000.00, '2025-03-17 08:00:00');



ALTER TABLE employes
ADD COLUMN age INT AFTER salaire;


UPDATE employes SET age = 42 WHERE id_employe = 1;
UPDATE employes SET age = 38 WHERE id_employe = 2;
UPDATE employes SET age = 45 WHERE id_employe = 3;
UPDATE employes SET age = 39 WHERE id_employe = 4;
UPDATE employes SET age = 36 WHERE id_employe = 5;
UPDATE employes SET age = 31 WHERE id_employe = 6;
UPDATE employes SET age = 44 WHERE id_employe = 7;
UPDATE employes SET age = 30 WHERE id_employe = 8;
UPDATE employes SET age = 37 WHERE id_employe = 9;
UPDATE employes SET age = 29 WHERE id_employe = 10;
UPDATE employes SET age = 34 WHERE id_employe = 11;
UPDATE employes SET age = 41 WHERE id_employe = 12;
UPDATE employes SET age = 39 WHERE id_employe = 13;
UPDATE employes SET age = 28 WHERE id_employe = 14;
UPDATE employes SET age = 27 WHERE id_employe = 15;
UPDATE employes SET age = 43 WHERE id_employe = 16;
UPDATE employes SET age = 32 WHERE id_employe = 17;
UPDATE employes SET age = 35 WHERE id_employe = 18;
UPDATE employes SET age = 30 WHERE id_employe = 19;
UPDATE employes SET age = 40 WHERE id_employe = 20;
UPDATE employes SET age = 29 WHERE id_employe = 21;
UPDATE employes SET age = 33 WHERE id_employe = 22;
UPDATE employes SET age = 36 WHERE id_employe = 23;
UPDATE employes SET age = 38 WHERE id_employe = 24;
UPDATE employes SET age = 42 WHERE id_employe = 25;
UPDATE employes SET age = 45 WHERE id_employe = 26;
UPDATE employes SET age = 37 WHERE id_employe = 27;
UPDATE employes SET age = 31 WHERE id_employe = 28;
UPDATE employes SET age = 34 WHERE id_employe = 29;
UPDATE employes SET age = 26 WHERE id_employe = 30;
UPDATE employes SET age = 28 WHERE id_employe = 31;
UPDATE employes SET age = 41 WHERE id_employe = 32;
UPDATE employes SET age = 35 WHERE id_employe = 33;
UPDATE employes SET age = 30 WHERE id_employe = 34;
UPDATE employes SET age = 27 WHERE id_employe = 35;
UPDATE employes SET age = 39 WHERE id_employe = 36;
UPDATE employes SET age = 33 WHERE id_employe = 37;
UPDATE employes SET age = 29 WHERE id_employe = 38;
UPDATE employes SET age = 43 WHERE id_employe = 39;
UPDATE employes SET age = 36 WHERE id_employe = 40;
UPDATE employes SET age = 32 WHERE id_employe = 41;
UPDATE employes SET age = 44 WHERE id_employe = 42;
UPDATE employes SET age = 30 WHERE id_employe = 43;
UPDATE employes SET age = 34 WHERE id_employe = 44;
UPDATE employes SET age = 27 WHERE id_employe = 45;
UPDATE employes SET age = 31 WHERE id_employe = 46;
UPDATE employes SET age = 38 WHERE id_employe = 47;
UPDATE employes SET age = 29 WHERE id_employe = 48;
UPDATE employes SET age = 35 WHERE id_employe = 49;
UPDATE employes SET age = 33 WHERE id_employe = 50;