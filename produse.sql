SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'produse';

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'prajituri';

drop type categorie_uzura;
drop type categorie_brand;

CREATE TYPE categorie_uzura AS ENUM( 'Bun', 'Foarte bun', 'Excelent', 'Ca nou');
CREATE TYPE categorie_brand AS ENUM('Apple', 'Samsung', 'Google', 'Xiaomi', 'Huawei');

drop table produse;

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
    (1200.00, 'iPhone Xs max', 'Apple', 'Simplu. Elegant. Perfect.', 128, 4, '{"Big battery"}', 'iphone_xs_max.jpg', FALSE, '2024-05-14 08:15:30', 'Ca nou'),
    (1000.00, 'iPhone 11', 'Apple', 'Un telefon Apple perfect pentru navigarea pe internet', 64, 3, '{}', 'iphone_11.jpg', TRUE, '2024-05-13 10:20:45', 'Bun'),
    (800.00, 'iPhone X', 'Apple', 'Design elegant care atrage toate privirile', 64, 3, '{}', 'iphone_x.jpg', FALSE, '2024-05-12 13:25:10', 'Bun'),
    (2000.00, 'Galaxy Z Fold 4', 'Samsung', 'Surprinde-i pe cei din jur cu ecranul flexibil', 256, 12, '{"Foldable screen", "Triple camera"}', 'samsung_z_fold_4.jpg', TRUE, '2024-05-11 15:30:20', 'Foarte bun'),
    (900.00, 'Pixel 8', 'Google', 'Un telefon rapid Google', 128, 8, '{}', 'google_pixel_8.jpg', FALSE, '2024-05-10 16:35:55', 'Excelent'),
    (1200.00, 'Mi 11 Ultra', 'Xiaomi', 'Performanță la alt nivel', 256, 12, '{"30X Zoom camera"}', 'xiaomi_mi_11_ultra.jpg', TRUE, '2024-05-09 09:40:30', 'Ca nou'),
    (1000.00, 'Note 10 Plus', 'Samsung', 'Un telefon cu o baterie care rezistă întreaga zi', 256, 12, '{Big battery}', 'samsung_note_10_plus.jpg', FALSE, '2024-05-08 12:50:15', 'Foarte bun'),
    (700.00, 'P30', 'Huawei', 'Camera 30X pentru a capta orice detaliu, oricât de departe', 128, 6, '{}', 'huawei_p30.jpg', TRUE, '2024-05-07 14:55:40', 'Bun'),
    (600.00, 'Mi Note 10 Lite', 'Xiaomi', 'Mic. Elegant. Colorat.', 128, 6, '{}', 'xiaomi_mi_note_10_lite.jpg', FALSE, '2024-05-06 17:10:25', 'Excelent'),
    (1500.00, 'iPhone 15 Pro Max', 'Apple', 'Cel mai performant flagship Apple', 256, 12, '{"A17 CPU"}', 'iphone_15_pro_max.jpg', TRUE, '2024-05-05 18:20:55', 'Ca nou'),
    (1400.00, 'iPhone 14 Pro', 'Apple', 'Display-ul cu cele mai vii culori', 128, 8, '{}', 'iphone_14_pro.jpg', FALSE, '2024-05-04 19:30:10', 'Bun'),
    (1100.00, 'Pixel 8 Pro', 'Google', 'Cel mai performant flagship Google', 256, 12, '{"Google AI Assistant"}', 'google_pixel_8_pro.jpg', TRUE, '2024-05-03 21:40:45', 'Foarte bun'),
    (1600.00, 'Mi 12 Pro', 'Xiaomi', 'Telefonul compact și subțire pe care îl cauți', 512, 16, '{}', 'xiaomi_mi_12_pro.jpg', FALSE, '2024-05-02 09:50:20', 'Excelent'),
    (1000.00, 'Galaxy S23', 'Samsung', 'S23: calitate la alt nivel', 256, 12, '{}', 'samsung_s23.jpg', TRUE, '2024-05-01 11:55:35', 'Ca nou'),
    (1300.00, 'Galaxy S21 Ultra', 'Samsung', 'Ecran mare, cameră mare, stocare mare. Exact ceea ce cauți.', 512, 16, '{}', 'samsung_s21_ultra.jpg', FALSE, '2024-04-30 14:10:50', 'Bun');

select * from produse;