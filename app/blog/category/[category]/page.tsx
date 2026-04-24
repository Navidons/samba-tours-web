import type { Metadata } from "next"
import ClientPage from "./ClientPage"

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: { category: string } }): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sambatours.co'
  const canonicalUrl = `${baseUrl}/blog/category/${params.category}`
  return {
    alternates: { canonical: canonicalUrl },
    robots: { index: true, follow: true },
  }
}

export default function Page({ params }: { params: { category: string } }) {
  return <ClientPage params={params} />
}
