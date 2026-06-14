interface LogoProps {
  size?: number
  withWordmark?: boolean
  className?: string
}

export function Logo({ size = 28, withWordmark = true, className }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className ?? ''}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="fc-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop stopColor="#E3EF26" />
            <stop offset="1" stopColor="#076653" />
          </linearGradient>
        </defs>
        <rect width="32" height="32" rx="8" fill="url(#fc-grad)" />
        <path
          d="M11 9h11M11 15h7M11 21h5"
          stroke="#06231D"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path d="M22 17l-3 5h3l-1 4 4-6h-3l1-3z" fill="#06231D" />
      </svg>
      {withWordmark && (
        <span className="font-bold text-[17px] tracking-tight text-text-primary">FormCraft</span>
      )}
    </div>
  )
}
