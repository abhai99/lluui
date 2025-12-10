import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => {
  return (
    <div className="group relative p-6 rounded-2xl bg-card border border-border shadow-soft hover:shadow-elevated transition-all duration-300 hover:-translate-y-1">
      <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center mb-4 group-hover:shadow-glow transition-shadow duration-300">
        <Icon className="w-6 h-6 text-primary-foreground" />
      </div>
      <h3 className="font-display font-semibold text-lg text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
};
