import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Astra Center | Pantalla de Anuncios',
  description: 'Cartelería digital Astra Center',
}

export default function DisplayLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
