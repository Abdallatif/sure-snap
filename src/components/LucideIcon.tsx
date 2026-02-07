import { icons, type LucideProps } from 'lucide-react'

interface LucideIconProps extends LucideProps {
  name: string
}

function toPascalCase(kebab: string): string {
  return kebab
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('')
}

export function LucideIcon({ name, ...props }: LucideIconProps) {
  const Component = icons[toPascalCase(name) as keyof typeof icons]
  if (!Component) return null
  return <Component {...props} />
}
