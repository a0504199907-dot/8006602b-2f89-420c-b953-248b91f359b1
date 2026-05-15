import { Link } from 'react-router';
import { ChevronLeft } from 'lucide-react';
import { ReactNode } from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  link?: string;
  linkText?: string;
  variant?: 'default' | 'centered' | 'gold';
}

export default function SectionHeader({
  title,
  subtitle,
  icon,
  link,
  linkText = 'לכל הכתבות',
  variant = 'default'
}: SectionHeaderProps) {
  if (variant === 'centered') {
    return (
      <div data-ev-id="ev_c6f843e7ff" className="flex flex-col items-center gap-2 mb-8">
        <div data-ev-id="ev_5973a50af1" className="flex items-center justify-center gap-4 w-full">
          <div data-ev-id="ev_2641e00bb6" className="flex-1 h-px bg-gradient-to-r from-transparent via-secondary/50 to-secondary" />
          <h2 data-ev-id="ev_0490ad133f" className="text-xl sm:text-2xl font-bold text-secondary font-serif flex items-center gap-2 break-words min-w-0 px-4">
            {icon}
            {title}
          </h2>
          <div data-ev-id="ev_b0407c6b32" className="flex-1 h-px bg-gradient-to-l from-transparent via-secondary/50 to-secondary" />
        </div>
        {subtitle &&
        <p data-ev-id="ev_33c46dc641" className="text-muted-foreground text-sm">{subtitle}</p>
        }
      </div>);
  }

  if (variant === 'gold') {
    return (
      <div data-ev-id="ev_981b999f8e" className="flex flex-col gap-1 mb-6">
        <div data-ev-id="ev_9bde4e2036" className="flex items-center justify-between">
          <div data-ev-id="ev_153a7b460b" className="flex items-center gap-3">
            <div data-ev-id="ev_e3023efd75" className="flex items-center gap-2">
              <div data-ev-id="ev_dbb56badb2" className="w-2 h-8 bg-secondary rounded-sm" />
              <div data-ev-id="ev_6ad1b11a68" className="w-1 h-6 bg-secondary/60 rounded-sm" />
            </div>
            <h2 data-ev-id="ev_00c58cf84d" className="text-xl sm:text-2xl font-bold text-secondary font-serif flex items-center gap-2 break-words min-w-0">
              {icon}
              {title}
            </h2>
          </div>
          {link &&
          <Link
            to={link}
            className="flex items-center gap-1 bg-secondary/10 hover:bg-secondary text-secondary hover:text-primary px-4 py-2 rounded-[8px] text-sm font-medium transition-all duration-200 group">

            {linkText}
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </Link>
          }
        </div>
        {subtitle &&
        <p data-ev-id="ev_395e4b1751" className="text-muted-foreground text-sm mr-10">{subtitle}</p>
        }
      </div>);
  }

  // Default variant
  return (
    <div data-ev-id="ev_a558d2db82" className="flex flex-col gap-1 mb-6">
      <div data-ev-id="ev_53e79d490b" className="flex items-center justify-between">
        <div data-ev-id="ev_867ce955a3" className="flex items-center">
          <div data-ev-id="ev_00cb81dab2" className="flex items-center gap-2 pl-4 border-r-4 border-secondary">
            {icon && <span data-ev-id="ev_5dbdec9ace" className="text-secondary">{icon}</span>}
            <h2 data-ev-id="ev_1153757691" className="text-lg sm:text-xl font-bold text-foreground font-serif break-words min-w-0">{title}</h2>
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
      </div>
      {subtitle &&
      <p data-ev-id="ev_5921022a55" className="text-muted-foreground text-sm mr-8">{subtitle}</p>
      }
    </div>);
}