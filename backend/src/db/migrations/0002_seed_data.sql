-- Migration 0002: Seed demo data for pilot
-- Covers: users, sellers, products, reviews, orders, coupons, wishlists, loyalty
-- Apply with: wrangler d1 migrations apply food-studio-db-prod

-- ============================================================
-- USERS (customers + admins)
-- All password hashes are bcrypt of "password123" for dev only
-- ============================================================
INSERT OR IGNORE INTO users (id, email, phone, full_name, password_hash, role, status) VALUES
  -- Admin
  ('user_admin', 'admin@foodstudio.vn', '0901111111', 'Admin Food Studio',
   '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkf5n7KsB.qTJZiA7CJjJ5j5j5j5y', 'super_admin', 'active'),
  -- Sellers (will link to seller_profiles below)
  ('user_seller01', 'tam@bancotam.vn', '0902111111', 'Nguyễn Thị Tâm',
   '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkf5n7KsB.qTJZiA7CJjJ5j5j5j5y', 'seller', 'active'),
  ('user_seller02', 'hien@lambong.com', '0903111111', 'Trần Văn Hiền',
   '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkf5n7KsB.qTJZiA7CJjJ5j5j5j5y', 'seller', 'active'),
  ('user_seller03', 'thao@huongque.com', '0904111111', 'Lê Thị Thảo',
   '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkf5n7KsB.qTJZiA7CJjJ5j5j5j5y', 'seller', 'active'),
  ('user_seller04', 'phuoc@caphesach.com', '0905111111', 'Hoàng Phước',
   '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkf5n7KsB.qTJZiA7CJjJ5j5j5j5y', 'seller', 'active'),
  ('user_seller05', 'mai@bienxanh.com', '0906111111', 'Phạm Thị Mai',
   '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkf5n7KsB.qTJZiA7CJjJ5j5j5j5y', 'seller', 'active'),
  -- Customers
  ('user_cust01', 'lan.nguyen@gmail.com', '0907111111', 'Nguyễn Thị Lan',
   '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkf5n7KsB.qTJZiA7CJjJ5j5j5j5y', 'customer', 'active'),
  ('user_cust02', 'minh.tran@yahoo.com', '0908111111', 'Trần Minh',
   '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkf5n7KsB.qTJZiA7CJjJ5j5j5j5y', 'customer', 'active'),
  ('user_cust03', 'hoa.pham@outlook.com', '0909111111', 'Phạm Thu Hoa',
   '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkf5n7KsB.qTJZiA7CJjJ5j5j5j5y', 'customer', 'active'),
  ('user_cust04', 'anh.vuong@gmail.com', '0910111111', 'Vương Thị Anh',
   '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkf5n7KsB.qTJZiA7CJjJ5j5j5j5y', 'customer', 'active'),
  ('user_cust05', 'duc.le@gmail.com', '0911111111', 'Lê Trung Đức',
   '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkf5n7KsB.qTJZiA7CJjJ5j5j5j5y', 'customer', 'active');

-- ============================================================
-- ADDRESSES
-- ============================================================
INSERT OR IGNORE INTO addresses (id, user_id, label, full_name, phone, line1, ward, district, province, is_default) VALUES
  ('addr_c01', 'user_cust01', 'Nhà riêng', 'Nguyễn Thị Lan', '0907111111', '123 Nguyễn Huệ', 'Phường Bến Nghé', 'Quận 1', 'TP Hồ Chí Minh', 1),
  ('addr_c02', 'user_cust02', 'Công ty', 'Trần Minh', '0908111111', '456 Lê Lợi', 'Phường Hải Châu 1', 'Quận Hải Châu', 'Đà Nẵng', 1),
  ('addr_c03', 'user_cust03', 'Nhà riêng', 'Phạm Thu Hoa', '0909111111', '789 Kim Mã', 'Phường Kim Mã', 'Quận Ba Đình', 'Hà Nội', 1),
  ('addr_c04', 'user_cust04', 'Nhà riêng', 'Vương Thị Anh', '0910111111', '321 Hoàng Diệu', 'Phường Hòa Thuận', 'Quận Hải Châu', 'Đà Nẵng', 1),
  ('addr_c05', 'user_cust05', 'Công ty', 'Lê Trung Đức', '0911111111', '159 Nguyễn Văn Linh', 'Phường Tân Thuận Tây', 'Quận 7', 'TP Hồ Chí Minh', 1);

-- ============================================================
-- SELLER PROFILES
-- ============================================================
INSERT OR IGNORE INTO seller_profiles (id, user_id, store_name, slug, description, story, region, province, status, commission_rate, rating, review_count, verified) VALUES
  ('seller_01', 'user_seller01', 'Bán Có Tâm', 'ban-co-tam',
   'Đặc sản Hà Nội chính gốc, làm theo công thức gia truyền 3 đời. Bánh cốm, bánh cuốn, chả cá Lã Vọng.',
   'Tôi là Tâm, đời thứ 3 giữ lửa nghề làm bánh cốm làng Vòng. Cả gia đình tôi đều gắn bó với hương vị Hà Nội. Năm 2020, tôi quyết định mang những món quà quê hương đến gần hơn với thực khách cả nước qua Food Studio. Mỗi sản phẩm là một câu chuyện — từ mẻ bánh cốm dẻo thơm những ngày thu, đến chả cá Lã Vọng vàng ươm mà ông cha đã gìn giữ.', 'Miền Bắc', 'Hà Nội', 'approved', 0.12, 4.8, 127, 1),
  ('seller_02', 'user_seller02', 'Lẩu Bông - Tinh Hoa Miền Tây', 'lau-bong',
   'Đặc sản miền Tây sông nước: cá thát lát, khô cá lóc, mắm chưng, lẩu mắm. Giao tận nơi.',
   'Tôi sinh ra và lớn lên ở Cần Thơ, tuổi thơ gắn với những chuyến xuồng trên sông Hậu, mùi mắm kho quyện trong gió. Lẩu Bông ra đời từ khao khát mang hương vị quê nhà — món lẩu mắm của má, cá thát lát của ba — đến mọi miền đất nước. Bông là tên thân yêu của mẹ tôi.', 'Miền Nam', 'Cần Thơ', 'approved', 0.10, 4.6, 89, 1),
  ('seller_03', 'user_seller03', 'Hương Quê Xứ Huế', 'huong-que-xue-hue',
   'Tinh hoa ẩm thực cố đô Huế. Bánh bèo, bánh lọc, bánh nậm — chuẩn vị Hoàng Thành.',
   'Tôi lớn lên bên dòng sông Hương, học nấu ăn từ bà ngoại — người từng phụ bếp trong Hoàng Thành. Những chiếc bánh bèo của bà không chỉ là món ăn, mà là cả một nét văn hóa Huế. Hương Quê ra đời để san sẻ hương vị đó với người con xa xứ.', 'Miền Trung', 'Thừa Thiên Huế', 'approved', 0.12, 4.9, 203, 1),
  ('seller_04', 'user_seller04', 'Cà Phê Sạch Buôn Ma Thuột', 'ca-phe-sach-buon-ma-thuot',
   'Cà phê robusta và arabica sạch, canh tác bền vững tại Buôn Ma Thuột. Hợp tác trực tiếp với nông dân.',
   'Tôi từ bỏ công việc ở Sài Gòn để về Buôn Ma Thuột sống với cà phê. Tận mắt thấy nông dân bị ép giá, tôi quyết định làm chuỗi cung ứng công bằng — trả đúng giá trị cho hạt cà phê Việt. Mỗi tách cà phê bạn uống là một câu chuyện về những người nông dân Tây Nguyên.', 'Miền Trung', 'Đắk Lắk', 'approved', 0.08, 4.7, 156, 1),
  ('seller_05', 'user_seller05', 'Biển Xanh Phan Thiết', 'bien-xanh-phan-thiet',
   'Hải sản khô Phan Thiết chính hiệu: khô cá ngừ, khô mực, nước mắm Phan Thiết, mắm tôm chua.',
   'Gia đình tôi có 4 đời làm nghề biển ở Phan Thiết. Biển Xanh ra đời năm 2018, khởi đầu với 5kg mực khô biếu Tết. Giờ chúng tôi đã xuất hàng đi khắp cả nước, nhưng vẫn giữ bí quyết phơi sấy cha truyền con nối. Hải sản Biển Xanh — vị biển trong từng thớ thịt.', 'Miền Nam', 'Bình Thuận', 'approved', 0.10, 4.5, 68, 0);

-- ============================================================
-- PRODUCTS
-- ============================================================
INSERT OR IGNORE INTO products (id, seller_id, category_id, name, slug, description, story, region, province, base_price, compare_price, weight_grams, shelf_life_days, storage_notes, ingredients, allergens, status, featured, rating, review_count, sold_count) VALUES
  -- Seller 01: Bán Có Tâm (Hà Nội)
  ('prod_0101', 'seller_01', 'cat_01', 'Bánh Cốm Làng Vòng Hộp Quà', 'banh-com-lang-vong-hop-qua',
   'Bánh cốm Làng Vòng hộp quà sang trọng — món quà thu Hà Nội đích thực. Vỏ bánh xanh mướt, nhân đậu xanh dẻo thơm, gói bằng lá sen tươi.',
   'Mỗi chiếc bánh cốm được làm từ cốm làng Vòng — hạt cốm non được chọn lọc kỹ lưỡng, giã tay theo phương pháp truyền thống 3 đời. Hộp quà gồm 12 bánh, trang trí tinh tế, phù hợp làm quà biếu Tết, Trung Thu hay dịp đặc biệt.',
   'Miền Bắc', 'Hà Nội', 259000, 320000, 500, 21, 'Bảo quản nơi khô ráo, thoáng mát. Không để tủ lạnh. Tránh ánh nắng trực tiếp.',
   'Cốm làng Vòng, đậu xanh tách vỏ, đường kính trắng, dầu ăn, lá sen tươi, nước cốt dừa.',
   'Có thể chứa đậu phộng, vừng.', 'active', 1, 4.9, 43, 215),
  ('prod_0102', 'seller_01', 'cat_07', 'Chả Cá Lã Vọng Gói 500g', 'cha-ca-la-vong-goi-500g',
   'Chả cá Lã Vọng — món ăn huyền thoại của Hà Nội. Cá lóc đồng tươi, tẩm ướp nghệ và riềng, nướng than hoa.',
   'Công thức gia truyền từ nhà hàng Chả Cá Lã Vọng phố Hàng Sơn. Cá được ướp với nghệ tươi, riềng băm nhuyễn, mắm tôm nguyên chất, sau đó kẹp que nướng trên bếp than hồng. Ăn kèm bún, thì là, lạc rang và mắm tôm pha chanh ớt.',
   'Miền Bắc', 'Hà Nội', 179000, NULL, 500, 14, 'Bảo quản ngăn mát 0-4°C. Hạn sử dụng 14 ngày. Có thể cấp đông đến 3 tháng.',
   'Cá lóc đồng, nghệ tươi, riềng, mắm tôm, dầu ăn, thì là, hành lá, lạc rang.',
   'Cá, đậu phộng.', 'active', 1, 4.8, 38, 187),
  ('prod_0103', 'seller_01', 'cat_01', 'Bánh Gối Chay Hà Nội (10 cái)', 'banh-goi-chay-ha-noi-10-cai',
   'Bánh gối chay Hà Nội — vỏ bánh giòn rụm, nhân nấm hương và miến dong thơm lừng.',
   'Phiên bản chay đặc biệt cho mâm cỗ ngày Rằm. Nhân bánh gồm nấm hương, miến dong, mộc nhĩ, hành phi, xào chín với hạt tiêu. Bánh được rán ngập dầu ở nhiệt độ chuẩn — giòn tan bên ngoài, nóng hổi bên trong.', 'Miền Bắc', 'Hà Nội', 89000, 110000, 600, 7, 'Bảo quản ngăn mát. Hâm nóng bằng lò nướng hoặc chảo không dầu.',
   'Bột mì, nấm hương, miến dong, mộc nhĩ, hành tây, hạt tiêu, dầu thực vật.',
   'Có thể chứa đậu nành, vừng.', 'active', 0, 4.5, 15, 92),

  -- Seller 02: Lẩu Bông (Cần Thơ)
  ('prod_0201', 'seller_02', 'cat_02', 'Lẩu Mắm Cần Thơ Gia Truyền (Set 4 người)', 'lau-mam-can-tho-gia-truyen-set-4-nguoi',
   'Set lẩu mắm đặc sản Cần Thơ — mắm cá linh + nước lẩu đậm đà + rau đồng quê. Đủ cho 4 người.',
   'Lẩu mắm là linh hồn ẩm thực miền Tây. Nồi lẩu của Lẩu Bông dùng mắm cá linh và mắm cá sặc đồng chính hiệu, nấu cùng nước dừa tươi, sả, ớt, tỏi phi. Ăn kèm rau đồng (kèo nèo, bông súng, rau nhút) và cá basa tươi. Gói hàng gồm riêng phần mắm cốt + nước lẩu cô đặc và gia vị đi kèm.',
   'Miền Nam', 'Cần Thơ', 199000, 250000, 1500, 90, 'Bảo quản nơi khô ráo. Sau khi mở, dùng trong 7 ngày.',
   'Mắm cá linh, mắm cá sặc, nước dừa, sả, ớt, tỏi, riềng, đường thốt nốt, me chua, bột ngọt.',
   'Cá, đậu nành (nước tương).', 'active', 1, 4.7, 27, 134),
  ('prod_0202', 'seller_02', 'cat_06', 'Cá Thát Lát Chiên Sả Ớt (1kg)', 'ca-that-lat-chien-sa-ot-1kg',
   'Cá thát lát tươi đồng bằng, chiên giòn với sả ớt — món nhậu miền Tây đúng điệu.',
   'Cá thát lát được đánh bắt từ sông Hậu, thịt chắc, ngọt. Tôi tẩm ướp cá với sả băm, ớt hiểm, tỏi, nước mắm Phan Thiết, chiên vàng giòn. Chấm kèm nước mắm me chua ngọt — đúng vị quê nhà.',
   'Miền Nam', 'Cần Thơ', 139000, NULL, 1000, 30, 'Bảo quản ngăn đông -18°C. Rã đông tự nhiên trước khi dùng.',
   'Cá thát lát, sả, ớt hiểm, tỏi, nước mắm, bột nghệ, dầu ăn.',
   'Cá.', 'active', 0, 4.5, 12, 78),
  ('prod_0203', 'seller_02', 'cat_03', 'Mắm Chưng Miền Tây Hũ 500g', 'mam-chung-mien-tay-hu-500g',
   'Mắm chưng thịt ba chỉ — món ăn kèm cơm trắng nức tiếng miền Tây. Thơm lừng, béo ngậy, ăn là nghiền.',
   'Món mắm chưng của má tôi kết hợp mắm cá linh, thịt ba chỉ, trứng gà, nấm rơm, khế chua. Tất cả được hấp cách thủy — mắm chín mềm, thịt thấm, ăn cùng cơm nóng và rau sống. Hũ 500g ăn được 5-6 bữa.',
   'Miền Nam', 'Cần Thơ', 99000, 130000, 500, 60, 'Bảo quản ngăn mát. Hâm nóng bằng lò vi sóng hoặc hấp lại.',
   'Mắm cá linh, thịt ba chỉ, trứng gà, nấm rơm, khế chua, hành tím, tiêu, đường, nước mắm.',
   'Trứng, cá.', 'active', 0, 4.6, 19, 106),

  -- Seller 03: Hương Quê Xứ Huế
  ('prod_0301', 'seller_03', 'cat_01', 'Bánh Bèo Huế Hộp 36 Cái', 'banh-beo-hue-hop-36-cai',
   'Bánh bèo xứ Huế chuẩn vị Hoàng Thành — 36 cái nhỏ xinh, mềm mịn, chan nước mắm tỏi ớt đậm đà.',
   'Bánh bèo Huế của Hương Quê được làm theo công thức bà ngoại tôi — người từng phụ bếp cho Hoàng Thái Hậu. Bánh đúc bằng bột gạo xay tay, nhân tôm chấy thơm, phủ hành phi giòn, chan nước mắm pha chua ngọt đặc biệt. Gói 36 cái — đủ cho mâm cỗ gia đình.',
   'Miền Trung', 'Thừa Thiên Huế', 189000, 240000, 800, 10, 'Bảo quản ngăn mát. Hấp lại 3-5 phút trước khi ăn.',
   'Bột gạo, tôm khô, hành phi, nấm hương, dầu ăn, muối, đường, ớt, chanh, nước mắm.',
   'Tôm.', 'active', 1, 4.9, 45, 256),
  ('prod_0302', 'seller_03', 'cat_01', 'Bánh Lọc Huế Gói 500g', 'banh-loc-hue-goi-500g',
   'Bánh lọc trong veo nhân tôm thịt — dai ngon, đậm vị xứ Huế. Gói 500g (khoảng 30 cái).',
   'Bánh lọc Huế truyền thống — vỏ bột lọc trong suốt, bọc nhân tôm nguyên con và thịt ba chỉ thái hạt lựu. Gói trong lá chuối xanh rồi luộc chín. Khi ăn bóc lá, chấm nước mắm ớt tỏi pha chua cay. Đây là món không thể thiếu trong mâm cỗ Huế.',
   'Miền Trung', 'Thừa Thiên Huế', 129000, NULL, 500, 14, 'Bảo quản ngăn mát. Luộc lại 5 phút hoặc hấp trước khi ăn.',
   'Bột lọc, tôm khô, thịt ba chỉ, hành tím, tiêu, nước mắm, lá chuối.',
   'Tôm.', 'active', 0, 4.8, 31, 178),
  ('prod_0303', 'seller_03', 'cat_05', 'Chè Hạt Sen Huế - Long Nhãn Hũ 1L', 'che-hat-sen-hue-long-nhan-hu-1l',
   'Chè hạt sen long nhãn Huế — ngọt thanh, mát bổ. Sen Huế cốm xanh, long nhãn lồng cơm vàng.',
   'Hạt sen được chọn từ đầm phá Tam Giang — hạt tròn mẩy, cốm xanh, không hóa chất. Long nhãn là nhãn lồng Hưng Yên. Chè nấu với đường phèn, một chút gừng tươi. Món giải khát vừa ngon vừa bổ — đặc sản chè Huế thứ thiệt.',
   'Miền Trung', 'Thừa Thiên Huế', 79000, 99000, 1000, 14, 'Bảo quản ngăn mát. Dùng lạnh ngon hơn.',
   'Hạt sen, long nhãn khô, đường phèn, gừng tươi, vani.',
   'Không có.', 'active', 0, 4.7, 22, 145),

  -- Seller 04: Cà Phê Sạch Buôn Ma Thuột
  ('prod_0401', 'seller_04', 'cat_08', 'Cà Phê Robusta Sạch 500g (Xay/Gói)', 'ca-phe-robusta-sach-500g',
   'Cà phê Robusta sạch Buôn Ma Thuột — canh tác bền vững, rang mộc, không tạp chất. Vị đậm đà, hậu ngọt, chocolate.',
   'Hạt robusta được chọn từ vườn cà phê của đồng bào Ê-đê tại Buôn Ma Thuột. Chúng tôi trả giá cao hơn thị trường 30% để nông dân có thể sống tốt với nghề. Cà phê rang mộc ở nhiệt độ thấp (190°C) giữ trọn hương vị. Uống đen (ca phê phin) hoặc sữa đá đều tuyệt.',
   'Miền Trung', 'Đắk Lắk', 159000, 189000, 500, 365, 'Bảo quản nơi khô ráo, thoáng mát. Đậy kín sau khi mở.',
   'Cà phê robusta Buôn Ma Thuột 100%.',
   'Không có.', 'active', 1, 4.8, 39, 312),
  ('prod_0402', 'seller_04', 'cat_08', 'Cà Phê Arabica Cầu Đất 250g', 'ca-phe-arabica-cau-dat-250g',
   'Arabica Cầu Đất — dòng cà phê đặc sản Việt Nam. Hương trái cây nhẹ, chua thanh, hậu vị dài.',
   'Cầu Đất (Lâm Đồng) là vùng trồng arabica cao nhất Việt Nam — 1.600m so với mực nước biển. Hạt cherry được hái chọn bằng tay, sơ chế ướt (washed process). Rang light-medium giữ trọn vị cam quýt và caramel. Cà phê specialty đạt chuẩn SCA 84+.',
   'Miền Trung', 'Đắk Lắk', 199000, NULL, 250, 365, 'Bảo quản nơi khô ráo. Nên xay và dùng trong vòng 30 ngày sau khi mở.',
   'Cà phê arabica Cầu Đất Lâm Đồng 100% (độ cao 1.600m).',
   'Không có.', 'active', 1, 4.9, 27, 198),
  ('prod_0403', 'seller_04', 'cat_02', 'Gói Quà Cà Phê Đặc Sản (3 Loại)', 'goi-qua-ca-phe-dac-san-3-loai',
   'Gói quà cà phê đặc sản — 3 loại: Robusta BMT + Arabica Cầu Đất + Espresso Blend. Hộp quà sang trọng, phù hợp biếu tặng.',
   'Món quà hoàn hảo cho người yêu cà phê. Hộp gồm: 200g Robusta sạch (phin), 150g Arabica Cầu Đất (pour-over), 200g Espresso Blend (pha máy). Kèm card chứng nhận nguồn gốc. Đóng gói hút chân không tươi mới.',
   'Miền Trung', 'Đắk Lắk', 349000, 420000, 650, 365, 'Bảo quản nơi khô ráo, tránh ánh nắng.',
   'Cà phê robusta, cà phê arabica.', 'Không có.', 'active', 1, 4.7, 18, 87),

  -- Seller 05: Biển Xanh Phan Thiết
  ('prod_0501', 'seller_05', 'cat_06', 'Khô Cá Ngừ Phan Thiết 500g', 'kho-ca-ngu-phan-thiet-500g',
   'Cá ngừ tươi được phơi sấy công nghệ Nhật — thịt chắc, ngọt, đậm vị biển. Xé nhỏ chấm tương ớt.',
   'Cá ngừ vây vàng đánh bắt tại vùng biển Phan Thiết, được làm sạch, tẩm gia vị, sấy bằng quạt gió công nghệ Nhật (30°C trong 48h) giữ màu vàng đẹp mắt và vị ngọt tự nhiên. Không dùng hàn the, không chất bảo quản. Sau khi sấy, cá đạt độ dai vừa phải, xé nhỏ chấm muối ớt xanh hoặc tương ớt.',
   'Miền Nam', 'Bình Thuận', 149000, 179000, 500, 180, 'Bảo quản nơi khô ráo. Đậy kín sau khi mở. Để được 6 tháng.',
   'Cá ngừ vây vàng, muối, đường, ớt, tỏi, nước mắm cốt Phan Thiết.',
   'Cá.', 'active', 1, 4.6, 15, 123),
  ('prod_0502', 'seller_05', 'cat_06', 'Nước Mắm Cốt Phan Thiết (Chai 750ml)', 'nuoc-mam-cot-phan-thiet-chai-750ml',
   'Nước mắm cốt Phan Thiết nguyên chất — 45°N độ đạm, thơm đặc trưng, màu cánh gián đẹp.',
   'Nước mắm Biển Xanh được ủ từ cá cơm than tươi — tỷ lệ muối cá 1:3, ủ trong thùng gỗ bời lời 12 tháng. Chỉ rút 3 giọt cốt đầu — loại ngon nhất, có màu cánh gián óng, độ đạm 45°N. Chai 750ml dùng được 2-3 tháng.',
   'Miền Nam', 'Bình Thuận', 119000, NULL, 1200, 730, 'Đậy kín sau khi dùng. Để nơi thoáng mát. Không cần tủ lạnh.',
   'Cá cơm than tươi (80%), muối biển (20%).', 'Cá.', 'active', 1, 4.8, 22, 234),
  ('prod_0503', 'seller_05', 'cat_04', 'Mực Khô Phan Thiết Xé Cay (200g)', 'muc-kho-phan-thiet-xe-cay-200g',
   'Mực khô Phan Thiết xé sẵn, tẩm me & sa tế — món nhậu đỉnh nhất, giao lưu bóng đá.',
   'Mực ống được chọn kỹ — con to, dày thịt. Phơi sấy tự nhiên 3 nắng, sau đó xé sợi nhỏ và tẩm sốt me chua ngọt pha sa tế tôm. Vị mực ngọt dai, hòa với sốt me cay cay — "món tủ" của dân nhậu. Gói 200g, đóng zip để dùng dần.',
   'Miền Nam', 'Bình Thuận', 89000, 110000, 200, 90, 'Đậy kín sau khi mở. Để nơi khô ráo hoặc ngăn mát.',
   'Mực ống, me, sa tế, đường, ớt, tỏi, nước mắm.',
   'Mực (động vật thân mềm).', 'active', 0, 4.4, 11, 89);

-- ============================================================
-- PRODUCT IMAGES
-- ============================================================
INSERT OR IGNORE INTO product_images (id, product_id, url, alt, sort_order, is_primary) VALUES
  -- Bánh Cốm Làng Vòng
  ('img_0101a', 'prod_0101', 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800', 'Bánh cốm hộp quà sang trọng', 1, 1),
  ('img_0101b', 'prod_0101', 'https://images.unsplash.com/photo-1604909052743-94e838986d24?w=800', 'Bánh cốm từng cái gói lá sen', 2, 0),
  -- Chả Cá Lã Vọng
  ('img_0102a', 'prod_0102', 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=800', 'Chả cá nướng than hoa', 1, 1),
  -- Bánh gối
  ('img_0103a', 'prod_0103', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800', 'Bánh gối chay vàng giòn', 1, 1),
  -- Lẩu mắm
  ('img_0201a', 'prod_0201', 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800', 'Set lẩu mắm miền Tây', 1, 1),
  -- Cá thát lát
  ('img_0202a', 'prod_0202', 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800', 'Cá thát lát chiên sả ớt', 1, 1),
  -- Mắm chưng
  ('img_0203a', 'prod_0203', 'https://images.unsplash.com/photo-1553163147-622ab57be1c7?w=800', 'Mắm chưng hũ sành', 1, 1),
  -- Bánh bèo Huế
  ('img_0301a', 'prod_0301', 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800', 'Bánh bèo Huế trên mâm', 1, 1),
  ('img_0301b', 'prod_0301', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800', 'Từng chiếc bánh bèo', 2, 0),
  -- Bánh lọc
  ('img_0302a', 'prod_0302', 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800', 'Bánh lọc gói lá chuối', 1, 1),
  -- Chè hạt sen
  ('img_0303a', 'prod_0303', 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800', 'Chè hạt sen long nhãn', 1, 1),
  -- Robusta sạch
  ('img_0401a', 'prod_0401', 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800', 'Cà phê robusta gói 500g', 1, 1),
  ('img_0401b', 'prod_0401', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefda?w=800', 'Rang mộc hạt cà phê', 2, 0),
  -- Arabica Cầu Đất
  ('img_0402a', 'prod_0402', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800', 'Arabica Cầu Đất gói 250g', 1, 1),
  -- Gói quà cà phê
  ('img_0403a', 'prod_0403', 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800', 'Hộp quà cà phê sang trọng', 1, 1),
  -- Khô cá ngừ
  ('img_0501a', 'prod_0501', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800', 'Khô cá ngừ vàng ươm', 1, 1),
  -- Nước mắm
  ('img_0502a', 'prod_0502', 'https://images.unsplash.com/photo-1604909052743-94e838986d24?w=800', 'Chai nước mắm cốt Phan Thiết', 1, 1),
  -- Mực khô xé cay
  ('img_0503a', 'prod_0503', 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=800', 'Mực khô xé cay gói 200g', 1, 1);

-- ============================================================
-- PRODUCT VARIANTS
-- ============================================================
INSERT OR IGNORE INTO product_variants (id, product_id, name, sku, price, stock) VALUES
  ('var_0101a', 'prod_0101', 'Hộp 12 bánh (chuẩn)', 'CMLV-12', 259000, 50),
  ('var_0101b', 'prod_0101', 'Hộp 24 bánh (VIP)', 'CMLV-24', 459000, 20),
  ('var_0401a', 'prod_0401', 'Xay mịn pha phin', 'ROBU-FINE', 159000, 100),
  ('var_0401b', 'prod_0401', 'Nguyên hạt', 'ROBU-BEAN', 159000, 80),
  ('var_0402a', 'prod_0402', 'Xay pour-over', 'ARAB-PO', 199000, 40),
  ('var_0402b', 'prod_0402', 'Nguyên hạt', 'ARAB-BEAN', 199000, 40);

-- ============================================================
-- INVENTORY
-- ============================================================
INSERT OR IGNORE INTO inventory (id, product_id, variant_id, quantity, low_stock_alert) VALUES
  ('inv_0101a', 'prod_0101', 'var_0101a', 50, 10),
  ('inv_0101b', 'prod_0101', 'var_0101b', 20, 5),
  ('inv_0102',  'prod_0102', NULL, 35, 10),
  ('inv_0103',  'prod_0103', NULL, 60, 10),
  ('inv_0201',  'prod_0201', NULL, 25, 5),
  ('inv_0202',  'prod_0202', NULL, 30, 10),
  ('inv_0203',  'prod_0203', NULL, 40, 10),
  ('inv_0301',  'prod_0301', NULL, 45, 10),
  ('inv_0302',  'prod_0302', NULL, 55, 10),
  ('inv_0303',  'prod_0303', NULL, 30, 5),
  ('inv_0401a', 'prod_0401', 'var_0401a', 100, 20),
  ('inv_0401b', 'prod_0401', 'var_0401b', 80, 20),
  ('inv_0402a', 'prod_0402', 'var_0402a', 40, 10),
  ('inv_0402b', 'prod_0402', 'var_0402b', 40, 10),
  ('inv_0403',  'prod_0403', NULL, 25, 10),
  ('inv_0501',  'prod_0501', NULL, 50, 10),
  ('inv_0502',  'prod_0502', NULL, 60, 15),
  ('inv_0503',  'prod_0503', NULL, 45, 10);

-- ============================================================
-- REVIEWS
-- ============================================================
INSERT OR IGNORE INTO reviews (id, product_id, user_id, order_id, rating, title, body, helpful, status) VALUES
  -- Bánh cốm reviews
  ('rev_0101a', 'prod_0101', 'user_cust01', NULL, 5, 'Bánh cốm ngon nhất tôi từng ăn',
   'Bánh cốm dẻo thơm, vị ngọt thanh, gói lá sen thơm mát. Gửi biếu đồng nghiệp ở Sài Gòn ai cũng khen. Sẽ mua lại!', 12, 'published'),
  ('rev_0101b', 'prod_0101', 'user_cust03', NULL, 5, 'Quà thu Hà Nội đúng điệu',
   'Là người con xa quê, ăn miếng bánh cốm này nhớ mùa thu Hà Nội quá. Cảm ơn shop đã giữ được hương vị truyền thống.', 8, 'published'),
  ('rev_0101c', 'prod_0101', 'user_cust05', NULL, 4, 'Hộp quà đẹp, bánh ngon',
   'Bao bì đẹp, sang trọng. Bánh cốm ngon nhưng hơi ngọt với mình. Phần còn lại tuyệt vời.', 4, 'published'),
  -- Chả cá Lã Vọng
  ('rev_0102a', 'prod_0102', 'user_cust02', NULL, 5, 'Chả cá chuẩn vị Hà Nội',
   'Đã ăn chả cá Lã Vọng tại Hà Nội nhiều lần, gói này gần như không khác biệt. Nướng lên thơm lừng cả nhà. Cá chắc, ngọt, không tanh.', 15, 'published'),
  ('rev_0102b', 'prod_0102', 'user_cust04', NULL, 4, 'Ngon nhưng hơi mặn',
   'Chả cá ngon, đúng vị. Tuy nhiên mình thấy hơi mặn, có thể giảm mắm một chút. Nhưng tổng thể rất hài lòng.', 3, 'published'),
  -- Bánh bèo Huế
  ('rev_0301a', 'prod_0301', 'user_cust01', NULL, 5, 'Vị Huế chính gốc',
   'Tôi từng sống ở Huế 5 năm, bánh bèo này đúng chuẩn vị Huế. Bột mịn, nước mắm pha ngon. Mua cả chục hộp biếu bạn bè.', 18, 'published'),
  ('rev_0301b', 'prod_0301', 'user_cust02', NULL, 5, 'Bánh ngon, giao hàng nhanh',
   'Đặt tối qua sáng đã có. Bánh còn nóng, hấp lên ăn vẫn ngon như mới làm. Gia đình rất thích.', 10, 'published'),
  ('rev_0301c', 'prod_0301', 'user_cust05', NULL, 4, 'Chất lượng nhưng giá hơi cao',
   'Bánh bèo ngon thật, nhưng giá hơi cao so với mua ở Huế. Dù biết là chi phí vận chuyển... Nhưng chất lượng rất tốt.', 2, 'published'),
  -- Cà phê reviews
  ('rev_0401a', 'prod_0401', 'user_cust01', NULL, 5, 'Cà phê sạch, đậm đà',
   'Từ ngày chuyển qua cà phê này không dùng cà phê khác được. Phin lên thơm, béo, không chua. Đậm đà đúng gu mình.', 22, 'published'),
  ('rev_0401b', 'prod_0401', 'user_cust04', NULL, 5, 'Ủng hộ cà phê sạch Việt Nam',
   'Cà phê ngon, mà câu chuyện phía sau còn ý nghĩa hơn. Trả giá tốt cho nông dân — xứng đáng được ủng hộ. Vị rất đậm đà, đúng robusta BMT.', 14, 'published'),
  ('rev_0402a', 'prod_0402', 'user_cust03', NULL, 5, 'Arabica Việt Nam xuất sắc',
   'Không ngờ Việt Nam có arabica ngon đến vậy. Mình pha pour-over — hương cam quýt nhẹ, hậu ngọt dài. Một trong những specialty ngon nhất mình uống.', 9, 'published'),
  ('rev_0502a', 'prod_0502', 'user_cust02', NULL, 5, 'Nước mắm ngon nhất từng dùng',
   'Thử qua nhiều loại nước mắm, chai này thực sự xuất sắc. Màu đẹp, thơm, mặn ngọt vừa phải. Pha nước chấm hay nấu ăn đều ngon.', 16, 'published');

-- ============================================================
-- ORDERS (completed, delivered, for history)
-- ============================================================
INSERT OR IGNORE INTO orders (id, user_id, status, subtotal, shipping_fee, discount, total, shipping_address, note, created_at, updated_at) VALUES
  ('ord_0001', 'user_cust01', 'delivered', 259000, 30000, 0, 289000,
   '{"full_name":"Nguyễn Thị Lan","phone":"0907111111","line1":"123 Nguyễn Huệ","ward":"Phường Bến Nghé","district":"Quận 1","province":"TP Hồ Chí Minh"}',
   'Giao giờ hành chính. Nhờ gói quà cẩn thận, tặng sinh nhật mẹ.',
   UNIXEPOCH('now', '-35 days'), UNIXEPOCH('now', '-33 days')),
  ('ord_0002', 'user_cust02', 'delivered', 338000, 25000, 50000, 313000,
   '{"full_name":"Trần Minh","phone":"0908111111","line1":"456 Lê Lợi","ward":"Phường Hải Châu 1","district":"Quận Hải Châu","province":"Đà Nẵng"}',
   'Giao vào cuối tuần.',
   UNIXEPOCH('now', '-28 days'), UNIXEPOCH('now', '-26 days')),
  ('ord_0003', 'user_cust03', 'delivered', 348000, 30000, 0, 378000,
   '{"full_name":"Phạm Thu Hoa","phone":"0909111111","line1":"789 Kim Mã","ward":"Phường Kim Mã","district":"Quận Ba Đình","province":"Hà Nội"}',
   NULL,
   UNIXEPOCH('now', '-21 days'), UNIXEPOCH('now', '-19 days')),
  ('ord_0004', 'user_cust04', 'shipped', 298000, 30000, 20000, 308000,
   '{"full_name":"Vương Thị Anh","phone":"0910111111","line1":"321 Hoàng Diệu","ward":"Phường Hòa Thuận","district":"Quận Hải Châu","province":"Đà Nẵng"}',
   'Có người nhận giúp. Để lại số khác.',
   UNIXEPOCH('now', '-7 days'), UNIXEPOCH('now', '-5 days')),
  ('ord_0005', 'user_cust05', 'confirmed', 179000, 30000, 0, 209000,
   '{"full_name":"Lê Trung Đức","phone":"0911111111","line1":"159 Nguyễn Văn Linh","ward":"Phường Tân Thuận Tây","district":"Quận 7","province":"TP Hồ Chí Minh"}',
   NULL,
   UNIXEPOCH('now', '-2 days'), UNIXEPOCH('now', '-2 days')),
  ('ord_0006', 'user_cust01', 'delivered', 159000, 30000, 0, 189000,
   '{"full_name":"Nguyễn Thị Lan","phone":"0907111111","line1":"123 Nguyễn Huệ","ward":"Phường Bến Nghé","district":"Quận 1","province":"TP Hồ Chí Minh"}',
   'Mua thường xuyên. Cà phê ngon!',
   UNIXEPOCH('now', '-14 days'), UNIXEPOCH('now', '-12 days'));

-- ============================================================
-- ORDER ITEMS
-- ============================================================
INSERT OR IGNORE INTO order_items (id, order_id, seller_id, product_id, variant_id, product_name, variant_name, quantity, unit_price, total_price, status) VALUES
  ('oi_0001', 'ord_0001', 'seller_01', 'prod_0101', 'var_0101a', 'Bánh Cốm Làng Vòng Hộp Quà', 'Hộp 12 bánh (chuẩn)', 1, 259000, 259000, 'delivered'),
  ('oi_0002', 'ord_0002', 'seller_04', 'prod_0401', 'var_0401a', 'Cà Phê Robusta Sạch 500g', 'Xay mịn pha phin', 1, 159000, 159000, 'delivered'),
  ('oi_0003', 'ord_0002', 'seller_05', 'prod_0501', NULL, 'Khô Cá Ngừ Phan Thiết 500g', NULL, 1, 149000, 149000, 'delivered'),
  ('oi_0004', 'ord_0002', 'seller_05', 'prod_0503', NULL, 'Mực Khô Phan Thiết Xé Cay 200g', NULL, 1, 89000, 0, 'delivered'), -- will recalc via coupon
  ('oi_0005', 'ord_0003', 'seller_03', 'prod_0301', NULL, 'Bánh Bèo Huế Hộp 36 Cái', NULL, 1, 189000, 189000, 'delivered'),
  ('oi_0006', 'ord_0003', 'seller_03', 'prod_0303', NULL, 'Chè Hạt Sen Huế - Long Nhãn Hũ 1L', NULL, 2, 79000, 158000, 'delivered'),
  ('oi_0007', 'ord_0004', 'seller_05', 'prod_0502', NULL, 'Nước Mắm Cốt Phan Thiết (Chai 750ml)', NULL, 2, 119000, 238000, 'delivered'),
  ('oi_0008', 'ord_0004', 'seller_02', 'prod_0201', NULL, 'Lẩu Mắm Cần Thơ Gia Truyền (Set 4 người)', NULL, 1, 199000, 0, 'cancelled'), -- item cancelled
  ('oi_0009', 'ord_0004', 'seller_04', 'prod_0402', 'var_0402a', 'Cà Phê Arabica Cầu Đất 250g', 'Xay pour-over', 1, 199000, 199000, 'delivered'),
  ('oi_0010', 'ord_0005', 'seller_01', 'prod_0102', NULL, 'Chả Cá Lã Vọng Gói 500g', NULL, 1, 179000, 179000, 'confirmed'),
  ('oi_0011', 'ord_0006', 'seller_04', 'prod_0401', 'var_0401b', 'Cà Phê Robusta Sạch 500g', 'Nguyên hạt', 1, 159000, 159000, 'delivered');

-- ============================================================
-- SHIPMENTS
-- ============================================================
INSERT OR IGNORE INTO shipments (id, order_id, carrier, tracking_number, status, shipped_at, estimated_at, delivered_at) VALUES
  ('ship_01', 'ord_0001', 'GHN', 'GHN1234567890', 'delivered', UNIXEPOCH('now', '-33 days'), UNIXEPOCH('now', '-32 days'), UNIXEPOCH('now', '-32 days')),
  ('ship_02', 'ord_0002', 'GHN', 'GHN1234567891', 'delivered', UNIXEPOCH('now', '-26 days'), UNIXEPOCH('now', '-25 days'), UNIXEPOCH('now', '-24 days')),
  ('ship_03', 'ord_0003', 'Viettel Post', 'VTP123456789', 'delivered', UNIXEPOCH('now', '-20 days'), UNIXEPOCH('now', '-19 days'), UNIXEPOCH('now', '-18 days')),
  ('ship_04', 'ord_0004', 'GHN', 'GHN1234567892', 'shipped', UNIXEPOCH('now', '-7 days'), UNIXEPOCH('now', '-5 days'), NULL),
  ('ship_05', 'ord_0005', NULL, NULL, 'pending', NULL, NULL, NULL),
  ('ship_06', 'ord_0006', 'Viettel Post', 'VTP123456790', 'delivered', UNIXEPOCH('now', '-13 days'), UNIXEPOCH('now', '-12 days'), UNIXEPOCH('now', '-11 days'));

-- ============================================================
-- PAYMENTS
-- ============================================================
INSERT OR IGNORE INTO payments (id, order_id, method, provider, provider_ref, amount, status, paid_at) VALUES
  ('pay_01', 'ord_0001', 'bank_transfer', 'VNB', 'VNB24070100001', 289000, 'paid', UNIXEPOCH('now', '-35 days')),
  ('pay_02', 'ord_0002', 'momo', 'MOMO', 'MOMO24070100002', 313000, 'paid', UNIXEPOCH('now', '-28 days')),
  ('pay_03', 'ord_0003', 'vnpay', 'VNPAY', 'VNPAY24070100003', 378000, 'paid', UNIXEPOCH('now', '-21 days')),
  ('pay_04', 'ord_0004', 'bank_transfer', 'VCB', 'VCB24070100004', 308000, 'paid', UNIXEPOCH('now', '-7 days')),
  ('pay_05', 'ord_0005', 'cod', 'COD', NULL, 209000, 'pending', NULL),
  ('pay_06', 'ord_0006', 'momo', 'MOMO', 'MOMO24070100006', 189000, 'paid', UNIXEPOCH('now', '-14 days'));

-- ============================================================
-- COUPONS
-- ============================================================
INSERT OR IGNORE INTO coupons (id, code, type, value, min_order, max_discount, usage_limit, usage_count, per_user_limit, starts_at, expires_at, active) VALUES
  ('cup_01', 'WELCOME10', 'percent', 10, 100000, 50000, 1000, 487, 1, UNIXEPOCH(), UNIXEPOCH('now', '+90 days'), 1),
  ('cup_02', 'FIRSTGIFT', 'fixed', 50000, 200000, NULL, 500, 215, 1, UNIXEPOCH(), UNIXEPOCH('now', '+60 days'), 1),
  ('cup_03', 'FREE150K', 'percent', 15, 500000, 150000, 200, 43, 1, UNIXEPOCH(), UNIXEPOCH('now', '+45 days'), 1),
  ('cup_04', 'MAM10', 'percent', 10, 0, 30000, 100, 89, 2, UNIXEPOCH(), UNIXEPOCH('now', '+30 days'), 1),
  ('cup_05', 'TET2026', 'fixed', 100000, 500000, NULL, 500, 0, 1, UNIXEPOCH('now', '+60 days'), UNIXEPOCH('now', '+120 days'), 0); -- future campaign

-- ============================================================
-- WISHLISTS
-- ============================================================
INSERT OR IGNORE INTO wishlists (id, user_id, name) VALUES
  ('wl_01', 'user_cust01', 'Món ngon cho bếp nhà'),
  ('wl_02', 'user_cust02', 'Quà Tết'),
  ('wl_03', 'user_cust03', 'Yêu thích');

INSERT OR IGNORE INTO wishlist_items (id, wishlist_id, product_id) VALUES
  ('wli_01', 'wl_01', 'prod_0101'),
  ('wli_02', 'wl_01', 'prod_0301'),
  ('wli_03', 'wl_01', 'prod_0502'),
  ('wli_04', 'wl_02', 'prod_0403'),
  ('wli_05', 'wl_02', 'prod_0501'),
  ('wli_06', 'wl_03', 'prod_0201'),
  ('wli_07', 'wl_03', 'prod_0402'),
  ('wli_08', 'wl_03', 'prod_0102');

-- ============================================================
-- LOYALTY ACCOUNTS
-- ============================================================
INSERT OR IGNORE INTO loyalty_accounts (id, user_id, points, tier) VALUES
  ('loy_01', 'user_cust01', 1250, 'silver'),
  ('loy_02', 'user_cust02', 2350, 'gold'),
  ('loy_03', 'user_cust03', 580, 'bronze'),
  ('loy_04', 'user_cust04', 780, 'bronze'),
  ('loy_05', 'user_cust05', 120, 'bronze');

-- ============================================================
-- INDEXES (additional for query perf)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);