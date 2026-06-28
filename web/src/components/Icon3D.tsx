'use client';

type Props = {
  emoji: string;
  variant?: 'slate' | 'ocean' | 'amber' | 'teal' | 'navy';
  size?: 'sm' | 'md' | 'lg';
};

const variantClass = {
  slate: 'icon-3d--slate',
  ocean: 'icon-3d--ocean',
  amber: 'icon-3d--amber',
  teal: 'icon-3d--teal',
  navy: 'icon-3d--navy'
};

/** 3D tile for emoji icons (catalog accents) */
export function Icon3D({ emoji, variant = 'ocean', size = 'md' }: Props) {
  return (
    <div className={`icon-3d ${variantClass[variant]} icon-3d--${size}`} aria-hidden>
      <span className="icon-3d-emoji">{emoji}</span>
      <span className="icon-3d-shadow" />
    </div>
  );
}
