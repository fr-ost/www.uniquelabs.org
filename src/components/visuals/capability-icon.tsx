import {
  AppWindow,
  Boxes,
  Code2,
  Compass,
  Cpu,
  FlaskConical,
  Gauge,
  Globe,
  Layers,
  Lock,
  PenTool,
  Puzzle,
  ShieldCheck,
  Sparkles,
  Workflow,
  Zap,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  puzzle: Puzzle,
  globe: Globe,
  "app-window": AppWindow,
  zap: Zap,
  code: Code2,
  flask: FlaskConical,
  "pen-tool": PenTool,
  shield: ShieldCheck,
  layers: Layers,
  cpu: Cpu,
  compass: Compass,
  sparkles: Sparkles,
  lock: Lock,
  gauge: Gauge,
  boxes: Boxes,
  workflow: Workflow,
};

export function CapabilityIconView({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? Sparkles;
  return <Icon aria-hidden className={className} strokeWidth={1.6} />;
}
