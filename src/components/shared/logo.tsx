interface LogoProps {
  size?: "sm" | "md" | "lg"
  showText?: boolean
}

/**
 * MoveKit logo — teal rounded square with 3D box icon.
 * Matches the favicon exactly.
 */
export function Logo({ size = "md", showText = true }: LogoProps) {
  const dims = size === "sm" ? "h-6 w-6" : size === "lg" ? "h-10 w-10" : "h-8 w-8"
  const textSize = size === "sm" ? "text-sm" : size === "lg" ? "text-xl" : "text-lg"
  const svgSize = size === "sm" ? 14 : size === "lg" ? 24 : 18

  return (
    <span className="inline-flex items-center gap-2">
      <span className={`${dims} inline-flex items-center justify-center rounded-lg overflow-hidden`}>
        <svg viewBox="0 0 32 32" width={svgSize} height={svgSize}>
          <rect width="32" height="32" rx="7" fill="#0D9488"/>
          <polygon points="16,8 23,11.5 16,15 9,11.5" fill="#D4915C"/>
          <polygon points="15,8.2 17,8.2 17,14.8 15,14.8" fill="#8B5E3C"/>
          <polygon points="16,15 23,11.5 23,21 16,24.5" fill="#B8723A"/>
          <polygon points="16,15 9,11.5 9,21 16,24.5" fill="#DBA26E"/>
        </svg>
      </span>
      {showText && <span className={`${textSize} font-bold`}>MoveKit</span>}
    </span>
  )
}
