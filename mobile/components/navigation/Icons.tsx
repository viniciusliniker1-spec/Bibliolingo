import Svg, { Circle, Path, Rect } from "react-native-svg";

export type IconName =
  | "trail" | "bible" | "study" | "trophy" | "profile"
  | "flame" | "star" | "heart" | "book" | "check" | "lock" | "shield" | "play" | "chevronDown" | "back" | "close"
  | "search" | "edit" | "bookmark" | "copy" | "share" | "memory" | "globe" | "chevronLeft" | "chevronRight" | "notebook" | "settings" | "bell" | "coin" | "logout" | "user" | "shop" | "cloud" | "send" | "bulb" | "refresh";

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/** Ícones de traço simples, desenhados para o Bibliolingo (sem dependência de fonte de ícones). */
export function Icon({ name, size = 22, color = "#ffffff", strokeWidth = 2.4 }: IconProps) {
  const stroke = { stroke: color, strokeWidth, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessible={false}>
      {name === "trail" ? <><Path d="M4 20c4-1 4-6 8-7s4-6 8-7" {...stroke} /><Circle cx={4} cy={20} r={1.8} fill={color} /><Circle cx={20} cy={6} r={1.8} fill={color} /></> : null}
      {name === "bible" || name === "book" ? <><Path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z" {...stroke} /><Path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z" {...stroke} /></> : null}
      {name === "study" ? <><Path d="M22 9 12 4 2 9l10 5 10-5z" {...stroke} /><Path d="M6 11v5c3 2.5 9 2.5 12 0v-5" {...stroke} /></> : null}
      {name === "trophy" ? <><Path d="M8 21h8" {...stroke} /><Path d="M12 17v4" {...stroke} /><Path d="M7 4h10v5a5 5 0 0 1-10 0z" {...stroke} /><Path d="M17 5h3a3 3 0 0 1-3 4" {...stroke} /><Path d="M7 5H4a3 3 0 0 0 3 4" {...stroke} /></> : null}
      {name === "profile" ? <><Circle cx={12} cy={8} r={4} {...stroke} /><Path d="M4 21a8 8 0 0 1 16 0" {...stroke} /></> : null}
      {name === "flame" ? <Path d="M12 2c1 3.5-1.5 5-1.5 7.5 0 1.4 1 2.5 2.4 2.5 1.6 0 2.6-1.3 2.3-3.2C17.6 10.4 19 12.6 19 15a7 7 0 0 1-14 0c0-4.5 4-7.6 7-13z" fill={color} /> : null}
      {name === "star" ? <Path d="m12 2 3 6.6 7 .8-5.2 4.8 1.5 7L12 17.6 5.7 21.2l1.5-7L2 9.4l7-.8z" fill={color} /> : null}
      {name === "heart" ? <Path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.8 4.5c2.1 0 3.6 1.1 5.2 3 1.6-1.9 3.1-3 5.2-3 3.8 0 5.9 3.9 4.4 7.3C19.5 16.4 12 21 12 21z" fill={color} /> : null}
      {name === "send" ? <><Path d="M12 19V5" {...stroke} /><Path d="m5 12 7-7 7 7" {...stroke} /></> : null}
      {name === "bulb" ? <><Path d="M9 18h6" {...stroke} /><Path d="M10 21h4" {...stroke} /><Path d="M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.3 1.1 2.2h5c0-.9.4-1.6 1.1-2.2A6 6 0 0 0 12 3z" {...stroke} /></> : null}
      {name === "refresh" ? <><Path d="M20 11a8 8 0 1 0-2.3 5.7" {...stroke} /><Path d="M20 4v7h-7" {...stroke} /></> : null}
      {name === "check" ? <Path d="M20 6 9 17l-5-5" {...stroke} /> : null}
      {name === "lock" ? <><Rect x={5} y={11} width={14} height={10} rx={2} {...stroke} /><Path d="M8 11V7a4 4 0 0 1 8 0v4" {...stroke} /></> : null}
      {name === "shield" ? <><Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" {...stroke} /><Path d="m9 12 2 2 4-4" {...stroke} /></> : null}
      {name === "play" ? <Path d="M7 4v16l13-8z" fill={color} /> : null}
      {name === "chevronDown" ? <Path d="m6 9 6 6 6-6" {...stroke} /> : null}
      {name === "back" ? <Path d="m15 18-6-6 6-6" {...stroke} /> : null}
      {name === "search" ? <><Circle cx={11} cy={11} r={7} {...stroke} /><Path d="m20 20-3.5-3.5" {...stroke} /></> : null}
      {name === "edit" ? <><Path d="M12 20h9" {...stroke} /><Path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" {...stroke} /></> : null}
      {name === "bookmark" ? <Path d="M19 21 12 16 5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" {...stroke} /> : null}
      {name === "copy" ? <><Rect x={9} y={9} width={12} height={12} rx={2} {...stroke} /><Path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" {...stroke} /></> : null}
      {name === "share" ? <><Circle cx={18} cy={5} r={3} {...stroke} /><Circle cx={6} cy={12} r={3} {...stroke} /><Circle cx={18} cy={19} r={3} {...stroke} /><Path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" {...stroke} /></> : null}
      {name === "memory" ? <><Path d="M9 18h6M10 22h4" {...stroke} /><Path d="M12 2a7 7 0 0 0-4 12.7V16h8v-1.3A7 7 0 0 0 12 2z" {...stroke} /></> : null}
      {name === "globe" ? <><Circle cx={12} cy={12} r={10} {...stroke} /><Path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" {...stroke} /></> : null}
      {name === "chevronLeft" ? <Path d="m15 18-6-6 6-6" {...stroke} /> : null}
      {name === "chevronRight" ? <Path d="m9 18 6-6-6-6" {...stroke} /> : null}
      {name === "notebook" ? <><Rect x={4} y={2} width={16} height={20} rx={2} {...stroke} /><Path d="M8 6h8M8 10h8M8 14h5" {...stroke} /></> : null}
      {name === "settings" ? <><Circle cx={12} cy={12} r={3} {...stroke} /><Path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" {...stroke} /></> : null}
      {name === "bell" ? <><Path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" {...stroke} /><Path d="M10.3 21a1.9 1.9 0 0 0 3.4 0" {...stroke} /></> : null}
      {name === "coin" ? <><Circle cx={12} cy={12} r={9} {...stroke} /><Path d="m12 7 3 5-3 5-3-5z" {...stroke} /></> : null}
      {name === "logout" ? <><Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" {...stroke} /><Path d="m16 17 5-5-5-5M21 12H9" {...stroke} /></> : null}
      {name === "user" ? <><Circle cx={12} cy={8} r={4} {...stroke} /><Path d="M4 21a8 8 0 0 1 16 0" {...stroke} /></> : null}
      {name === "shop" ? <><Path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" {...stroke} /><Path d="M3 6h18M16 10a4 4 0 0 1-8 0" {...stroke} /></> : null}
      {name === "cloud" ? <Path d="M18 10h-1.3A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" {...stroke} /> : null}
      {name === "close" ? <><Path d="M18 6 6 18" {...stroke} /><Path d="m6 6 12 12" {...stroke} /></> : null}
    </Svg>
  );
}
