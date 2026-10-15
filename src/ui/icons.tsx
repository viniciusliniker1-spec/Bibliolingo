import {
  ArrowLeft,
  ArrowRight,
  Award,
  BarChart3,
  Bell,
  BookMarked,
  BookOpen,
  Brain,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Church,
  Circle,
  CircleDot,
  Clock,
  Crown,
  ExternalLink,
  Flame,
  GraduationCap,
  Heart,
  Infinity as InfinityIcon,
  Info,
  Languages,
  Library,
  Lightbulb,
  Lock,
  Map as MapIcon,
  Menu,
  MessageCircle,
  Music,
  Play,
  Presentation,
  RotateCcw,
  ScrollText,
  Route,
  Scale,
  Search,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  Target,
  Timer,
  Trophy,
  User,
  WifiOff,
  X,
  XCircle,
  Zap,
  type LucideIcon,
  type LucideProps
} from "lucide-react";

export const ICONS = {
  achievement: Trophy,
  arrowLeft: ArrowLeft,
  arrowRight: ArrowRight,
  award: Award,
  bell: Bell,
  bible: BookOpen,
  book: BookOpen,
  bookmark: BookMarked,
  brain: Brain,
  chart: BarChart3,
  check: Check,
  checkCircle: CheckCircle2,
  chevronDown: ChevronDown,
  chevronRight: ChevronRight,
  chevronUp: ChevronUp,
  church: Church,
  circle: Circle,
  circleDot: CircleDot,
  clock: Clock,
  close: X,
  crown: Crown,
  error: XCircle,
  external: ExternalLink,
  flame: Flame,
  graduation: GraduationCap,
  heart: Heart,
  info: Info,
  infinity: InfinityIcon,
  journey: MapIcon,
  languages: Languages,
  library: Library,
  lightbulb: Lightbulb,
  lock: Lock,
  menu: Menu,
  music: Music,
  noah: MessageCircle,
  play: Play,
  presentation: Presentation,
  profile: User,
  reference: BookOpen,
  review: RotateCcw,
  route: Route,
  scale: Scale,
  search: Search,
  scroll: ScrollText,
  share: Share2,
  shield: ShieldCheck,
  sparkles: Sparkles,
  star: Star,
  study: GraduationCap,
  sun: Sun,
  target: Target,
  timer: Timer,
  trophy: Trophy,
  warning: Info,
  wifiOff: WifiOff,
  xp: Zap
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONS;

export interface AppIconProps extends Omit<LucideProps, "name"> {
  name: IconName;
}

export function AppIcon({ name, size = 20, strokeWidth = 2, ...props }: AppIconProps) {
  const Icon = ICONS[name];
  const filled = name === "heart";
  return (
    <Icon
      aria-hidden="true"
      focusable="false"
      size={size}
      strokeWidth={strokeWidth}
      fill={filled ? "currentColor" : props.fill}
      {...props}
    />
  );
}
