export type Category = "antique" | "contemporary";

export interface Carpet {
  id: string;
  name: string;
  tag: string;
  meta: string;
  price: string;
  cat: Category;
  ph: string;
  desc: string;
  prov: string;
  sold?: boolean;
}

export interface Spec {
  k: string;
  v: string;
}

export interface Post {
  cat: string;
  ph: string;
  title: string;
  dek: string;
}

export const CATALOGUE: Carpet[] = [
  {
    id: "heriz",
    name: "Heriz, Azerbaijan",
    tag: "Antique · c. 1910",
    meta: "3.62 × 2.71 m · wool on cotton",
    price: "£18,400",
    cat: "antique",
    ph: "Heriz — geometric medallion, rust and indigo",
    desc: "A large-scale Heriz of the kind woven for European drawing rooms before the First World War. The drawing is bold and slightly irregular, which is exactly what you want: the weaver was working from memory rather than a cartoon. Terracotta field, ivory spandrels, a deep indigo medallion that has softened to slate in the light.",
    prov: "Acquired from a private estate in Perthshire, 2024. In the same family since it was bought new in Tabriz around 1912. Original selvedges intact; one small reweave in the lower border, visible from the back only.",
  },
  {
    id: "serapi",
    name: "Serapi runner",
    tag: "Antique · c. 1890",
    meta: "4.10 × 0.94 m · wool on wool",
    price: "£9,850",
    cat: "antique",
    ph: "Long runner, camel ground",
    desc: "A corridor runner with the loose, airy drawing typical of the best Serapi weaving. Camel ground, which is undyed wool rather than a dye, so it will not shift over time. Low, even pile throughout.",
    prov: "Bought at auction in Vienna, 2023. Hand-washed in Gloucestershire. No repairs.",
  },
  {
    id: "bakhshaish",
    name: "Bakhshaish",
    tag: "Antique · c. 1880",
    meta: "3.05 × 2.44 m · wool on wool",
    price: "£24,000",
    cat: "antique",
    ph: "Abrashed blue field, archaic drawing",
    desc: "The collector's carpet in the room. Bakhshaish weaving is archaic, almost abstract, and the abrash across the field — those horizontal bands of shifting blue — comes from small dye lots used one after another. Considered a fault in 1880. Considered the whole point now.",
    prov: "From the collection of a London dealer, retired 2022. Published in Hali, issue 186.",
  },
  {
    id: "oushak",
    name: "Oushak, west Anatolia",
    tag: "Antique · c. 1920",
    meta: "4.01 × 3.15 m · wool on cotton",
    price: "£16,200",
    cat: "antique",
    ph: "Soft apricot and pale blue, large scale",
    desc: "Pale, generous and easy to live with. Oushaks were woven with a long, lustrous wool that takes light differently at either end of the room. Apricot field, pale blue and celadon drawing, very little red.",
    prov: "Private purchase, Istanbul, 2023. Minor edge binding replaced.",
  },
  {
    id: "qashqai",
    name: "Qashqai kilim",
    tag: "Antique · c. 1930",
    meta: "2.58 × 1.62 m · flatweave",
    price: "£5,400",
    cat: "antique",
    ph: "Flatweave, bands of madder and green",
    sold: true,
    desc: "Tribal flatweave from the Fars province, woven by a nomadic household for its own use. Bands of madder red, aubergine and an unusual green. Light enough to hang.",
    prov: "Acquired in Shiraz, 2019. Held in stock; currently reserved.",
  },
  {
    id: "ziegler",
    name: "Ziegler Sultanabad",
    tag: "Antique · c. 1900",
    meta: "4.55 × 3.40 m · wool on cotton",
    price: "£29,500",
    cat: "antique",
    ph: "All-over vine, soft rose and sand",
    desc: "Woven for the Manchester firm Ziegler & Co, who sent European designs to Persian looms and produced the most sympathetic decorative carpets ever made. All-over vine on a sand ground, faded rose, no medallion.",
    prov: "Estate of an architect, Hampshire, 2025. Excellent condition for the size and age.",
  },
  {
    id: "ridgeline",
    name: "Ridgeline, natural",
    tag: "Contemporary · made to order",
    meta: "Any size to 6 m · Tibetan wool & silk",
    price: "from £7,200",
    cat: "contemporary",
    ph: "Modern high-low weave, oatmeal and ecru",
    desc: "A high-low weave we developed with a workshop outside Kathmandu. The pattern is nothing but a change of pile height, so it reads as texture from standing and as drawing from the floor. Undyed Tibetan wool with a 15% silk highlight.",
    prov: "Woven to order, 60 knots, 14 to 16 weeks. Fully traceable wool, GoodWeave certified workshop.",
  },
  {
    id: "meander",
    name: "Meander, madder",
    tag: "Contemporary · made to order",
    meta: "Any size to 5 m · handspun wool",
    price: "from £6,400",
    cat: "contemporary",
    ph: "Loose vine on a deep madder ground",
    desc: "Our own drawing, taken from a fragment of eighteenth-century Persian weaving in the study. Handspun, vegetable-dyed wool, so the ground carries a natural abrash from the first day rather than waiting fifty years for it.",
    prov: "Woven to order in Tabriz, 12 to 18 weeks depending on size. Dye recipes on file.",
  },
  {
    id: "plainfold",
    name: "Plainfold, charcoal",
    tag: "Contemporary · made to order",
    meta: "Any size to 6 m · handspun wool",
    price: "from £5,900",
    cat: "contemporary",
    ph: "Undyed charcoal, close texture",
    desc: "For rooms where the carpet should be the quietest thing in it. No pattern, no border: just handspun charcoal wool with enough variation in the yarn that it never reads as flat or synthetic.",
    prov: "Woven to order in Nepal, 10 to 14 weeks. Available in seven undyed shades.",
  },
];

export const SPECS: Spec[] = [
  { k: "Reference", v: "SC-0148" },
  { k: "Origin", v: "Heriz district, north-west Iran" },
  { k: "Date", v: "circa 1910" },
  { k: "Size", v: "3.62 × 2.71 m (11ft 11in × 8ft 11in)" },
  { k: "Materials", v: "Hand-spun wool pile on a cotton foundation" },
  { k: "Knot count", v: "Approx. 120,000 per m², symmetrical" },
  { k: "Condition", v: "Very good; low even pile, one reweave in lower border" },
  { k: "Pile height", v: "6 mm" },
];

export const POSTS: Post[] = [
  {
    cat: "Craft · 8 min",
    ph: "Dye pots and skeins of wool",
    title: "Why a madder red fades beautifully and a chrome red does not",
    dek: "Natural dye sits inside the fibre and lightens unevenly. Synthetic dye coats it and goes grey. Fifty years apart, the difference is the whole value of the carpet.",
  },
  {
    cat: "Living with it · 5 min",
    ph: "Carpet under a kitchen table",
    title: "Put the good carpet in the kitchen",
    dek: "An argument for use over reverence, and a short list of the weaves that genuinely do not mind a spaniel.",
  },
  {
    cat: "Buying · 6 min",
    ph: "The back of a carpet, close up",
    title: "Turn it over. Everything honest is on the back",
    dek: "Knot shape, foundation, repairs, and whether the colours you are admiring were painted on after weaving.",
  },
  {
    cat: "Origins · 10 min",
    ph: "Village landscape in north-west Iran",
    title: "The five villages that made every carpet you recognise",
    dek: "Heriz, Bakhshaish, Serapi, Gorevan and Mehriban sit within thirty miles of each other and account for most of what the trade calls Persian.",
  },
  {
    cat: "Care · 4 min",
    ph: "Hand washing a carpet",
    title: "Hoovering is fine. Shampoo is not",
    dek: "What we actually do in the wash house, and the three household products that permanently destroy a natural dye.",
  },
  {
    cat: "Commissioning · 7 min",
    ph: "Loom with a partly woven carpet",
    title: "What happens in the fourteen weeks after you order",
    dek: "Sampling, dye lots, the strung loom, and why we will not promise a date in under three months.",
  },
];

export const COLLECTION_COPY: Record<
  "all" | Category,
  { eyebrow: string; title: string; blurb: string }
> = {
  all: {
    eyebrow: "The collection",
    title: "One hundred and forty-eight carpets",
    blurb:
      "Everything we hold, photographed as it is. Prices include UK delivery, underlay and fitting. Anything can go out on a fourteen-day home trial.",
  },
  antique: {
    eyebrow: "Antique & collectable",
    title: "Woven between 1860 and 1940",
    blurb:
      "Bought in person, turned over, and described honestly — including the repairs. Where a piece has been published or exhibited, the reference is on its page.",
  },
  contemporary: {
    eyebrow: "Contemporary handmade",
    title: "New work, woven to order",
    blurb:
      "Designs we commission from six workshops in Iran and Nepal. Any size up to six metres, in the shades shown or a dye lot matched to your room.",
  },
};

export function getCarpet(id: string): Carpet | undefined {
  return CATALOGUE.find((c) => c.id === id);
}
