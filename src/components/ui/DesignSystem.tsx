import React from 'react';

// Design System Tokens (Colors, Shadows, Radii)
export const TOKENS = {
  colors: {
    bg: '#F8FAFD',
    card: '#FFFFFF',
    primary: '#0A5BFF',
    secondary: '#EDF4FF',
    border: '#E8EDF5',
    textPrimary: '#172B4D',
    textSecondary: '#6B7280',
    critical: '#EF4444',
    warning: '#F59E0B',
    success: '#22C55E',
  },
  spacing: {
    padding: 'p-6 md:p-8',
    gap: 'gap-5 md:gap-6',
  },
  radius: 'rounded-[18px] md:rounded-[22px]',
  shadow: 'shadow-[0_4px_20px_-4px_rgba(10,91,255,0.05),0_1px_2px_rgba(0,0,0,0.01)]',
  border: 'border border-[#E8EDF5]',
  transition: 'transition-all duration-300 ease-out',
};

// ── BUTTONS ───────────────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  ...props
}) => {
  const baseStyle = `inline-flex items-center justify-center font-bold tracking-wide active:scale-[0.98] ${TOKENS.transition}`;
  
  const sizeStyles = {
    sm: 'px-4 py-2 text-xs rounded-xl gap-2',
    md: 'px-5 py-2.5 text-xs rounded-[12px] gap-2',
    lg: 'px-7 py-3.5 text-sm rounded-[16px] gap-3',
  };

  const variantStyles = {
    primary: 'bg-[#0A5BFF] hover:bg-[#004EE6] text-white shadow-[0_4px_12px_rgba(10,91,255,0.18)]',
    secondary: 'bg-[#EDF4FF] hover:bg-[#D6E4FF] text-[#0A5BFF] border border-[#D6E4FF]',
    ghost: 'bg-white hover:bg-[#F8FAFD] text-[#172B4D] border border-[#E8EDF5]',
    danger: 'bg-[#EF4444] hover:bg-[#DC2626] text-white shadow-[0_4px_12px_rgba(239,68,68,0.18)]',
  };

  return (
    <button
      className={`${baseStyle} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
};

// ── CARDS ─────────────────────────────────────────────────────────────
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  padded?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverable = false,
  padded = true,
  className = '',
  ...props
}) => {
  const baseCard = `bg-white ${TOKENS.border} ${TOKENS.radius} ${TOKENS.shadow}`;
  const hoverStyle = hoverable 
    ? 'hover:-translate-y-1 hover:shadow-[0_12px_36px_-6px_rgba(10,91,255,0.08)] cursor-pointer' 
    : '';

  return (
    <div
      className={`${baseCard} ${padded ? TOKENS.spacing.padding : ''} ${hoverStyle} ${TOKENS.transition} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// ── KPI CARD ──────────────────────────────────────────────────────────
interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
  trend?: {
    value: string | number;
    isPositive: boolean;
  };
  status?: 'critical' | 'warning' | 'success' | 'info';
  onClick?: () => void;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  icon,
  subtitle,
  trend,
  status,
  onClick,
}) => {
  const borderHighlight = status
    ? {
        critical: 'border-l-[5px] border-l-[#EF4444]',
        warning: 'border-l-[5px] border-l-[#F59E0B]',
        success: 'border-l-[5px] border-l-[#22C55E]',
        info: 'border-l-[5px] border-l-[#0A5BFF]',
      }[status]
    : '';

  return (
    <Card
      hoverable={!!onClick}
      onClick={onClick}
      className={`relative overflow-hidden flex flex-col justify-between min-h-[120px] ${borderHighlight}`}
    >
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <span className="text-[11px] font-black text-[#6B7280] uppercase tracking-wider">{title}</span>
          <div className="text-2xl font-black text-[#172B4D] tracking-tight">{value}</div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-[#EDF4FF] flex items-center justify-center text-[#0A5BFF]">
          {icon}
        </div>
      </div>
      {(subtitle || trend) && (
        <div className="mt-4 flex items-center justify-between text-[11px] font-bold">
          {subtitle && <span className="text-[#6B7280]">{subtitle}</span>}
          {trend && (
            <span className={trend.isPositive ? 'text-[#22C55E]' : 'text-[#EF4444]'}>
              {trend.value}
            </span>
          )}
        </div>
      )}
    </Card>
  );
};

// ── STATUS CHIPS / BADGES ─────────────────────────────────────────────
interface BadgeProps {
  status: 'critical' | 'warning' | 'success' | 'pending' | 'completed' | 'stable' | 'moderate' | 'routine';
  children: React.ReactNode;
  pulse?: boolean;
}

export const StatusChip: React.FC<BadgeProps> = ({ status, children, pulse = false }) => {
  const statusStyles = {
    critical: 'bg-[#FEE2E2] text-[#EF4444] border border-[#FECACA]',
    warning: 'bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]',
    success: 'bg-[#D1FAE5] text-[#059669] border border-[#A7F3D0]',
    stable: 'bg-[#D1FAE5] text-[#059669] border border-[#A7F3D0]',
    moderate: 'bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]',
    pending: 'bg-[#EDF4FF] text-[#0A5BFF] border border-[#BFDBFE]',
    routine: 'bg-[#EDF4FF] text-[#0A5BFF] border border-[#BFDBFE]',
    completed: 'bg-[#F1F5F9] text-[#64748b] border border-[#E8EDF5]',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
        statusStyles[status] || statusStyles.pending
      } ${pulse ? 'animate-pulse' : ''}`}
    >
      {pulse && <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />}
      {children}
    </span>
  );
};

// ── AVATARS ───────────────────────────────────────────────────────────
interface AvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'busy' | 'away';
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'md',
  status,
}) => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const sizeStyles = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-11 h-11 text-sm',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-24 h-24 text-2xl',
  };

  const statusColors = {
    online: 'bg-[#22C55E]',
    offline: 'bg-[#6B7280]',
    busy: 'bg-[#EF4444]',
    away: 'bg-[#F59E0B]',
  };

  return (
    <div className="relative inline-flex items-center justify-center flex-shrink-0">
      {src ? (
        <img
          src={src}
          alt={name}
          className={`${sizeStyles[size]} rounded-full object-cover border border-[#E8EDF5] bg-[#F8FAFD]`}
        />
      ) : (
        <div
          className={`${sizeStyles[size]} rounded-full bg-[#EDF4FF] text-[#0A5BFF] font-black flex items-center justify-center border border-[#E8EDF5]`}
        >
          {initials}
        </div>
      )}
      {status && (
        <span
          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${statusColors[status]}`}
        />
      )}
    </div>
  );
};

// ── FORM INPUTS ───────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
}

export const FormInput: React.FC<InputProps> = ({
  label,
  icon,
  className = '',
  id,
  ...props
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={id} className="text-[11px] font-black text-[#6B7280] uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <span className="absolute left-4 text-[#6B7280] flex items-center justify-center">
            {icon}
          </span>
        )}
        <input
          id={id}
          className={`w-full bg-white text-[#172B4D] font-bold text-xs border border-[#E8EDF5] rounded-[12px] p-3.5 focus:border-[#0A5BFF] focus:ring-4 focus:ring-[#0A5BFF]/8 outline-none ${
            icon ? 'pl-11' : ''
          } ${TOKENS.transition} ${className}`}
          {...props}
        />
      </div>
    </div>
  );
};

// ── SELECT ────────────────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export const FormSelect: React.FC<SelectProps> = ({
  label,
  options,
  className = '',
  id,
  ...props
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={id} className="text-[11px] font-black text-[#6B7280] uppercase tracking-wider">
          {label}
        </label>
      )}
      <select
        id={id}
        className={`w-full bg-white text-[#172B4D] font-bold text-xs border border-[#E8EDF5] rounded-[12px] p-3.5 focus:border-[#0A5BFF] focus:ring-4 focus:ring-[#0A5BFF]/8 outline-none ${TOKENS.transition} ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

// ── SEARCH BAR ────────────────────────────────────────────────────────
interface SearchProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
}

export const SearchBar: React.FC<SearchProps> = ({
  value,
  onChange,
  placeholder = 'Search records, patients, diagnostics...',
  icon,
}) => {
  return (
    <div className="relative flex items-center w-full max-w-[420px]">
      <span className="absolute left-4 text-[#6B7280]">{icon}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#FFFFFF] text-[#172B4D] font-bold text-xs border border-[#E8EDF5] rounded-full py-3 pl-11 pr-5 shadow-sm focus:border-[#0A5BFF] focus:ring-4 focus:ring-[#0A5BFF]/8 outline-none transition-all duration-300"
      />
    </div>
  );
};

// ── ENTERPRISE DATA TABLES ──────────────────────────────────────────
interface TableColumn<T> {
  header: string;
  accessor: (row: T) => React.ReactNode;
  width?: string;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  keyExtractor: (row: T) => string | number;
}

export function EnterpriseTable<T>({ columns, data, keyExtractor }: TableProps<T>) {
  return (
    <div className={`w-full overflow-hidden bg-white ${TOKENS.border} ${TOKENS.radius} ${TOKENS.shadow}`}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#F8FAFD] border-b border-[#E8EDF5]">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  style={{ width: col.width }}
                  className="px-6 py-4 text-left text-[11px] font-black text-[#6B7280] uppercase tracking-wider"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8EDF5]">
            {data.map((row) => (
              <tr
                key={keyExtractor(row)}
                className={`hover:bg-[#F8FAFD] ${TOKENS.transition}`}
              >
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className="px-6 py-4 text-xs font-semibold text-[#172B4D]">
                    {col.accessor(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
