-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "specs" TEXT NOT NULL DEFAULT '';

-- Backfill specifications for the original catalogue (only where still empty).
UPDATE "Product" SET "specs" = 'Origin: Heriz district, north-west Iran
Date: circa 1910
Size: 3.62 × 2.71 m (11ft 11in × 8ft 11in)
Materials: Hand-spun wool pile on a cotton foundation
Knot count: Approx. 120,000 per m², symmetrical
Condition: Very good; low even pile, one reweave in lower border
Pile height: 6 mm' WHERE "slug" = 'heriz' AND "specs" = '';
UPDATE "Product" SET "specs" = 'Origin: Serab region, north-west Iran
Date: circa 1890
Size: 4.10 × 0.94 m
Materials: Wool pile on a wool foundation
Condition: Low, even pile; no repairs' WHERE "slug" = 'serapi' AND "specs" = '';
UPDATE "Product" SET "specs" = 'Origin: Bakhshaish, north-west Iran
Date: circa 1880
Size: 3.05 × 2.44 m
Materials: Wool pile on a wool foundation
Literature: Published in Hali, issue 186' WHERE "slug" = 'bakhshaish' AND "specs" = '';
UPDATE "Product" SET "specs" = 'Origin: Uşak, west Anatolia
Date: circa 1920
Size: 4.01 × 3.15 m
Materials: Wool pile on a cotton foundation
Condition: Minor edge binding replaced' WHERE "slug" = 'oushak' AND "specs" = '';
UPDATE "Product" SET "specs" = 'Origin: Fars province, south-west Iran
Date: circa 1930
Size: 2.58 × 1.62 m
Construction: Flatweave (kilim)' WHERE "slug" = 'qashqai' AND "specs" = '';
UPDATE "Product" SET "specs" = 'Origin: Sultanabad (Arak), central Iran
Date: circa 1900
Size: 4.55 × 3.40 m
Materials: Wool pile on a cotton foundation
Condition: Excellent for size and age' WHERE "slug" = 'ziegler' AND "specs" = '';
UPDATE "Product" SET "specs" = 'Made in: Kathmandu valley, Nepal
Sizes: Made to order, up to 6 m
Materials: Undyed Tibetan wool with 15% silk
Knots: 60 per square inch
Lead time: 14–16 weeks
Certification: GoodWeave' WHERE "slug" = 'ridgeline' AND "specs" = '';
UPDATE "Product" SET "specs" = 'Made in: Tabriz, Iran
Sizes: Made to order, up to 5 m
Materials: Handspun, vegetable-dyed wool
Lead time: 12–18 weeks' WHERE "slug" = 'meander' AND "specs" = '';
UPDATE "Product" SET "specs" = 'Made in: Nepal
Sizes: Made to order, up to 6 m
Materials: Handspun undyed wool (seven shades)
Lead time: 10–14 weeks' WHERE "slug" = 'plainfold' AND "specs" = '';
