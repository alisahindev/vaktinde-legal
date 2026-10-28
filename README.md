# vaktinde-legal

Vaktinde 2 için Türkçe/İngilizce tanıtım ve yasal sayfalar. Statik HTML/CSS; bağımlılık, build adımı veya çalıştırılabilir JavaScript yok. GitHub Pages, `main` kökünden `https://alisahindev.github.io/vaktinde-legal/` adresine yayınlar; `v2-legal` değişiklikleri merge edilene kadar yayında değildir.

`tr/` ve `en/` tanıtım sayfalarıdır. Kök sayfa yasal belgeleri ve dil bağlantılarını korur. Gizlilik ve koşulların içerik/tarih kaynağı, kardeş `vaktinde` reposundaki `src/features/legal/documents.ts` dosyasıdır. `delete-account*.html`, v1 hesapları için e-postayla silme talebini açıklar; v2 hesap kullanmaz.

Yerel kontrol (Node.js 22.18+ ve kardeş `vaktinde` checkout’u gerekir):

```sh
node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/check.mjs
python3 -m http.server 8000 --bind 127.0.0.1
```

Tarayıcıda `http://127.0.0.1:8000/tr/` veya `/en/` açılır. Kontrol; kaynak metin/tarih eşitliğini, yerel bağlantıları, SEO alanlarını ve görsel boyut sınırını denetler. `assets/today-{tr,en}.webp`, `vaktinde/store-screenshots/public/screenshots/apple/iphone/{tr,en}/01.png` kaynaklarından 600 px genişlikte küçültülmüştür. Resmi rozet yerine metin App Store bağlantısı kullanılır; kapalı testteki Android için Play bağlantısı yoktur.

Yayın öncesinde App Store’daki sürümün v2 metin ve görselleriyle eşleştiğini doğrulayın. `sitemap.xml` iki landing’i listeler. Bu repo altındaki `robots.txt`, GitHub project Pages yolunda etkili değildir: tarayıcılar `https://alisahindev.github.io/robots.txt` dosyasını kullanır. Sitemap satırını host kökündeki mevcut kuralları koruyarak ekleyin veya yayın sonrası sitemap’i Search Console’dan gönderin. JSON-LD fiyat/puan içermez; Google rich result uygunluğu iddia edilmez. Digital Asset Links, doğrulanmış route/sertifika ve host kökü yönetimi olmadan eklenmedi.
