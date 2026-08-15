DROP TABLE IF EXISTS suppliers;
CREATE TABLE suppliers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(30) NOT NULL
) ENGINE=InnoDB;

DROP TABLE IF EXISTS products;
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    stock INT NOT NULL DEFAULT 0,
    image VARCHAR(255) DEFAULT 'BerryTotebag.webp',
    supplier_id INT,
    CONSTRAINT fk_product_supplier
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
        ON DELETE SET NULL
) ENGINE=InnoDB;

DROP TABLE IF EXISTS admins;
CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
) ENGINE=InnoDB;

INSERT INTO suppliers (id, name, email, phone) VALUES
(1, 'BerryCo 🍒', 'berry@berryco.com', '+977-9812345678'),
(2, 'BeeHive 🐝', 'buzz@beehive.com', '+977-9845678901'),
(3, 'SillyStuff 🎪', 'hehe@sillystuff.com', '+977-9867891234');

INSERT INTO products (name, description, price, stock, image, supplier_id) VALUES
('Berry Tote Bag', 'A soft berry-toned tote bag with strong handles and a roomy interior.', 799, 3, 'BerryTotebag.webp', 1),
('Sparky Notebook', 'Grid paper notebook for thoughts and design ideas.', 499, 20, 'SparkyNotebook.webp', 2),
('Turbo Wash 5000', 'High performance washing machine unit.', 56900, 2, 'TurboWash.avif', 3),
('Bees Glass Necklace', 'Handcrafted crystal necklace.', 569, 15, 'BeesGlassNecklace.webp', 1),
('Mug', 'Ceramic coffee mug.', 499, 2, 'BeesMug.jpeg', 3),
('RosyHair Clips', 'Cute hair accessory set.', 640, 50, 'RosyHairClip.jpg', 1),
('Cute Sticker Pack', 'Vinyl aesthetic stickers.', 339, 100, 'StickerPack.webp', 2),
('Fluffy Pen', 'Fun fluffy ballpoint pen.', 99, 4, 'FluffySillyPen.jpg', 3);


INSERT INTO admins (username, password) VALUES
('admin', '$2b$12$gJfQfX1PfZRX7sZ/08e5kemRaDwAX3pYxcGfjy02UhfC4awURkn8K');