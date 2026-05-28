import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  width?: number
  height?: number
  showTitle?: boolean
  titlePosition?: "top" | "bottom" | "left" | "right"
}

export function Logo({ className, width = 32, height = 28, showTitle = false, titlePosition = "right" }: LogoProps) {
  const logoImage = <img src="/images/logo.svg" alt="Zoto Go Logo" width={width} height={height} />

  if (!showTitle) {
    return <div className={className}>{logoImage}</div>
  }

  const containerClasses = {
    top: "flex flex-col items-center gap-2",
    bottom: "flex flex-col items-center gap-2",
    left: "flex items-center gap-2",
    right: "flex items-center gap-2"
  }

  const content = {
    top: [
      <span key="title" className="font-semibold text-lg text-primary">
        Zoto Go
      </span>,
      <img key="logo" src="/images/logo.svg" alt="Zoto Go Logo" width={width} height={height} />
    ],
    bottom: [
      <img key="logo" src="/images/logo.svg" alt="Zoto Go Logo" width={width} height={height} />,
      <span key="title" className="font-semibold text-lg text-primary">
        Zoto Go
      </span>
    ],
    left: [
      <span key="title" className="font-semibold text-lg text-primary">
        Zoto Go
      </span>,
      <img key="logo" src="/images/logo.svg" alt="Zoto Go Logo" width={width} height={height} />
    ],
    right: [
      <img key="logo" src="/images/logo.svg" alt="Zoto Go Logo" width={width} height={height} />,
      <span key="title" className="font-semibold text-lg text-primary">
        Zoto Go
      </span>
    ]
  }

  return <div className={cn(containerClasses[titlePosition], className)}>{content[titlePosition]}</div>
}
