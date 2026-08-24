import type { GarmentShape } from "@/lib/catalog";

/*
 * Product artwork, drawn rather than photographed.
 *
 * The shop has no photography yet, and a grid of grey "image coming soon"
 * boxes would say so in the dullest way possible. So every product carries a
 * garment silhouette painted in its own colourway — flat, poster-weight,
 * cut from the same bold shapes as the logo's lettering. The moment a real
 * photo lands on a product (`image` in the catalogue), the photo wins and
 * this is never rendered for it again.
 */

type ArtProps = {
  fill: string;
  accent: string;
};

const STROKE = "rgba(10,10,10,0.55)";

function Hoodie({ fill, accent }: ArtProps) {
  return (
    <g>
      {/* Hood, bunched behind the shoulders */}
      <path
        d="M72 66 Q74 36 100 34 Q126 36 128 66 Q100 78 72 66 Z"
        fill={accent}
        stroke={STROKE}
        strokeWidth="2"
      />
      {/* Body with long sleeves down to the cuff */}
      <path
        d="M76 58 L52 72 L34 152 L60 164 L70 132 L70 214 L130 214 L130 132 L140 164 L166 152 L148 72 L124 58 Q100 78 76 58 Z"
        fill={fill}
        stroke={STROKE}
        strokeWidth="2"
      />
      {/* Cuffs */}
      <path
        d="M34 152 L60 164 L56 176 L30 164 Z"
        fill={accent}
        stroke={STROKE}
        strokeWidth="2"
      />
      <path
        d="M166 152 L140 164 L144 176 L170 164 Z"
        fill={accent}
        stroke={STROKE}
        strokeWidth="2"
      />
      {/* Neck opening and drawcords */}
      <path d="M84 62 Q100 78 116 62 Q100 72 84 62 Z" fill={STROKE} />
      <path
        d="M93 72 L91 106 M107 72 L109 106"
        stroke={accent}
        strokeLinecap="round"
        strokeWidth="4"
      />
      {/* Kangaroo pocket */}
      <path
        d="M76 156 H124 V186 Q124 190 120 190 H80 Q76 190 76 186 Z"
        fill={accent}
        opacity="0.9"
        stroke={STROKE}
        strokeWidth="2"
      />
      {/* Hem */}
      <path d="M70 202 H130" stroke={STROKE} strokeWidth="3" />
    </g>
  );
}

function Joggers({ fill, accent }: ArtProps) {
  return (
    <g>
      <path
        d="M58 44 H142 L148 96 L138 216 H108 L100 124 L92 216 H62 L52 96 Z"
        fill={fill}
        stroke={STROKE}
        strokeWidth="2"
      />
      <path d="M58 44 H142 L144 62 H56 Z" fill={accent} />
      <path
        d="M100 124 L92 216 M100 124 L108 216"
        stroke={STROKE}
        strokeWidth="2"
      />
      <circle cx="100" cy="54" fill={STROKE} r="4" />
    </g>
  );
}

function Cargos({ fill, accent }: ArtProps) {
  return (
    <g>
      <path
        d="M58 44 H142 L148 96 L138 216 H108 L100 124 L92 216 H62 L52 96 Z"
        fill={fill}
        stroke={STROKE}
        strokeWidth="2"
      />
      <path d="M58 44 H142 L144 62 H56 Z" fill={accent} />
      <rect
        fill={accent}
        height="34"
        opacity="0.9"
        rx="2"
        width="26"
        x="56"
        y="104"
      />
      <rect
        fill={accent}
        height="34"
        opacity="0.9"
        rx="2"
        width="26"
        x="118"
        y="104"
      />
      <path
        d="M64 196 H92 M108 196 H136"
        stroke={STROKE}
        strokeLinecap="round"
        strokeWidth="4"
      />
      <path
        d="M100 124 L92 216 M100 124 L108 216"
        stroke={STROKE}
        strokeWidth="2"
      />
    </g>
  );
}

function Tracksuit({ fill, accent }: ArtProps) {
  return (
    <g>
      {/* Hooded top, long sleeves, upper half of the frame */}
      <path
        d="M76 42 Q78 18 100 16 Q122 18 124 42 Q100 52 76 42 Z"
        fill={fill}
        stroke={STROKE}
        strokeWidth="2"
      />
      <path
        d="M78 36 L58 48 L44 104 L64 113 L72 90 L72 132 L128 132 L128 90 L136 113 L156 104 L142 48 L122 36 Q100 52 78 36 Z"
        fill={fill}
        stroke={STROKE}
        strokeWidth="2"
      />
      <path d="M86 40 Q100 54 114 40 Q100 48 86 40 Z" fill={STROKE} />
      <path
        d="M72 106 Q100 116 128 106"
        fill="none"
        stroke={accent}
        strokeWidth="7"
      />
      {/* Bottoms */}
      <path
        d="M70 146 H130 L134 180 L128 242 H110 L100 184 L90 242 H72 L66 180 Z"
        fill={fill}
        stroke={STROKE}
        strokeWidth="2"
      />
      <path d="M70 146 H130 L131 160 H69 Z" fill={accent} />
      <path
        d="M100 184 L90 242 M100 184 L110 242"
        stroke={STROKE}
        strokeWidth="2"
      />
    </g>
  );
}

function Puffer({ fill, accent }: ArtProps) {
  return (
    <g>
      <path
        d="M76 54 L50 68 L36 140 L62 150 L70 124 L70 210 H130 V124 L138 150 L164 140 L150 68 L124 54 Z"
        fill={fill}
        stroke={STROKE}
        strokeWidth="2"
      />
      {/* Collar */}
      <path
        d="M76 54 H124 L121 70 H79 Z"
        fill={accent}
        stroke={STROKE}
        strokeWidth="2"
      />
      {/* Baffles */}
      <path
        d="M70 92 H130 M70 116 H130 M70 140 H130 M70 164 H130 M70 188 H130"
        stroke={STROKE}
        strokeWidth="3"
      />
      {/* Centre zip */}
      <path d="M100 70 V210" stroke={STROKE} strokeWidth="3" />
      {/* Sleeve tab */}
      <path
        d="M141 118 h11 v15 h-11 z"
        fill={accent}
        stroke={STROKE}
        strokeWidth="1.5"
      />
    </g>
  );
}

function Tee({ fill, accent }: ArtProps) {
  return (
    <g>
      <path
        d="M78 56 L48 74 L36 108 L62 120 L70 100 L70 200 H130 V100 L138 120 L164 108 L152 74 L122 56 Q100 74 78 56 Z"
        fill={fill}
        stroke={STROKE}
        strokeWidth="2"
      />
      <path
        d="M78 56 Q100 74 122 56 Q100 66 78 56 Z"
        fill={accent}
        stroke={STROKE}
        strokeWidth="2"
      />
      <rect fill={accent} height="11" rx="1" width="46" x="77" y="120" />
      <path d="M70 190 H130" stroke={STROKE} strokeWidth="3" />
    </g>
  );
}

function ShortsSet({ fill, accent }: ArtProps) {
  return (
    <g>
      {/* Tee */}
      <path
        d="M78 30 L52 46 L42 76 L64 86 L72 68 L72 140 H128 V68 L136 86 L158 76 L148 46 L122 30 Q100 46 78 30 Z"
        fill={fill}
        stroke={STROKE}
        strokeWidth="2"
      />
      <path
        d="M78 30 Q100 46 122 30 Q100 40 78 30 Z"
        fill={accent}
        stroke={STROKE}
        strokeWidth="2"
      />
      {/* Shorts */}
      <path
        d="M66 154 H134 L138 180 L132 226 H108 L100 190 L92 226 H68 L62 180 Z"
        fill={fill}
        stroke={STROKE}
        strokeWidth="2"
      />
      <path d="M66 154 H134 L135 167 H65 Z" fill={accent} />
      <path
        d="M100 190 L92 226 M100 190 L108 226"
        stroke={STROKE}
        strokeWidth="2"
      />
    </g>
  );
}

function Sneaker({ fill, accent }: ArtProps) {
  return (
    <g>
      <path
        d="M24 176 L30 132 Q36 110 62 108 L96 108 L124 128 L156 138 Q178 146 182 168 L183 176 Z"
        fill={fill}
        stroke={STROKE}
        strokeWidth="2"
      />
      <path
        d="M20 176 H184 Q184 200 166 200 H38 Q20 200 20 182 Z"
        fill={accent}
        stroke={STROKE}
        strokeWidth="2"
      />
      <path d="M20 188 H184" stroke={STROKE} strokeWidth="2" />
      <path
        d="M60 118 Q92 148 138 156"
        fill="none"
        stroke={accent}
        strokeLinecap="round"
        strokeWidth="10"
      />
      <path
        d="M44 128 L66 122 M48 142 L72 134 M54 156 L80 146"
        stroke={STROKE}
        strokeLinecap="round"
        strokeWidth="3"
      />
    </g>
  );
}

function Slide({ fill, accent }: ArtProps) {
  return (
    <g>
      <path
        d="M30 148 Q30 128 54 126 L150 122 Q176 122 176 146 Q176 172 150 174 L54 176 Q30 176 30 156 Z"
        fill={fill}
        stroke={STROKE}
        strokeWidth="2"
      />
      <path
        d="M52 130 Q56 88 100 88 Q144 88 148 128 L132 130 Q128 106 100 106 Q72 106 68 132 Z"
        fill={accent}
        stroke={STROKE}
        strokeWidth="2"
      />
      <path
        d="M34 164 Q100 176 172 160"
        fill="none"
        stroke={STROKE}
        strokeWidth="3"
      />
    </g>
  );
}

function Figure({ fill, accent }: ArtProps) {
  return (
    <g>
      <path
        d="M62 84 L52 30 L92 58 Z"
        fill={fill}
        stroke={STROKE}
        strokeWidth="2"
      />
      <path
        d="M138 84 L148 30 L108 58 Z"
        fill={fill}
        stroke={STROKE}
        strokeWidth="2"
      />
      <circle
        cx="100"
        cy="104"
        fill={fill}
        r="44"
        stroke={STROKE}
        strokeWidth="2"
      />
      <path
        d="M74 148 H126 Q140 148 140 166 V204 Q140 216 126 216 H74 Q60 216 60 204 V166 Q60 148 74 148 Z"
        fill={accent}
        stroke={STROKE}
        strokeWidth="2"
      />
      <circle cx="86" cy="100" fill="#0a0a0a" r="7" />
      <circle cx="114" cy="100" fill="#0a0a0a" r="7" />
      <path
        d="M84 120 Q100 136 116 120"
        fill="none"
        stroke="#0a0a0a"
        strokeLinecap="round"
        strokeWidth="4"
      />
      <path
        d="M88 118 L92 128 M100 118 L100 130 M112 118 L108 128"
        stroke="#0a0a0a"
        strokeWidth="3"
      />
    </g>
  );
}

function Bag({ fill, accent }: ArtProps) {
  return (
    <g>
      {/* Strap, slung diagonally */}
      <path
        d="M40 40 Q90 90 76 156"
        fill="none"
        stroke={accent}
        strokeLinecap="round"
        strokeWidth="16"
      />
      {/* Pouch body */}
      <path
        d="M46 148 Q46 132 62 130 L138 122 Q158 122 158 144 Q158 170 138 172 L62 178 Q46 178 46 162 Z"
        fill={fill}
        stroke={STROKE}
        strokeWidth="2"
      />
      {/* Zip line across the top */}
      <path
        d="M52 138 Q100 128 152 132"
        fill="none"
        stroke={STROKE}
        strokeWidth="3"
      />
      {/* Hardware tab */}
      <rect
        fill={accent}
        height="14"
        rx="3"
        stroke={STROKE}
        strokeWidth="2"
        width="22"
        x="128"
        y="118"
      />
    </g>
  );
}

function Jeans({ fill, accent }: ArtProps) {
  return (
    <g>
      {/* Straight-leg body, less tapered than the joggers/cargos leg */}
      <path
        d="M56 44 H144 L150 96 L142 216 H112 L104 128 L96 216 H66 L58 96 Z"
        fill={fill}
        stroke={STROKE}
        strokeWidth="2"
      />
      {/* Contrast waistband */}
      <path d="M56 44 H144 L146 60 H54 Z" fill={accent} />
      {/* Belt loops */}
      <rect fill={STROKE} height="10" width="4" x="68" y="44" />
      <rect fill={STROKE} height="10" width="4" x="128" y="44" />
      {/* Inseam */}
      <path
        d="M104 128 L96 216 M104 128 L112 216"
        stroke={STROKE}
        strokeWidth="2"
      />
      {/* Curved back-pocket stitching */}
      <path
        d="M70 78 Q80 88 90 78"
        fill="none"
        stroke={STROKE}
        strokeWidth="2"
      />
      <path
        d="M110 78 Q120 88 130 78"
        fill="none"
        stroke={STROKE}
        strokeWidth="2"
      />
      {/* Button */}
      <circle cx="100" cy="52" fill={STROKE} r="4" />
    </g>
  );
}

function Beanie({ fill, accent }: ArtProps) {
  return (
    <g>
      {/* Domed crown */}
      <path
        d="M50 158 Q46 76 100 66 Q154 76 150 158 Z"
        fill={fill}
        stroke={STROKE}
        strokeWidth="2"
      />
      {/* Ribbed cuff */}
      <rect
        fill={accent}
        height="36"
        rx="4"
        stroke={STROKE}
        strokeWidth="2"
        width="106"
        x="47"
        y="150"
      />
      {/* Ribbing lines */}
      <path
        d="M60 150 V186 M76 150 V186 M92 150 V186 M108 150 V186 M124 150 V186 M140 150 V186"
        stroke={STROKE}
        strokeWidth="1.5"
      />
      {/* Crown seam */}
      <path d="M100 66 V150" stroke={STROKE} strokeWidth="1.5" />
    </g>
  );
}

const SHAPES: Record<GarmentShape, (props: ArtProps) => React.JSX.Element> = {
  hoodie: Hoodie,
  joggers: Joggers,
  cargos: Cargos,
  tracksuit: Tracksuit,
  puffer: Puffer,
  tee: Tee,
  "shorts-set": ShortsSet,
  sneaker: Sneaker,
  slide: Slide,
  figure: Figure,
  bag: Bag,
  jeans: Jeans,
  beanie: Beanie,
};

export function GarmentArt({
  shape,
  fill,
  accent,
  className,
}: {
  shape: GarmentShape;
  fill: string;
  accent: string;
  className?: string;
}) {
  const Shape = SHAPES[shape];

  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 200 250"
      xmlns="http://www.w3.org/2000/svg"
    >
      <Shape accent={accent} fill={fill} />
    </svg>
  );
}
