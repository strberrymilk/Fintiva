{/*export default function Logo() {
  return (
    <div className="flex items-center gap-2">
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-primary"
      >
        <rect width="32" height="32" rx="6" fill="currentColor" />
        <path
          d="M16 8L22 12V20L16 24L10 20V12L16 8Z"
          fill="white"
        />
      </svg>
      <span className="text-xl font-bold">Fintiva</span>
    </div>
  );
}*/}

import logoSvg from '@/components/navbar-components/fintiva.svg'

export default function Logo() {
  return (
    <img 
      src={logoSvg} 
      alt="Logo Fintiva" 
      className="h-8 w-auto"
    />
  )
}