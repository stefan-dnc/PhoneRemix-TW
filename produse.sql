SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'produse';

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'prajituri';

drop table produse;

drop type categorie_uzura;
drop type categorie_brand;

CREATE TYPE categorie_uzura AS ENUM( 'Bun', 'Foarte bun', 'Excelent', 'Ca nou');
CREATE TYPE categorie_brand AS ENUM('Apple', 'Samsung', 'Google', 'Xiaomi', 'Huawei');

CREATE TABLE IF NOT EXISTS produse (
   id serial PRIMARY KEY,
   pret NUMERIC(8,2) NOT NULL,
   brand categorie_brand DEFAULT 'Apple',
   model VARCHAR(50) UNIQUE NOT NULL,
   uzura categorie_uzura DEFAULT 'Ca nou',
   descriere TEXT,
   memorie_gb INT NOT NULL CHECK (memorie_gb>=0),   
   memorie_ram INT NOT NULL CHECK (memorie_ram>=0),
   specificatii VARCHAR[],
   are_accesorii BOOLEAN NOT NULL DEFAULT FALSE,
   imagine VARCHAR(300),
   data_adaugare TIMESTAMP DEFAULT current_timestamp
);

INSERT INTO produse (pret, model, brand, descriere, memorie_gb, memorie_ram, specificatii, imagine, are_accesorii, data_adaugare, uzura)
VALUES 
    (1200.00, 'iPhone Xs max', 'Apple', 'Flagship smartphone from Apple', 128, 4, '{}', 'iphone_xs_max.jpg', FALSE, '2024-05-14 08:15:30', 'Ca nou'),
    (1000.00, 'iPhone 11', 'Apple', 'Mid-range smartphone from Apple', 64, 3, '{}', 'iphone_11.jpg', TRUE, '2024-05-13 10:20:45', 'Bun'),
    (800.00, 'iPhone X', 'Apple', 'Previous generation flagship from Apple', 64, 3, '{}', 'iphone_x.jpg', FALSE, '2024-05-12 13:25:10', 'Bun'),
    (2000.00, 'Galaxy Z Fold 4', 'Samsung', 'Foldable flagship from Samsung', 256, 12, '{"Foldable screen"}', 'samsung_z_fold_4.jpg', TRUE, '2024-05-11 15:30:20', 'Foarte bun'),
    (900.00, 'Pixel 8', 'Google', 'Latest flagship from Google', 128, 8, '{}', 'google_pixel_8.jpg', FALSE, '2024-05-10 16:35:55', 'Excelent'),
    (1200.00, 'Mi 11 Ultra', 'Xiaomi', 'Flagship smartphone from Xiaomi', 256, 12, '{}', 'xiaomi_mi_11_ultra.jpg', TRUE, '2024-05-09 09:40:30', 'Ca nou'),
    (1000.00, 'Note 10 Plus', 'Samsung', 'High-end smartphone from Samsung', 256, 12, '{}', 'samsung_note_10_plus.jpg', FALSE, '2024-05-08 12:50:15', 'Foarte bun'),
    (700.00, 'P30', 'Huawei', 'Previous generation flagship from Huawei', 128, 6, '{}', 'huawei_p30.jpg', TRUE, '2024-05-07 14:55:40', 'Bun'),
    (600.00, 'Mi Note 10 Lite', 'Xiaomi', 'Mid-range smartphone from Xiaomi', 128, 6, '{}', 'xiaomi_mi_note_10_lite.jpg', FALSE, '2024-05-06 17:10:25', 'Excelent'),
    (1500.00, 'iPhone 15 Pro Max', 'Apple', 'Future flagship from Apple', 256, 12, '{}', 'iphone_15_pro_max.jpg', TRUE, '2024-05-05 18:20:55', 'Ca nou'),
    (1400.00, 'iPhone 14 Pro', 'Apple', 'Upcoming flagship from Apple', 128, 8, '{}', 'iphone_14_pro.jpg', FALSE, '2024-05-04 19:30:10', 'Bun'),
    (1100.00, 'Pixel 8 Pro', 'Google', 'High-end smartphone from Google', 256, 12, '{}', 'google_pixel_8_pro.jpg', TRUE, '2024-05-03 21:40:45', 'Foarte bun'),
    (1600.00, 'Mi 12 Pro', 'Xiaomi', 'Upcoming flagship from Xiaomi', 512, 16, '{}', 'xiaomi_mi_12_pro.jpg', FALSE, '2024-05-02 09:50:20', 'Excelent'),
    (1000.00, 'Galaxy S23', 'Samsung', 'Next generation smartphone from Samsung', 256, 12, '{}', 'samsung_s23.jpg', TRUE, '2024-05-01 11:55:35', 'Ca nou'),
    (1300.00, 'Galaxy S21 Ultra', 'Samsung', 'Ultra flagship from Samsung', 512, 16, '{}', 'samsung_s21_ultra.jpg', FALSE, '2024-04-30 14:10:50', 'Bun');

select * from produse;