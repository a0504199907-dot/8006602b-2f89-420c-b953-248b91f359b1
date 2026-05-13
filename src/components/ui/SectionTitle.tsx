import { Link } from 'react-router';
import { ChevronLeft } from 'lucide-react';
import { ReactNode } from 'react';

interface SectionTitleProps {
  title: string;
  icon?: ReactNode;
  link?: string;
  linkText?: string;
  color?: string;
}

export default function SectionTitle({
  title,
  icon,
  link,
  linkText = 'לכל הכתבות',
  color = 'bg-secondary'
}: SectionTitleProps) {
  return (
    <div data-ev-id="ev_72bb109887" className="flex items-center justify-between mb-6">
      <div data-ev-id="ev_c09286fe7b" className="flex items-center gap-3">
        <div data-ev-id="ev_682ab415cc" className={`w-1.5 h-8 ${color} rounded-full`} />
        <div data-ev-id="ev_17cd364783" className="flex items-center gap-2.5">
          {icon && <span data-ev-id="ev_b841091167" className="text-secondary">{icon}</span>}
          <h2 data-ev-id="ev_e6228c2dc6" className="text-xl font-bold text-foreground font-serif">{title}</h2>
        </div>
      </div>
      {link &&
      <Link
        to={link}
        className="flex items-center gap-1 text-secondary hover:text-secondary-dark text-sm font-medium transition-colors group">

          {linkText}
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        </Link>
      }
    </div>);

}