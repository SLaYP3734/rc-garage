-- RC Atölyesi — Başlangıç İçeriği, 3. Parti (50 Soru + Çözüm, RC ARABA ağırlıklı)
-- ============================================================
-- Bu dosya, seed-starter-content.sql (ilk 18) ve seed-starter-content-2.sql
-- (2. parti 50) ile AYNI hesabı kullanıyor ve onlara EK olarak çalışıyor —
-- birbirini silmiyor, birbirinin üstüne yazmıyor.
--
-- ÇALIŞTIRMADAN ÖNCE:
-- 1) Daha önce açtığın "RC Atölyesi Ekibi" hesabının UUID'ini kullan
--    (önceki dosyalarda kullandığın ile AYNI UUID olmalı).
-- 2) Aşağıda geçen HER "EKIP_UUID_BURAYA" yazan yeri o UUID ile
--    değiştir (bulundur-değiştir, dosyada çok sayıda yerde geçiyor).
-- 3) Supabase SQL Editor -> New query -> tamamını yapıştır -> Run.
--
-- İçerik motor/ESC/batarya konularına ağırlık veriyor çünkü Türkiye'de
-- RC hobicilerin en çok arattığı arızalar bu üç grupta yoğunlaşıyor.
-- ============================================================

-- 1) Traxxas Slash — fırçasız motor tık tık sesi çıkarıp gaz vermiyor
insert into problems (id, user_id, title, brand, model, category, vehicle_type, description, status, slug, created_at) values
('fd5d740a-76a8-4efd-ac55-86b363276b69', 'EKIP_UUID_BURAYA', 'Fırçasız motor aniden duruyor, "tık tık" sesi çıkarıp gaz vermiyor', 'Traxxas', 'Slash', 'motor', 'araba', 'Sürüş ortasında motor birden duruyor, gaz verince tık tık sesi çıkarıyor ama dönmüyor. Birkaç dakika bekleyince bazen düzeliyor.', 'solved', 'traxxas-slash-motor-tik-tik-a01', now() - interval '49 days');
insert into answers (id, problem_id, user_id, body, is_accepted, created_at) values
(gen_random_uuid(), 'fd5d740a-76a8-4efd-ac55-86b363276b69', 'EKIP_UUID_BURAYA', 'Bu ses genelde ESC''nin motoru döndürmeye çalışıp senkronizasyonu bulamamasından gelir. Önce motor-ESC arasındaki 3 faz kablosundan birinin gevşek olup olmadığını kontrol et, konnektörleri tam oturana kadar it. Sorun devam ederse 3 kablodan ikisinin yerini değiştirip tekrar dene, motor senkron kayması bazen bu şekilde düzelir. Bekleyince düzelmesi ısınmadan kaynaklı termal korumaya da işaret edebilir, motor/ESC soğutmasını iyileştirmeyi düşün.', true, now() - interval '48 days 12 hours');

-- 2) Arrma Typhon — motor bir yöne titriyor diğer yönde normal
insert into problems (id, user_id, title, brand, model, category, vehicle_type, description, status, slug, created_at) values
('3e887d4f-184c-4b0f-a713-22b920483143', 'EKIP_UUID_BURAYA', 'Motor bir yöne dönerken titriyor, diğer yönde sorun yok', 'Arrma', 'Typhon', 'esc', 'araba', 'İleri giderken motor sorunsuz ama geri vitese aldığımda motor titriyor ve garip ses çıkarıyor.', 'solved', 'arrma-typhon-motor-titriyor-a02', now() - interval '48 days');
insert into answers (id, problem_id, user_id, body, is_accepted, created_at) values
(gen_random_uuid(), '3e887d4f-184c-4b0f-a713-22b920483143', 'EKIP_UUID_BURAYA', 'Bu genelde ESC''nin fren/geri vites kalibrasyonunun düzgün yapılmamasından kaynaklanır. ESC''yi fabrika ayarlarına sıfırlayıp throttle kalibrasyonunu yeniden yap: gaz kolunu sırasıyla tam ileri, tam geri ve nötr konumuna götürerek ESC''ye bu noktaları yeniden öğret. Bazı ESC''lerde geri vites gücü ayarı da vardır, çok düşük ayarlanmışsa motor o yönde daha zorlanıp titreşim yapabilir.', true, now() - interval '47 days 12 hours');

-- 3) HPI Savage XL — gaz verince araç gitmiyor ama motor sesi geliyor
insert into problems (id, user_id, title, brand, model, category, vehicle_type, description, status, slug, created_at) values
('d51d4282-be86-4eb5-b0db-5909a8e0d1d7', 'EKIP_UUID_BURAYA', 'Gaz verince motor sesi geliyor ama araç yerinden hareket etmiyor', 'HPI', 'Savage XL', 'sasi', 'araba', 'Gaz kolunu sonuna kadar verdiğimde motor yüksek sesle dönüyor ama tekerlekler dönmüyor, araç yerinde duruyor.', 'solved', 'hpi-savage-xl-motor-donuyor-hareketsiz-a03', now() - interval '47 days');
insert into answers (id, problem_id, user_id, body, is_accepted, created_at) values
(gen_random_uuid(), 'd51d4282-be86-4eb5-b0db-5909a8e0d1d7', 'EKIP_UUID_BURAYA', 'Motor dönüp aracın hareket etmemesi güç iletiminde bir kopukluk olduğunu gösterir. En sık sebep pinyon dişlinin motor mili üzerinde kaymış veya set vidasının gevşemiş olması, pinyonu kontrol edip vidasını sık. Pinyon yerindeyse ana dişli (spur gear) veya diferansiyel içindeki bir dişli kırılmış olabilir, şanzıman kapağını açıp dişlileri gözle kontrol et.', true, now() - interval '46 days 12 hours');

-- 4) Losi Super Baja Rex — ESC'den yanık kokusu geliyor
insert into problems (id, user_id, title, brand, model, category, vehicle_type, description, status, slug, created_at) values
('b0dd59fd-00a7-44bd-824b-332b907f0f97', 'EKIP_UUID_BURAYA', 'ESC''den yanık kokusu geliyor, kullanmaya devam edebilir miyim?', 'Losi', 'Super Baja Rex', 'esc', 'araba', 'Kısa bir sürüşten sonra ESC''den hafif yanık kokusu fark ettim. Araç hâlâ çalışıyor ama endişelendim.', 'solved', 'losi-super-baja-rex-esc-yanik-koku-a04', now() - interval '46 days');
insert into answers (id, problem_id, user_id, body, is_accepted, created_at) values
(gen_random_uuid(), 'b0dd59fd-00a7-44bd-824b-332b907f0f97', 'EKIP_UUID_BURAYA', 'Yanık kokusu geldiğinde aracı hemen kapat ve tekrar denemeden önce ESC''yi kontrol et — bu genelde aşırı akım çekilmesinin belirtisidir. Motor rulmanlarının veya dişlilerin sıkışıp sıkışmadığını kontrol et, tekerlekleri elle çevirip anormal sertlik olup olmadığına bak. Ayrıca kullandığın ESC''nin amper kapasitesi motoruna göre yetersiz olabilir, motor gücüne uygun bir ESC''ye geçmek gerekebilir. Koku tekrarlarsa ESC''yi değiştirmeden kullanmamanı öneririm, kalıcı hasar riski var.', true, now() - interval '45 days 12 hours');

-- 5) Team Associated Reflex — fırçalı motor gittikçe daha az güçlü
insert into problems (id, user_id, title, brand, model, category, vehicle_type, description, status, slug, created_at) values
('fa70b9cd-a8dc-47ef-8e15-d6d2320b1119', 'EKIP_UUID_BURAYA', 'Fırçalı motor zamanla eskisi kadar güçlü çalışmıyor', 'Team Associated', 'Reflex', 'motor', 'araba', 'Bir yıldır kullandığım fırçalı motorlu araç eskisi gibi hızlanmıyor, gücü belirgin şekilde azalmış hissediyorum.', 'solved', 'associated-reflex-motor-gucu-azaldi-a05', now() - interval '45 days');
insert into answers (id, problem_id, user_id, body, is_accepted, created_at) values
(gen_random_uuid(), 'fa70b9cd-a8dc-47ef-8e15-d6d2320b1119', 'EKIP_UUID_BURAYA', 'Fırçalı motorlarda güç kaybı çoğunlukla fırçaların aşınması veya komütatörün (motor içindeki bakır silindir) kirlenip karbon birikmesinden kaynaklanır. Motoru sökebiliyorsan komütatörü ince zımpara kağıdı ile nazikçe temizle ve motor temizleme spreyi kullan, fırçalar görünür şekilde kısalmışsa değiştir. Fırçalı motorlar sarf malzemesi kabul edilir, bu bakım işe yaramazsa motor değişimi en pratik çözümdür.', true, now() - interval '44 days 12 hours');

-- 6) Kyosho MP10 — ESC programlama kartı ile bağlanamıyor
insert into problems (id, user_id, title, brand, model, category, vehicle_type, description, status, slug, created_at) values
('e252da27-d30d-451d-89d2-b6ee71cb4d46', 'EKIP_UUID_BURAYA', 'ESC programlama kartı takınca hiçbir tepki vermiyor, tanımıyor', 'Kyosho', 'MP10', 'esc', 'araba', 'ESC''yi ayarlamak için programlama kartı aldım ama takınca LED yanmıyor, hiçbir menü açılmıyor.', 'solved', 'kyosho-mp10-esc-programlama-karti-a06', now() - interval '44 days');
insert into answers (id, problem_id, user_id, body, is_accepted, created_at) values
(gen_random_uuid(), 'e252da27-d30d-451d-89d2-b6ee71cb4d46', 'EKIP_UUID_BURAYA', 'İlk kontrol edilmesi gereken şey programlama kartının o ESC markası/modeliyle uyumlu olup olmadığı, her ESC üreticisinin kendi kart protokolü olabilir. Kartın konnektörünü ters bağlamadığından emin ol, çoğu kartta yön işareti (ok veya + / -) bulunur. ESC''ye ayrı bir batarya bağlı olması gerekebilir, sadece kart takıp beklemek yetmez, ana bataryayı da bağlı tutman gerekir.', true, now() - interval '43 days 12 hours');

-- 7) Redcat Volcano — motor çalışırken alıcı resetleniyor
insert into problems (id, user_id, title, brand, model, category, vehicle_type, description, status, slug, created_at) values
('18263baf-1f1b-4bcb-92a0-9a743b16f21b', 'EKIP_UUID_BURAYA', 'Tam gaz verince alıcının LED''i sönüp yanıyor, araç bir anlığına kontrolsüz kalıyor', 'Redcat', 'Volcano EPX', 'esc', 'araba', 'Ani ve sert gaz verdiğimde alıcı ünitesi resetleniyor gibi, LED sönüp tekrar yanıyor ve araç o sırada tepkisiz kalıyor.', 'solved', 'redcat-volcano-alici-resetleniyor-a07', now() - interval '43 days');
insert into answers (id, problem_id, user_id, body, is_accepted, created_at) values
(gen_random_uuid(), '18263baf-1f1b-4bcb-92a0-9a743b16f21b', 'EKIP_UUID_BURAYA', 'Bu klasik bir "brownout" (voltaj düşmesi) belirtisi — motor ani yük çekince ESC''nin alıcıya güç veren BEC devresi anlık olarak yetersiz kalıyor. Bataryanın iç direnci yüksekse (yaşlanmış batarya) bu daha sık görülür, önce bataryayı test et veya yenisini dene. Sorun devam ederse ESC''nin BEC''i yerine ayrı bir alıcı bataryası (RX pack) kullanmak bu sorunu kalıcı olarak çözer.', true, now() - interval '42 days 12 hours');

-- 8) Traxxas E-Revo — fırçasız motordan cırt cırt sesi
insert into problems (id, user_id, title, brand, model, category, vehicle_type, description, status, slug, created_at) values
('92a08be8-2843-428e-b7e6-57eb5e4f82b2', 'EKIP_UUID_BURAYA', 'Motor çalışırken metalik bir cırt cırt sesi geliyor', 'Traxxas', 'E-Revo', 'motor', 'araba', 'Fırçasız motorumdan sürüş sırasında ince, metalik bir cırt cırt sesi geliyor. Motor ısınıyor da normalden fazla.', 'solved', 'traxxas-erevo-motor-cirt-cirt-a08', now() - interval '42 days');
insert into answers (id, problem_id, user_id, body, is_accepted, created_at) values
(gen_random_uuid(), '92a08be8-2843-428e-b7e6-57eb5e4f82b2', 'EKIP_UUID_BURAYA', 'Bu ses ve ekstra ısınma birlikte geldiğinde çoğunlukla motor rulmanlarından biri kirlenmiş veya aşınmış demektir. Motoru sökmeden rulman boşluklarına RC rulman yağı sıkmayı dene, hafif iyileşme olursa rulman temizliğiyle devam et. Ses devam ediyorsa rulmanı değiştirmen gerekir, aksi halde aşınmış rulman motor sargısına da zarar verebilir ve motoru komple değiştirmen gerekebilir.', true, now() - interval '41 days 12 hours');

-- 9) Arrma Kraton — ilk çalıştırmada ESC uzun bip veriyor
insert into problems (id, user_id, title, brand, model, category, vehicle_type, description, status, slug, created_at) values
('71fc81a4-f6a2-4824-83e6-4914f96be76f', 'EKIP_UUID_BURAYA', 'ESC uzun "bip bip" sesi veriyor, araç hiç hareket etmiyor', 'Arrma', 'Kraton', 'esc', 'araba', 'Yeni bataryayla açtığımda ESC uzun süre bip sesi çıkarıyor ve gaz verdiğimde hiçbir tepki yok.', 'solved', 'arrma-kraton-esc-bip-sesi-a09', now() - interval '41 days');
insert into answers (id, problem_id, user_id, body, is_accepted, created_at) values
(gen_random_uuid(), '71fc81a4-f6a2-4824-83e6-4914f96be76f', 'EKIP_UUID_BURAYA', 'Uzun bip sesi genelde throttle kalibrasyon uyarısıdır, ESC kumandadan beklediği sinyali alamıyor demektir. Kumandayı önce açıp sonra aracı aç, sıralama önemlidir. Sorun devam ederse ESC''yi fabrika ayarına sıfırlayıp throttle kalibrasyonunu (gaz kolunu tam ileri-tam geri-nötr sırasıyla) yeniden yap.', true, now() - interval '40 days 12 hours');

-- 10) HPI Blitz — motor bir taraftan aşırı ısınıyor
insert into problems (id, user_id, title, brand, model, category, vehicle_type, description, status, slug, created_at) values
('6eb4f33a-7103-48b3-9b9a-a7dd86994629', 'EKIP_UUID_BURAYA', 'Motorun bir tarafı çok ısınıyor, diğer tarafı normal', 'HPI', 'Blitz', 'motor', 'araba', 'Motoru elimle kontrol ettiğimde bir tarafı yakacak kadar sıcak diğer tarafı ise ılık, bu normal mi bilmiyorum.', 'solved', 'hpi-blitz-motor-tek-taraf-isiniyor-a10', now() - interval '40 days');
insert into answers (id, problem_id, user_id, body, is_accepted, created_at) values
(gen_random_uuid(), '6eb4f33a-7103-48b3-9b9a-a7dd86994629', 'EKIP_UUID_BURAYA', 'Motorun bir tarafının belirgin şekilde daha sıcak olması normal değil, genelde motor içindeki mıknatıslardan biri gevşemiş veya rulman merkezden kaymış olduğuna işaret eder. Bu tür bir dengesizlik kendiliğinden düzelmez ve motor sarımına da zarar verebilir, en güvenli çözüm motoru değiştirmek. Değiştirmeden önce garanti kapsamında olup olmadığını kontrol etmeni öneririm, bu tarz arızalar genelde üretim kaynaklıdır.', true, now() - interval '39 days 12 hours');

-- 11) Losi 22S — LiPo batarya şişmiş görünüyor
insert into problems (id, user_id, title, brand, model, category, vehicle_type, description, status, slug, created_at) values
('7b565d4f-454a-4a5d-a651-8ae8f3f895de', 'EKIP_UUID_BURAYA', 'LiPo bataryam şişmiş görünüyor, kullanabilir miyim?', 'Losi', '22S', 'batarya', 'araba', 'Bataryayı şaseden çıkarınca eskisi gibi düz durmadığını, hafif şiştiğini fark ettim. Performansı da düşmüştü zaten.', 'solved', 'losi-22s-lipo-batarya-sismis-a11', now() - interval '39 days');
insert into answers (id, problem_id, user_id, body, is_accepted, created_at) values
(gen_random_uuid(), '7b565d4f-454a-4a5d-a651-8ae8f3f895de', 'EKIP_UUID_BURAYA', 'Şişmiş bir LiPo bataryayı kesinlikle kullanmamalı, şarj etmemeli veya araca takmamalısın, hücre yapısı bozulmuş ve yangın/patlama riski taşıyor. Bataryayı güvenli bir şekilde (yanıcı olmayan bir kapta) tamamen boşaltarak imha etmen gerekiyor, tuzlu suda bekletme yöntemi en yaygın güvenli imha şeklidir. Performansın şişmeden önce düşmüş olması da normal, hücre bozulması genelde önceden belirti verir.', true, now() - interval '38 days 12 hours');

-- 12) Traxxas Stampede 4x4 — batarya çok çabuk bitiyor
insert into problems (id, user_id, title, brand, model, category, vehicle_type, description, status, slug, created_at) values
('d9d4e6ac-bec0-464f-82b7-7f0d4a467cf9', 'EKIP_UUID_BURAYA', 'Batarya eskisi gibi dayanmıyor, çok hızlı bitiyor', 'Traxxas', 'Stampede 4x4', 'batarya', 'araba', 'Aynı bataryayla eskiden 15-20 dakika sürebiliyordum, şimdi 5-6 dakikada bitiyor gibi hissediyorum.', 'solved', 'traxxas-stampede4x4-batarya-cabuk-bitiyor-a12', now() - interval '38 days');
insert into answers (id, problem_id, user_id, body, is_accepted, created_at) values
(gen_random_uuid(), 'd9d4e6ac-bec0-464f-82b7-7f0d4a467cf9', 'EKIP_UUID_BURAYA', 'Bu genelde bataryadaki hücrelerden birinin zayıflaması (dengesizlik) veya bataryanın genel yaşlanmasıyla ilgilidir. Şarj cihazının dengeli şarj (balance charge) fonksiyonunu kullanıp şarj sonrası her hücrenin voltajını ayrı ayrı ölç, bir hücre diğerlerinden belirgin düşükse batarya yenilenmeli. Şarj cihazının varsa "kapasite testi" özelliğiyle gerçek kapasiteyi ölçmek de faydalı, etikette yazan kapasitenin %70''inin altına düşmüşse batarya ömrünü tamamlamıştır.', true, now() - interval '37 days 12 hours');

-- 13) Arrma Senton — şarj cihazı bataryayı tanımıyor
insert into problems (id, user_id, title, brand, model, category, vehicle_type, description, status, slug, created_at) values
('437ecfd7-a86b-467b-977d-13cc3e32ec38', 'EKIP_UUID_BURAYA', 'Şarj cihazı bataryayı takınca hata veriyor, hiç başlamıyor', 'Arrma', 'Senton', 'batarya', 'araba', 'Balance konnektörünü takınca şarj cihazı "no battery" ya da hücre sayısı hatası veriyor, ana kablo bağlı olmasına rağmen.', 'solved', 'arrma-senton-sarj-batarya-tanimiyor-a13', now() - interval '37 days');
insert into answers (id, problem_id, user_id, body, is_accepted, created_at) values
(gen_random_uuid(), '437ecfd7-a86b-467b-977d-13cc3e32ec38', 'EKIP_UUID_BURAYA', 'Bu hatanın en sık sebebi balance konnektörünün tam oturmaması veya pinlerinde oksitlenme olması. Konnektörü çıkarıp pinlere hafifçe bak, kararma varsa ince bir fırçayla temizle ve tam kavrayana kadar tekrar tak. Sorun sürerse farklı bir batarya ile şarj cihazını test et, cihazda mı bataryada mı olduğunu bu şekilde ayırt edersin.', true, now() - interval '36 days 12 hours');

-- 14) Team Losi Night Crawler — LiPo şarj sırasında çok ısınıyor
insert into problems (id, user_id, title, brand, model, category, vehicle_type, description, status, slug, created_at) values
('cba24464-a1ff-4a3a-9bcb-0ec868777a2d', 'EKIP_UUID_BURAYA', 'Şarj olurken batarya elle dokunulmayacak kadar ısınıyor', 'Team Losi', 'Night Crawler SE', 'batarya', 'araba', 'Şarj sırasında bataryanın çok ısındığını fark ettim, şarj bitince de bir süre sıcak kalıyor.', 'solved', 'losi-night-crawler-sarjda-isiniyor-a14', now() - interval '36 days');
insert into answers (id, problem_id, user_id, body, is_accepted, created_at) values
(gen_random_uuid(), 'cba24464-a1ff-4a3a-9bcb-0ec868777a2d', 'EKIP_UUID_BURAYA', 'Şarj sırasında hafif ılıklık normal ama elle dokunulmayacak kadar sıcaklık değil. Şarj akımını düşür, genel kural bataryanın kapasitesinin 1 katını (1C) geçmemek, örneğin 5000mAh batarya için 5A''i aşmamak gerekir. Şarjı her zaman yanıcı olmayan bir yüzeyde ve gözetim altında yap, ısınma devam ederse bataryanın kendisi zarar görmüş olabilir ve değiştirilmesi gerekir.', true, now() - interval '35 days 12 hours');

-- 15) Redcat Shredder — batarya konnektörü eriyor
insert into problems (id, user_id, title, brand, model, category, vehicle_type, description, status, slug, created_at) values
('01479477-2c8a-4e11-94d8-e847934f3d94', 'EKIP_UUID_BURAYA', 'Batarya konnektörü sürüş sonrası erimiş/kararmış buluyorum', 'Redcat', 'Shredder', 'batarya', 'araba', 'XT60 konnektör her sürüş sonrası biraz daha kararıyor, bir tanesi kısmen erimiş görünüyor.', 'solved', 'redcat-shredder-konnektor-eriyor-a15', now() - interval '35 days');
insert into answers (id, problem_id, user_id, body, is_accepted, created_at) values
(gen_random_uuid(), '01479477-2c8a-4e11-94d8-e847934f3d94', 'EKIP_UUID_BURAYA', 'Konnektörde erime/kararma, o noktada yüksek elektriksel direnç olduğunu ve fazla ısı üretildiğini gösterir, bu güvenlik açısından ciddiye alınmalı çünkü yangın riski taşır. Konnektörün tam oturup oturmadığını kontrol et, gevşek bağlantı bu sorunun en sık sebebidir. Kararmış/erimiş konnektörü kesinlikle yenisiyle değiştir ve motorun çektiği akıma uygun kalitede, orijinal bir konnektör kullan.', true, now() - interval '34 days 12 hours');

-- 16) Traxxas Maxx — depoda tutulan batarya şişiyor
insert into problems (id, user_id, title, brand, model, category, vehicle_type, description, status, slug, created_at) values
('b6ad6ecb-0372-4c52-9328-0c3098c03cb5', 'EKIP_UUID_BURAYA', 'Bataryayı tam dolu bırakınca depoda şişiyor', 'Traxxas', 'Maxx', 'batarya', 'araba', 'Kışın bataryaları tam dolu şekilde saklıyorum, birkaç ay sonra çıkarınca şişmiş buluyorum.', 'solved', 'traxxas-maxx-depoda-batarya-sisiyor-a16', now() - interval '34 days');
insert into answers (id, problem_id, user_id, body, is_accepted, created_at) values
(gen_random_uuid(), 'b6ad6ecb-0372-4c52-9328-0c3098c03cb5', 'EKIP_UUID_BURAYA', 'LiPo bataryalar tam dolu (4.2V/hücre) uzun süre saklandığında hücre kimyasında bozulma hızlanır ve şişme riski artar. Çoğu şarj cihazında bulunan "storage" (depolama) modu bataryayı hücre başına yaklaşık 3.8V seviyesine getirir, uzun süreli saklama için doğru olan budur. Bundan sonra bataryalarını kullanmadan önce depolama moduna alıp öyle saklamanı öneririm, oda sıcaklığında ve doğrudan güneş almayan bir yerde tutmak da önemli.', true, now() - interval '33 days 12 hours');

-- 17) Arrma Fury — direksiyon servosu titriyor (jitter)
insert into problems (id, user_id, title, brand, model, category, vehicle_type, description, status, slug, created_at) values
('3fcf3868-fe67-451a-bc17-e404bd1134f7', 'EKIP_UUID_BURAYA', 'Direksiyon servosu durduğu yerde titriyor, kendi kendine oynuyor', 'Arrma', 'Fury', 'servo', 'araba', 'Kumandayı hareket ettirmesem bile servo hafifçe titreyip duruyor, özellikle motor çalışırken daha kötü.', 'solved', 'arrma-fury-servo-titriyor-a17', now() - interval '33 days');
insert into answers (id, problem_id, user_id, body, is_accepted, created_at) values
(gen_random_uuid(), '3fcf3868-fe67-451a-bc17-e404bd1134f7', 'EKIP_UUID_BURAYA', '"Motor çalışırken daha kötü" ifaden önemli bir ipucu, bu genelde motor/ESC kablolarından servo sinyaline elektromanyetik girişim (EMI) olduğunu gösterir. Servo kablosunu motor ve ESC güç kablolarından fiziksel olarak uzak tut, mümkünse ayrı bir kablo kanalından geçir. Ferrit halka (choke) takmak da bu paraziti azaltabilir. Titreme devam ederse servo dişlilerinden biri aşınmış olabilir, servoyu değiştirmek gerekebilir.', true, now() - interval '32 days 12 hours');

-- 18) HPI WR8 — menzil kısa, birkaç metre sonra kontrol kayboluyor
insert into problems (id, user_id, title, brand, model, category, vehicle_type, description, status, slug, created_at) values
('94a8b04e-c2d3-458b-af34-6d6cfa55a892', 'EKIP_UUID_BURAYA', 'Aracı birkaç metre uzaklaştırınca kontrolü kaybediyorum', 'HPI', 'WR8', 'diger', 'araba', 'Açık alanda bile 15-20 metre sonra araç komutlara tepki vermemeye başlıyor.', 'solved', 'hpi-wr8-menzil-kisa-a18', now() - interval '32 days');
insert into answers (id, problem_id, user_id, body, is_accepted, created_at) values
(gen_random_uuid(), '94a8b04e-c2d3-458b-af34-6d6cfa55a892', 'EKIP_UUID_BURAYA', 'Bu kadar kısa bir menzil normal değil, öncelikle kumandanın pil seviyesini kontrol et, düşük pil verici gücünü belirgin şekilde azaltır. Alıcı antenini kontrol et, kısa kesilmiş veya gövde içinde bir yere sıkışmış olabilir, antenin tam uzunlukta ve mümkünse dik konumda olması gerekir. Bu ikisi normalse alıcı veya kumandanın vericisinde donanımsal bir arıza olabilir, başka bir kumanda/alıcı çiftiyle test etmek sorunun kaynağını netleştirir.', true, now() - interval '31 days 12 hours');

-- 19) Losi Mini-T — kumandayı bırakınca direksiyon ortaya dönmüyor
insert into problems (id, user_id, title, brand, model, category, vehicle_type, description, status, slug, created_at) values
('5d5778b9-ced5-4055-bec3-e583ee34dbe4', 'EKIP_UUID_BURAYA', 'Direksiyonu bırakınca tekerlekler tam ortaya gelmiyor', 'Losi', 'Mini-T', 'servo', 'araba', 'Kumandanın direksiyon kolunu bıraktığımda tekerlekler hep hafif sağa kayık kalıyor, trim ile geçici düzeltiyorum ama kalıcı olmuyor.', 'solved', 'losi-minit-direksiyon-ortaya-donmuyor-a19', now() - interval '31 days');
insert into answers (id, problem_id, user_id, body, is_accepted, created_at) values
(gen_random_uuid(), '5d5778b9-ced5-4055-bec3-e583ee34dbe4', 'EKIP_UUID_BURAYA', 'Trim ile geçici düzeltme kalıcı çözüm değil, kaynağı mekanik olabilir. Servo horn''un (kolu) servo mili üzerindeki dişlere (spline) tam ve düz oturmadığını kontrol et, servoyu merkeze getirip horn''u söküp yeniden düzgün açıyla tak. Direksiyon rotlarının (tie rod) iki taraftaki uzunluğunun eşit olduğunu da kontrol et, farklıysa eşitle. Bunlar normalse kumandanın "sub-trim" veya "servo center" ayarını (varsa) kullanarak servo merkezini elektronik olarak sıfırla.', true, now() - interval '30 days 12 hours');

-- 20) Redcat Rampage — alıcı LED'i yanıp sönüyor, araç tepki vermiyor
insert into problems (id, user_id, title, brand, model, category, vehicle_type, description, status, slug, created_at) values
('2e09e7a2-ad57-41af-a364-b5c637ca0875', 'EKIP_UUID_BURAYA', 'Alıcının LED''i yanıp sönüyor ama araç komutlara tepki vermiyor', 'Redcat', 'Rampage XT', 'diger', 'araba', 'Kumandayı ve aracı açtım ama alıcı ışığı sürekli yanıp sönüyor, sabit yanmıyor ve araç hareket etmiyor.', 'solved', 'redcat-rampage-alici-led-yanip-sonuyor-a20', now() - interval '30 days');
insert into answers (id, problem_id, user_id, body, is_accepted, created_at) values
(gen_random_uuid(), '2e09e7a2-ad57-41af-a364-b5c637ca0875', 'EKIP_UUID_BURAYA', 'Yanıp sönen LED genelde alıcının kumandaya bağlı olmadığını (bind edilmediğini) gösterir, sabit yanan LED bağlantının kurulduğunu belirtir. Kumandanın kılavuzuna bakarak bağlama (bind) işlemini sıfırdan yap, genelde alıcı üzerindeki bir düğmeye basılı tutup kumandayı bind moduna alman gerekir. İşlem sonrası LED sabit yanmıyorsa alıcı veya kumandada bir arıza olabilir.', true, now() - interval '29 days 12 hours');

-- 21) Traxxas Sledge — gaz bıraktığında araç tam durmuyor
insert into problems (id, user_id, title, brand, model, category, vehicle_type, description, status, slug, created_at) values
('b1b8a911-e7eb-4d38-8f9b-2035b1ff3cab', 'EKIP_UUID_BURAYA', 'Gaz tetiğini bıraktığımda araç tam durmuyor, hafif sürünüyor', 'Traxxas', 'Sledge', 'servo', 'araba', 'Gaz kolunu tam bıraktığımda araç durması gerekirken yavaşça ileri sürünmeye devam ediyor.', 'solved', 'traxxas-sledge-gaz-birakinca-durmuyor-a21', now() - interval '29 days');
insert into answers (id, problem_id, user_id, body, is_accepted, created_at) values
(gen_random_uuid(), 'b1b8a911-e7eb-4d38-8f9b-2035b1ff3cab', 'EKIP_UUID_BURAYA', 'Bu, ESC''nin nötr noktasının kumandanın gönderdiği nötr sinyalinden kaymış olduğu anlamına gelir. Önce kumandanın throttle trim ayarıyla nötrü manuel düzeltmeyi dene, gaz kolu tam ortadayken araç tam dursun. Trim yeterli gelmiyorsa ESC''yi yeniden kalibre et, bu ESC''ye gerçek nötr noktasını sıfırdan öğretir ve daha kalıcı bir çözümdür.', true, now() - interval '28 days 12 hours');

-- 22) Arrma Mojave — şanzımandan yüksek uğultu sesi
insert into problems (id, user_id, title, brand, model, category, vehicle_type, description, status, slug, created_at) values
('3bd86358-9452-474d-8069-b627fc140f5b', 'EKIP_UUID_BURAYA', 'Şanzımandan sürekli yüksek bir uğultu sesi geliyor', 'Arrma', 'Mojave', 'sasi', 'araba', 'Araç çalışırken dişli kutusundan normalden çok daha yüksek, sürekli bir vızıltı sesi geliyor.', 'solved', 'arrma-mojave-sanziman-uguldu-a22', now() - interval '28 days');
insert into answers (id, problem_id, user_id, body, is_accepted, created_at) values
(gen_random_uuid(), '3bd86358-9452-474d-8069-b627fc140f5b', 'EKIP_UUID_BURAYA', 'Yüksek uğultu genelde pinyon-ana dişli boşluğunun (mesh/backlash) yanlış ayarlanmasından gelir — dişliler çok sıkıysa ses ve ısı üretir. Motor mount''unu gevşetip bir kağıt payı bırakacak şekilde boşluğu yeniden ayarla. Şanzıman içindeki gres kurumuş veya azalmış olabilir, kapağı açıp taze gres sürmek de sesi belirgin şekilde azaltır.', true, now() - interval '27 days 12 hours');

-- 23) HPI Trophy — diferansiyel kayıyor, tekerlekler eşit dönmüyor
insert into problems (id, user_id, title, brand, model, category, vehicle_type, description, status, slug, created_at) values
('3e6c3e23-46e1-4ac8-b955-070d7c6ab32e', 'EKIP_UUID_BURAYA', 'Diferansiyel kayıyor, düz yolda bile bir teker daha az güç alıyor', 'HPI', 'Trophy', 'sasi', 'araba', 'Diferansiyel sanki içeriden kayıyor, düz zeminde bile tekerlekler eşit hızda dönmüyor.', 'solved', 'hpi-trophy-difransiyel-kayiyor-a23', now() - interval '27 days');
insert into answers (id, problem_id, user_id, body, is_accepted, created_at) values
(gen_random_uuid(), '3e6c3e23-46e1-4ac8-b955-070d7c6ab32e', 'EKIP_UUID_BURAYA', 'Diferansiyel içindeki gresin sertleşmesi veya diff bilyelerinin/disklerinin aşınması bu kaymaya sebep olur. Diff''i sökup temizle, eski sertleşmiş gresi tamamen çıkar ve taze diff gresi ile doldur. Bilyeler veya diskler gözle aşınmış görünüyorsa bunları değiştirmen gerekir, aksi halde kayma devam eder.', true, now() - interval '26 days 12 hours');

-- 24) Team Associated RC10B6 — ana dişli dişleri kırılıyor
insert into problems (id, user_id, title, brand, model, category, vehicle_type, description, status, slug, created_at) values
('e89c5bb9-7767-4267-8b6e-a07854d90a09', 'EKIP_UUID_BURAYA', 'Ana dişli (spur gear) dişleri sürekli kırılıyor', 'Team Associated', 'RC10B6', 'sasi', 'araba', 'İkinci kez ana dişli değiştiriyorum, dişler kısa aralıklarla kırılıyor.', 'solved', 'associated-rc10b6-spur-gear-kiriliyor-a24', now() - interval '26 days');
insert into answers (id, problem_id, user_id, body, is_accepted, created_at) values
(gen_random_uuid(), 'e89c5bb9-7767-4267-8b6e-a07854d90a09', 'EKIP_UUID_BURAYA', 'Dişlerin sürekli kırılması genelde pinyon-spur dişli aralığının (mesh) çok sıkı ayarlanmasından kaynaklanır, dişliler birbirine fazla bastırıp aşırı yük biner. Motor mount''unu gevşetip bir kağıt kalınlığı payı bırakacak şekilde ayarla. Ayrıca motoru daha güçlü bir versiyona yükselttiysen orijinal plastik dişli bu gücü taşımıyor olabilir, metal/çelik spur gear''a geçmek kalıcı çözüm olur.', true, now() - interval '25 days 12 hours');

-- 25) Losi Baja Rey (2. örnek) — amortisörlerden yağ sızıyor
insert into problems (id, user_id, title, brand, model, category, vehicle_type, description, status, slug, created_at) values
('58e7cc43-4c0c-4495-b4c8-b262a71b32b8', 'EKIP_UUID_BURAYA', 'Ön amortisörlerden yağ sızıyor, süspansiyon yumuşamış', 'Losi', 'Baja Rey 2.0', 'sasi', 'araba', 'Amortisör gövdelerinde yağlı lekeler oluştu, süspansiyon eskisi kadar sert değil.', 'solved', 'losi-baja-rey2-amortisor-sizdiriyor-a25', now() - interval '25 days');
insert into answers (id, problem_id, user_id, body, is_accepted, created_at) values
(gen_random_uuid(), '58e7cc43-4c0c-4495-b4c8-b262a71b32b8', 'EKIP_UUID_BURAYA', 'Yağ sızıntısı hemen hemen her zaman amortisör keçesinden (o-ring/seal) kaynaklanır, zamanla toz/kum girmesiyle aşınır. Amortisörü sök, pistonu ve şaftı temizle, aşınmış o-ring''leri yenileriyle değiştir, üreticinin önerdiği viskozitede yağı hava kabarcığı kalmadan doldurup kapat. Şaft üzerinde çizik varsa keçeyi hızlı aşındırır, şaft da değiştirilmeli.', true, now() - interval '24 days 12 hours');

-- 26) Redcat Everest (2. örnek) — süspansiyon çok sert, araç sekiyor
insert into problems (id, user_id, title, brand, model, category, vehicle_type, description, status, slug, created_at) values
('a2b3a893-2846-4960-8445-6b220842e8bd', 'EKIP_UUID_BURAYA', 'Araç engebeli zeminde çok sekiyor, süspansiyon fazla sert hissettiriyor', 'Redcat', 'Everest-10', 'sasi', 'araba', 'Taşlı zeminde araç çok sekiyor, lastikler yerle temasını kaybediyor gibi.', 'solved', 'redcat-everest10-suspansiyon-sert-a26', now() - interval '24 days');
insert into answers (id, problem_id, user_id, body, is_accepted, created_at) values
(gen_random_uuid(), 'a2b3a893-2846-4960-8445-6b220842e8bd', 'EKIP_UUID_BURAYA', 'Sekme genelde amortisör yaylarının çok sert seçilmesinden veya yay ön yükleme (preload) ayarının fazla olmasından kaynaklanır. Daha yumuşak bir yay setine geçmeyi veya mevcut preload''u azaltmayı dene. Amortisör yağı da çok kalın (yüksek viskoziteli) olabilir, bir kademe daha ince yağ deneyerek süspansiyonun zemine daha iyi uyum sağlamasını sağlayabilirsin.', true, now() - interval '23 days 12 hours');

-- 27) Arrma Big Rock — tekerlekler dönüşte garip açı yapıyor (toe ayarı)
insert into problems (id, user_id, title, brand, model, category, vehicle_type, description, status, slug, created_at) values
('22efae4f-8393-44ab-84d3-09d301fb505a', 'EKIP_UUID_BURAYA', 'Ön tekerlekler birbirine paralel değil, garip bir açı yapıyor', 'Arrma', 'Big Rock', 'sasi', 'araba', 'Aracı önden incelediğimde tekerlekler birbirine paralel durmuyor, biri hafif içe biri dışa bakıyor.', 'solved', 'arrma-big-rock-tekerlek-paralel-degil-a27', now() - interval '23 days');
insert into answers (id, problem_id, user_id, body, is_accepted, created_at) values
(gen_random_uuid(), '22efae4f-8393-44ab-84d3-09d301fb505a', 'EKIP_UUID_BURAYA', 'Bu bir toe (paralellik) ayarı sorunu, muhtemelen bir çarpışma sonrası direksiyon rotlarından (tie rod) biri diğerinden farklı uzunlukta kalmış. İki taraftaki rot uzunluğunu ölçüp eşitle, çoğu araçta hafif toe-in (öne doğru çok az kapanma) hız kararlılığı için tercih edilir, aracının kılavuzundaki önerilen ölçüye bak.', true, now() - interval '22 days 12 hours');

-- 28) HPI Baja 5B (2. örnek) — lastikler çok çabuk aşınıyor
insert into problems (id, user_id, title, brand, model, category, vehicle_type, description, status, slug, created_at) values
('d9aef2a5-ceb4-42ef-9ae7-91e856093f1e', 'EKIP_UUID_BURAYA', 'Lastikler beklenenden çok daha hızlı aşınıyor', 'HPI', 'Baja 5B', 'lastik', 'araba', 'Birkaç sürüşte lastik sırtları düzleşmeye başlıyor, özellikle bir kenarları daha çok aşınıyor.', 'solved', 'hpi-baja5b-lastik-cabuk-asiniyor-a28', now() - interval '22 days');
insert into answers (id, problem_id, user_id, body, is_accepted, created_at) values
(gen_random_uuid(), 'd9aef2a5-ceb4-42ef-9ae7-91e856093f1e', 'EKIP_UUID_BURAYA', 'Bir kenarın diğerinden fazla aşınması genelde kamber (camber) ayarının hatalı olduğuna işaret eder, tekerlek dik durması gerekirken hafif açılı kalmış olabilir. Kamber ayarını kontrol edip üreticinin önerdiği açıya getir. Ayrıca sürdüğün zemine (asfalt/toprak/off-road) uygun lastik bileşiği kullanmıyor olabilirsin, yanlış compound normalden çok daha hızlı aşınır.', true, now() - interval '21 days 12 hours');

-- 29) Traxxas Bandit (2. örnek) — direksiyon servo horn'u kırıldı
insert into problems (id, user_id, title, brand, model, category, vehicle_type, description, status, slug, created_at) values
('fcf64dd3-23cf-4429-a25a-d283c0d68b65', 'EKIP_UUID_BURAYA', 'Küçük bir çarpma sonrası direksiyon servo kolu kırıldı', 'Traxxas', 'Bandit VXL', 'servo', 'araba', 'Duvara hafif çarptım, sonrasında direksiyon tepki vermedi, kontrol ettiğimde servo horn plastik kolun kırıldığını gördüm.', 'solved', 'traxxas-bandit-servo-horn-kirildi-a29', now() - interval '21 days');
insert into answers (id, problem_id, user_id, body, is_accepted, created_at) values
(gen_random_uuid(), 'fcf64dd3-23cf-4429-a25a-d283c0d68b65', 'EKIP_UUID_BURAYA', 'Servo horn (kolu) genelde bilinçli olarak zayıf tasarlanır, çünkü darbe anında servo dişlilerinin kırılması yerine bu ucuz plastik parçanın kırılması istenir — yani "koruyucu sigorta" gibi çalışır. Kırılan horn''u yenisiyle değiştirmen yeterli, servo kendisi genelde sağlam kalır. Sık kırılıyorsa plastik yerine metal servo horn kullanmak dayanıklılığı artırır ama bu durumda darbe yükü doğrudan servo dişlilerine gidebilir, dengeyi düşünerek seçim yap.', true, now() - interval '20 days 12 hours');

-- 30) Arrma Notorious (2. örnek) — araç viraja girince deviliyor
insert into problems (id, user_id, title, brand, model, category, vehicle_type, description, status, slug, created_at) values
('ca435d20-c800-49a8-b1d8-23ec6872c538', 'EKIP_UUID_BURAYA', 'Sert virajlarda araç yan yatıp deviliyor', 'Arrma', 'Notorious 6S', 'sasi', 'araba', 'Yüksek hızda sert bir viraja girdiğimde araç yan yatıp devriliyor, özellikle sağa dönüşlerde daha kötü.', 'solved', 'arrma-notorious-viraja-girince-deviliyor-a30', now() - interval '20 days');
insert into answers (id, problem_id, user_id, body, is_accepted, created_at) values
(gen_random_uuid(), 'ca435d20-c800-49a8-b1d8-23ec6872c538', 'EKIP_UUID_BURAYA', 'Yüksek ağırlık merkezi ve dengesiz süspansiyon bu tür devrilmelerin en sık sebebidir. Bataryanın şase üzerinde mümkün olan en alçak ve ortalanmış konumda olduğundan emin ol, ağırlık merkezini düşürür. Ön süspansiyonu biraz daha sert (yüksek numaralı yay/yağ) ayarlamak da viraj girişinde yan yatmayı azaltabilir. Bir tarafa daha çok deviliyorsa da o taraftaki süspansiyon/lastik farklı ayarlanmış olabilir, iki tarafı simetrik kontrol et.', true, now() - interval '19 days 12 hours');

-- 31) WLtoys 144001 — plastik dişliler kırılıyor
insert into problems (id, user_id, title, brand, model, category, vehicle_type, description, status, slug, created_at) values
('49a3299c-160e-49d3-8f7b-cffa16d17ae3', 'EKIP_UUID_BURAYA', 'Diferansiyel/dişli kutusu plastik dişlileri sık sık kırılıyor', 'WLtoys', '144001', 'sasi', 'araba', 'Üçüncü kez plastik dişli değiştiriyorum, agresif sürmesem de dişliler kırılıyor.', 'solved', 'wltoys-144001-plastik-disli-kiriliyor-a31', now() - interval '19 days');
insert into answers (id, problem_id, user_id, body, is_accepted, created_at) values
(gen_random_uuid(), '49a3299c-160e-49d3-8f7b-cffa16d17ae3', 'EKIP_UUID_BURAYA', 'Bütçe RC araçlarda plastik dişli genelde en zayıf halkadır, özellikle motoru daha güçlü bir sürüme yükselttiysen dişliler bu gücü taşımaya tasarlanmamıştır. En kalıcı çözüm metal/çelik dişli setine yükseltmek, bu modeller için uygun fiyatlı metal upgrade setleri satılıyor. Ani ve tam gaz kalkışlardan kaçınıp kademeli gaz vermek de dişli ömrünü uzatır.', true, now() - interval '18 days 12 hours');

-- 32) HSP 94188 (2. örnek) — anten kablosu koptu
insert into problems (id, user_id, title, brand, model, category, vehicle_type, description, status, slug, created_at) values
('81411d3c-9987-4a35-97ac-ad65e7dd72d7', 'EKIP_UUID_BURAYA', 'Alıcının anten teli tam dibinden koptu, menzil çok kısaldı', 'HSP', '94188', 'diger', 'araba', 'Küçük bir kazada alıcı anteni kırıldı, araç hâlâ çalışıyor ama menzili çok kısa.', 'solved', 'hsp-94188-anten-koptu-a32', now() - interval '18 days');
insert into answers (id, problem_id, user_id, body, is_accepted, created_at) values
(gen_random_uuid(), '81411d3c-9987-4a35-97ac-ad65e7dd72d7', 'EKIP_UUID_BURAYA', 'Anten menzil için kritik, kopmasıyla sinyalin kısıtlı gelmesi normal ama bu şekilde kullanmaya devam etmek riskli, menzil dışına çıkınca kontrolü tamamen kaybedebilirsin. Aynı uzunlukta ince bir kabloyu antenin köküne lehimlemek mümkün ama hassas bir iş, lehim tekniğin yoksa alıcıyı değiştirmek daha güvenli ve genelde ucuz bir çözümdür.', true, now() - interval '17 days 12 hours');

-- 33) Tamiya TT-02 — vidalar sürekli gevşiyor
insert into problems (id, user_id, title, brand, model, category, vehicle_type, description, status, slug, created_at) values
('d0669604-0b0f-4cde-bdfb-c516bcfcf14a', 'EKIP_UUID_BURAYA', 'Vidalar sürekli gevşiyor, titreşimden çözülüyor', 'Tamiya', 'TT-02', 'diger', 'araba', 'Her sürüş sonrası birkaç vida gevşemiş oluyor, sürekli sıkmak zorunda kalıyorum.', 'solved', 'tamiya-tt02-vidalar-gevsiyor-a33', now() - interval '17 days');
insert into answers (id, problem_id, user_id, body, is_accepted, created_at) values
(gen_random_uuid(), 'd0669604-0b0f-4cde-bdfb-c516bcfcf14a', 'EKIP_UUID_BURAYA', 'RC araçlarda titreşim yüksek olduğu için vida gevşemesi çok yaygın bir durumdur. Titreşim önleyici vida sabitleyici (thread lock / mavi loctite) kullanmak kalıcı çözüm sağlar, kırmızı (kalıcı) tipi değil mavi (çıkarılabilir) tipi kullan çünkü ileride vidayı tekrar sökebilmen gerekebilir. Kritik noktaları (süspansiyon, direksiyon linkajları) düzenli kontrol etmek de iyi bir alışkanlıktır.', true, now() - interval '16 days 12 hours');

-- 34) Axial SCX10 — şase parçaları çatlıyor
insert into problems (id, user_id, title, brand, model, category, vehicle_type, description, status, slug, created_at) values
('8d32f429-518a-4b5d-99b0-01390996d8a7', 'EKIP_UUID_BURAYA', 'Plastik şase parçaları soğuk havada çatlıyor', 'Axial', 'SCX10', 'sasi', 'araba', 'Kış aylarında sürerken şase parçalarında çatlaklar oluşuyor, yazın böyle bir sorun yoktu.', 'solved', 'axial-scx10-sase-catlıyor-a34', now() - interval '16 days');
insert into answers (id, problem_id, user_id, body, is_accepted, created_at) values
(gen_random_uuid(), '8d32f429-518a-4b5d-99b0-01390996d8a7', 'EKIP_UUID_BURAYA', 'Düşük sıcaklıkta plastik daha kırılgan hale gelir, bu yüzden kışın çarpmalar yaza göre çok daha kolay çatlak/kırığa yol açar. Soğuk havada aracı hemen sert kullanmadan önce birkaç dakika ısınmasını beklemek (motor sıcaklığı plastik değil ama ortam alışkanlığı için) ve sert çarpışmalardan kaçınmak yardımcı olur. Sürekli çatlayan parçaları karbon fiber takviyeli veya daha esnek nylon bazlı yedek parçalarla değiştirmeyi düşünebilirsin.', true, now() - interval '15 days 12 hours');

-- 35) Vaterra Ascender — rulmanlardan cızırtı sesi
insert into problems (id, user_id, title, brand, model, category, vehicle_type, description, status, slug, created_at) values
('2cfdbb63-dc18-405b-be07-d17a98694950', 'EKIP_UUID_BURAYA', 'Tekerlek rulmanlarından cızırtı sesi geliyor', 'Vaterra', 'Ascender', 'sasi', 'araba', 'Araç sürüklenirken tekerlek bölgesinden ince bir cızırtı sesi geliyor, özellikle su/çamura girdikten sonra başladı.', 'solved', 'vaterra-ascender-rulman-cizirti-a35', now() - interval '15 days');
insert into answers (id, problem_id, user_id, body, is_accepted, created_at) values
(gen_random_uuid(), '2cfdbb63-dc18-405b-be07-d17a98694950', 'EKIP_UUID_BURAYA', 'Su/çamur sonrası başlaması net bir ipucu — rulmana su veya toz girmiş, bu yağlamayı bozup cızırtı yapıyor. Rulmanı çıkarıp temizleyip yeniden yağla, contasız (açık) rulmanlarda bu daha sık yaşanır. Sık su/çamurlu arazide kullanıyorsan contalı (sealed) rulmanlara geçmek bu sorunu büyük ölçüde azaltır.', true, now() - interval '14 days 12 hours');

-- 36) ECX Ruckus — şaftlardan tık tık sesi
insert into problems (id, user_id, title, brand, model, category, vehicle_type, description, status, slug, created_at) values
('eb9e4e5a-dbc7-43ad-95de-76f854e568bd', 'EKIP_UUID_BURAYA', 'Aks/şaftlardan (drive shaft) tık tık sesi geliyor', 'ECX', 'Ruckus', 'sasi', 'araba', 'Araç dönerken veya hızlanırken şaft bölgesinden tık tık sesi geliyor.', 'solved', 'ecx-ruckus-saft-tik-tik-a36', now() - interval '14 days');
insert into answers (id, problem_id, user_id, body, is_accepted, created_at) values
(gen_random_uuid(), 'eb9e4e5a-dbc7-43ad-95de-76f854e568bd', 'EKIP_UUID_BURAYA', 'Bu ses genelde şaft eklemlerinin (CVD/driveshaft joint) aşınmasından veya yağsız kalmasından kaynaklanır. Şaftları çıkarıp eklem noktalarına gres sür, aşınma ilerlemişse (eklemde oynaklık hissediliyorsa) şaftı komple değiştirmek gerekir. Düzenli yağlama bu parçaların ömrünü belirgin şekilde uzatır.', true, now() - interval '13 days 12 hours');

-- 37) DHK Zombie — araç düz gitmiyor, sürekli bir tarafa çekiyor
insert into problems (id, user_id, title, brand, model, category, vehicle_type, description, status, slug, created_at) values
('79e82f2c-4c16-467d-8a7f-19922dbc5877', 'EKIP_UUID_BURAYA', 'Direksiyonu bırakınca araç düz gitmiyor, hep bir tarafa çekiyor', 'DHK', 'Zombie 8E', 'sasi', 'araba', 'Direksiyon tam ortadayken bile araç sağa doğru kayıyor, trim de yeterli düzeltmiyor.', 'solved', 'dhk-zombie-bir-tarafa-cekiyor-a37', now() - interval '13 days');
insert into answers (id, problem_id, user_id, body, is_accepted, created_at) values
(gen_random_uuid(), '79e82f2c-4c16-467d-8a7f-19922dbc5877', 'EKIP_UUID_BURAYA', 'Trim yetersiz kalıyorsa sorun mekanik demektir. Şasenin çarpışma sonucu eğrilip eğrilmediğini düz bir yüzeyde kontrol et. Ayrıca bir tekerlek diğerinden farklı çapta veya farklı aşınmışsa (özellikle arka tekerlekler) bu da düz gitmemeye sebep olur, iki taraftaki tekerlek çaplarını karşılaştır. Toe ayarının iki tarafta eşit olduğunu da kontrol etmelisin.', true, now() - interval '12 days 12 hours');

-- 38) Absima Sand Buggy — vites kutusu ısınıyor, dişliler kararıyor
insert into problems (id, user_id, title, brand, model, category, vehicle_type, description, status, slug, created_at) values
('75227fb8-6175-4283-bf7a-f5b444ef6794', 'EKIP_UUID_BURAYA', 'Vites kutusu aşırı ısınıyor, dişliler kararmış görünüyor', 'Absima', 'Sand Buggy', 'sasi', 'araba', 'Uzun sürüşlerden sonra vites kutusuna dokununca çok sıcak oluyor, açtığımda dişlilerin renginin koyulaştığını fark ettim.', 'solved', 'absima-sand-buggy-vites-kutusu-isiniyor-a38', now() - interval '12 days');
insert into answers (id, problem_id, user_id, body, is_accepted, created_at) values
(gen_random_uuid(), '75227fb8-6175-4283-bf7a-f5b444ef6794', 'EKIP_UUID_BURAYA', 'Dişlilerin renk değiştirmesi yetersiz yağlamadan kaynaklanan aşırı ısınmanın klasik belirtisidir. Kapağı açıp eski/kurumuş gresi tamamen temizle ve yüksek performanslı dişli gresi ile yeniden yağla. Uzun sürüşlerde arada kısa molalar vererek soğumasına izin vermek de dişli ömrünü korur, düzenli bir yağlama takvimi (her birkaç sürüşte bir kontrol) oluşturmanı öneririm.', true, now() - interval '11 days 12 hours');

-- 39) Himoto Bowie — tekerlekler dengesiz, titreşim var
insert into problems (id, user_id, title, brand, model, category, vehicle_type, description, status, slug, created_at) values
('f92c341c-4bc3-4a90-8513-e72d232dba04', 'EKIP_UUID_BURAYA', 'Yüksek hızda araçtan tuhaf bir titreşim geliyor', 'Himoto', 'Bowie', 'lastik', 'araba', 'Belirli bir hızın üzerinde araç şiddetli titremeye başlıyor, düşük hızda sorun yok.', 'solved', 'himoto-bowie-yuksek-hiz-titreme-a39', now() - interval '11 days');
insert into answers (id, problem_id, user_id, body, is_accepted, created_at) values
(gen_random_uuid(), 'f92c341c-4bc3-4a90-8513-e72d232dba04', 'EKIP_UUID_BURAYA', 'Yüksek hız titremesi genelde tekerlek/lastik dengesizliğinden kaynaklanır, normal hızlarda fark edilmeyen küçük bir dengesizlik RPM arttıkça şiddetlenir. Her tekerleği elle serbestçe döndürüp ağır tarafı bulmaya çalış, lastik yapıştırmasının simetrik olduğunu kontrol et. Aks ve rulmanlarda eğrilik olmadığından ve tüm şase/gövde vidalarının sıkı olduğundan da emin ol, gevşek bir parça yüksek hızda titreşimi büyütür.', true, now() - interval '10 days 12 hours');

-- 40) Carson Attack — lastik janttan çıkıyor
insert into problems (id, user_id, title, brand, model, category, vehicle_type, description, status, slug, created_at) values
('0d9debe5-23ab-481d-88f9-88a69fb8d2b6', 'EKIP_UUID_BURAYA', 'Sert dönüşlerde lastik janttan tamamen ayrılıp çıkıyor', 'Carson', 'Attack', 'lastik', 'araba', 'Lastikleri sadece geçirmiştim, yapıştırmamıştım, sert virajlarda janttan çıkıyor.', 'solved', 'carson-attack-lastik-janttan-cikiyor-a40', now() - interval '10 days');
insert into answers (id, problem_id, user_id, body, is_accepted, created_at) values
(gen_random_uuid(), '0d9debe5-23ab-481d-88f9-88a69fb8d2b6', 'EKIP_UUID_BURAYA', 'Yapıştırılmamış lastik yandal kuvvetler altında (viraj, çarpma) jant üzerinde kayıp çıkabilir, bu beklenen bir sonuç. Jant kenarını ve lastik iç kısmını temizleyip RC''ye özel lastik yapıştırıcısı (CA bazlı, hızlı kuruyan) ile ince ve eşit şekilde yapıştır, birkaç saat kürlenmesini bekle. Bu adımdan sonra sorun neredeyse tamamen ortadan kalkar.', true, now() - interval '9 days 12 hours');

-- 41) FTX Outlaw — ESC sık sık ısınıp kapanıyor
insert into problems (id, user_id, title, brand, model, category, vehicle_type, description, status, slug, created_at) values
('9fe6ad83-b860-41df-800a-b6a39a397453', 'EKIP_UUID_BURAYA', 'ESC bir süre sonra kendini kapatıyor, soğuyunca tekrar çalışıyor', 'FTX', 'Outlaw', 'esc', 'araba', 'Sürekli sürüşte ESC 5-6 dakika sonra kapanıyor, bekleyip soğuyunca tekrar açılıyor.', 'solved', 'ftx-outlaw-esc-isinip-kapaniyor-a41', now() - interval '9 days');
insert into answers (id, problem_id, user_id, body, is_accepted, created_at) values
(gen_random_uuid(), '9fe6ad83-b860-41df-800a-b6a39a397453', 'EKIP_UUID_BURAYA', 'Bu davranış termal koruma devresinin tetiklenmesi, ESC belirli bir sıcaklığa ulaşınca kendini koruyup kapanıyor, soğuyunca çalışması bunu doğruluyor. Motor/ESC kombinasyonu birbirine göre yetersiz olabilir, ya da ESC''nin fanı varsa çalışmıyor olabilir, fan bağlantısını kontrol et. ESC''yi daha açık havalandırmalı bir konuma taşımak veya ekstra bir ısı emici (heatsink)/fan eklemek kalıcı çözüm sağlar.', true, now() - interval '8 days 12 hours');

-- 42) WLtoys 12428 (2. örnek) — pinyon dişlisi aşırı ısınıyor
insert into problems (id, user_id, title, brand, model, category, vehicle_type, description, status, slug, created_at) values
('b12c5b83-608f-4ed2-9670-8f508b8d1bb4', 'EKIP_UUID_BURAYA', 'Pinyon dişlisi birkaç dakikada dokunulmayacak kadar ısınıyor', 'WLtoys', '12428', 'motor', 'araba', 'Motor gövdesi serin kalıyor ama pinyon/spur bölgesi çok ısınıyor.', 'solved', 'wltoys-12428-pinyon-isiniyor-a42', now() - interval '8 days');
insert into answers (id, problem_id, user_id, body, is_accepted, created_at) values
(gen_random_uuid(), 'b12c5b83-608f-4ed2-9670-8f508b8d1bb4', 'EKIP_UUID_BURAYA', 'Isının motordan çok dişli bölgesinde toplanması mekanik sürtünmeye işaret eder. Pinyon-spur dişli boşluğunu kontrol et, çok sıkı takılmışsa dişliler birbirine bastırıp sürekli sürtünme ısısı üretir. Motor mount''unu gevşetip bir kağıt payı bırakacak şekilde yeniden ayarla, set vidasının da mil üzerinde tam sıkı olduğundan emin ol.', true, now() - interval '7 days 12 hours');

-- 43) Traxxas TRX-4 (2. örnek) — dik tırmanışta güç kesiliyor
insert into problems (id, user_id, title, brand, model, category, vehicle_type, description, status, slug, created_at) values
('3f075efd-d0d7-4c32-9e5a-811b2ab3651a', 'EKIP_UUID_BURAYA', 'Dik yokuş tırmanırken tam ortasında güç aniden kesiliyor', 'Traxxas', 'TRX-4', 'esc', 'araba', 'Dik ve kayalık bir yokuşu tırmanırken tam yarısında motor aniden duruyor, düz zeminde sorun yok.', 'solved', 'traxxas-trx4-tirmanista-guc-kesiliyor-a43', now() - interval '7 days');
insert into answers (id, problem_id, user_id, body, is_accepted, created_at) values
(gen_random_uuid(), '3f075efd-d0d7-4c32-9e5a-811b2ab3651a', 'EKIP_UUID_BURAYA', 'Dik tırmanışta motor ani yük altında çok yüksek akım çeker, bu genelde ESC''nin aşırı akım/termal koruması tetiklenmesiyle sonuçlanır, bu bir arıza değil bilinçli bir güvenlik özelliğidir. Daha düşük dişli oranı (gear ratio) kullanarak motora binen yükü azalt, tırmanışı ani tam gaz yerine kademeli gaz vererek dene. Motor/ESC soğutması yeterliyse ve ESC''nin ayarlanabilir termal eşiği varsa bunu biraz yükseltebilirsin ama motoru yakmamaya dikkat et.', true, now() - interval '6 days 12 hours');

-- 44) Kyosho Inferno (2. örnek, nitro) — motor soğukken çalışmıyor
insert into problems (id, user_id, title, brand, model, category, vehicle_type, description, status, slug, created_at) values
('78e3d5b9-d9cc-4e2a-ae3d-e9ac2bc26c15', 'EKIP_UUID_BURAYA', 'Nitro motor soğukken hiç çalışmıyor, defalarca çekmem gerekiyor', 'Kyosho', 'Inferno MP10', 'motor', 'araba', 'Soğuk havada ilk çalıştırmada 10-15 çekiş gerekiyor, motor zor tutuyor.', 'solved', 'kyosho-inferno-mp10-nitro-calismiyor-a44', now() - interval '6 days');
insert into answers (id, problem_id, user_id, body, is_accepted, created_at) values
(gen_random_uuid(), '78e3d5b9-d9cc-4e2a-ae3d-e9ac2bc26c15', 'EKIP_UUID_BURAYA', 'Nitro motorlarda soğuk çalıştırma zorluğu genelde karbüratör ayarıyla ilgilidir. Karışım vidalarını üreticinin önerdiği başlangıç ayarına getir, glow plug (kızdırma bujisi) zayıflamış olabilir, çıkarıp parlak kızarıyor mu kontrol et. Yakıttaki nitro/yağ oranı ve tazeliğini de kontrol et, hava filtresi tıkalıysa temizle, bunlar birlikte soğuk çalıştırmayı belirgin şekilde iyileştirir.', true, now() - interval '5 days 12 hours');

-- 45) Redcat Blackout (2. örnek) — 4WD çekiş asimetrik
insert into problems (id, user_id, title, brand, model, category, vehicle_type, description, status, slug, created_at) values
('52a38c27-ed37-4f17-8398-3e11e3c8d871', 'EKIP_UUID_BURAYA', 'Bir teker diğerlerinden daha az güç alıyor, araç düz gitmiyor', 'Redcat', 'Blackout XTE', 'sasi', 'araba', '4WD olmasına rağmen sağ ön teker diğer üçüne göre zayıf dönüyor, engebeli zeminde araç sağa çekiyor.', 'solved', 'redcat-blackout-cekis-asimetrik-a45', now() - interval '5 days');
insert into answers (id, problem_id, user_id, body, is_accepted, created_at) values
(gen_random_uuid(), '52a38c27-ed37-4f17-8398-3e11e3c8d871', 'EKIP_UUID_BURAYA', 'Bir tekerleğin zayıf kalması güç iletim zincirinde bir noktada tıkanma anlamına gelir. O tekerleğe giden CV mili tam oturmamış veya eğri olabilir, diferansiyel içindeki dişlilerden biri o tarafta aşınmış olabilir, ya da jant göbeği ile aks bağlantısı gevşemiş olabilir. Aracı kaldırıp her tekerleği tek tek elle çevirerek dirençleri karşılaştırmak, anormal noktayı doğrudan gösterir.', true, now() - interval '4 days 12 hours');

-- 46) Arrma Infraction (2. örnek) — drift lastikleri camsı hale geliyor
insert into problems (id, user_id, title, brand, model, category, vehicle_type, description, status, slug, created_at) values
('6151b531-df58-473f-ac78-c0f891c35fff', 'EKIP_UUID_BURAYA', 'Drift lastikleri birkaç koşuda camsı bir yüzeye dönüşüyor', 'Arrma', 'Infraction 6S', 'lastik', 'araba', 'Drift lastikleri birkaç koşu sonra yüzeyleri parlak ve normalden daha kaygan hale geliyor.', 'solved', 'arrma-infraction-lastik-camsi-a46', now() - interval '4 days');
insert into answers (id, problem_id, user_id, body, is_accepted, created_at) values
(gen_random_uuid(), '6151b531-df58-473f-ac78-c0f891c35fff', 'EKIP_UUID_BURAYA', 'Drift lastiklerinde bu aslında beklenen bir durum, lastik yüzeyi kayma sırasında ısı ve sürtünmeyle camlaşır ("glazing"), bu da drift''in karakteristik kontrollü kaymasını sağlar, normal grip lastiği gibi tutunmaları beklenmemeli. Aşırı kaygan bulduysan silikon sprey uygulamak veya daha az sert bir bileşim denemek kaymayı daha kontrol edilebilir hale getirebilir. Asıl istediğin normal tutunma ise drift lastiği yerine on-road/touring lastiği kullanman gerekiyor.', true, now() - interval '3 days 12 hours');

-- 47) HPI Sprint 2 (2. örnek) — direksiyon merkezlenmiyor
insert into problems (id, user_id, title, brand, model, category, vehicle_type, description, status, slug, created_at) values
('66c202e3-1a6e-4fc9-97fa-02aa537ad484', 'EKIP_UUID_BURAYA', 'Kumandayı bırakınca direksiyon tam ortaya dönmüyor', 'HPI', 'Sprint 2', 'servo', 'araba', 'Direksiyonu bıraktığımda tekerlekler tam düz gelmiyor, trim de kalıcı çözmüyor.', 'solved', 'hpi-sprint2-direksiyon-merkezlenmiyor-a47', now() - interval '3 days');
insert into answers (id, problem_id, user_id, body, is_accepted, created_at) values
(gen_random_uuid(), '66c202e3-1a6e-4fc9-97fa-02aa537ad484', 'EKIP_UUID_BURAYA', 'Trim bunu maskeleyebilir ama kalıcı çözüm değildir, asıl sorun genelde mekaniktir: servo horn''un spline dişlerine tam oturmadığını kontrol et, servoyu merkeze getirip horn''u düzgün açıyla yeniden tak. İki taraftaki direksiyon rotlarının eşit uzunlukta olduğunu da kontrol et. Bunlar normalse kumandanın servo merkezi (sub-trim) ayarını kullanarak elektronik olarak sıfırla.', true, now() - interval '2 days 12 hours');

-- 48) Losi DBXL (2. örnek) — ön süspansiyon çökmüş
insert into problems (id, user_id, title, brand, model, category, vehicle_type, description, status, slug, created_at) values
('62c86cc7-d845-4bac-a5a2-78a892943ad4', 'EKIP_UUID_BURAYA', 'Ön süspansiyon zamanla çökmüş, araç öne eğik duruyor', 'Losi', 'DBXL-E', 'sasi', 'araba', 'Araç dururken bile ön kısım arkaya göre daha aşağıda, sık atlıyorum ve iniyorum.', 'solved', 'losi-dbxl-e-on-suspansiyon-cokmus-a48', now() - interval '2 days');
insert into answers (id, problem_id, user_id, body, is_accepted, created_at) values
(gen_random_uuid(), '62c86cc7-d845-4bac-a5a2-78a892943ad4', 'EKIP_UUID_BURAYA', 'Sık atlama/iniş yapan kullanımda bu genelde amortisör yayının esnekliğini kaybetmesinden veya amortisör yağının incelmesinden kaynaklanır. Yayları söküp gözle karşılaştır, kalıcı deforme olmuş görünüyorsa değiştir. Amortisör yağını taze, üreticinin önerdiği viskozitede yağla değiştir; sık sert iniş yapıyorsan daha sert bir yay/yağ kombinasyonuna geçmeyi düşün.', true, now() - interval '1 days 12 hours');

-- 49) Arrma Outcast (2. örnek) — batarya konnektörü aşırı ısınıyor
insert into problems (id, user_id, title, brand, model, category, vehicle_type, description, status, slug, created_at) values
('d5dcf59d-c2ec-4857-a21b-973a143261cb', 'EKIP_UUID_BURAYA', 'Batarya konnektörü sürüş sonrası elle dokunulamayacak kadar sıcak', 'Arrma', 'Outcast 8S', 'batarya', 'araba', 'Sürüş bitince batarya konnektörünü çıkarırken elimi yakacak kadar sıcak olduğunu fark ettim, batarya kendisi bu kadar sıcak değil.', 'solved', 'arrma-outcast-konnektor-isiniyor-a49', now() - interval '1 days');
insert into answers (id, problem_id, user_id, body, is_accepted, created_at) values
(gen_random_uuid(), 'd5dcf59d-c2ec-4857-a21b-973a143261cb', 'EKIP_UUID_BURAYA', 'Bataryanın kendisi sıcak değilken konnektörün aşırı ısınması, o noktada yüksek elektriksel direnç olduğunu gösterir, bu ciddiye alınmalı çünkü yangın riski taşır. Konnektör pinlerinin kararıp kararmadığını ve lehim noktalarının sağlam olup olmadığını kontrol et. Konnektörün amper kapasitesinin yeterli ve kaliteli/orijinal olduğundan emin ol, sahte/düşük kaliteli kopyalar bu sorunu sık çıkarır.', true, now() - interval '20 hours');

-- 50) Redcat Camo X4 (2. örnek) — throttle trim merkezde tutmuyor
insert into problems (id, user_id, title, brand, model, category, vehicle_type, description, status, slug, created_at) values
('fd5d740a-0000-4efd-ac55-86b363276b70', 'EKIP_UUID_BURAYA', 'Gaz kolunu bırakınca araç tam nötre gelmiyor, hafif sürünüyor', 'Redcat', 'Camo X4', 'servo', 'araba', 'Gaz kolunu bıraktığımda araç durması gerekirken hafifçe ileri sürünmeye devam ediyor.', 'solved', 'redcat-camox4-throttle-merkezde-degil-a50', now() - interval '10 hours');
insert into answers (id, problem_id, user_id, body, is_accepted, created_at) values
(gen_random_uuid(), 'fd5d740a-0000-4efd-ac55-86b363276b70', 'EKIP_UUID_BURAYA', 'Bu, kumandanın gaz kolu nötr sinyalinin ESC''nin beklediği nötr noktasından kaymış olduğu anlamına gelir. Önce kumandanın throttle trim düğmesiyle nötr noktasını manuel ayarlamayı dene, gaz kolu tam ortadayken araç tam dursun. Trim yeterli gelmiyorsa ESC''yi yeniden kalibre et, açma düğmesine basılı tutup gaz kolunu sırasıyla tam ileri-tam geri-nötre getirerek yapılan bu işlem ESC''ye gerçek nötr konumunu yeniden öğretir.', true, now() - interval '9 hours');
