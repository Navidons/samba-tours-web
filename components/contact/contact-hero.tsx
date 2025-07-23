import Image from "next/image"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export default function ContactHero() {
  return (
    <section className="relative bg-emerald-800 text-white">
      <div className="absolute inset-0">
        <Image
          src="/photos/giraffe-uganda-savana-hero.jpg"
          alt="Ugandan savannah with giraffes at golden hour"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/80 via-emerald-800/60 to-transparent" />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-48 pb-24">
        <div className="max-w-3xl">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/" className="text-emerald-200 hover:text-white">
                  Home
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-white font-semibold">Contact Us</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="mt-4 text-4xl sm:text-5xl md:text-6xl font-bold font-playfair text-shadow-lg">Get in Touch</h1>
          <p className="mt-4 text-lg md:text-xl text-emerald-100 max-w-2xl text-shadow">
            Have a question or ready to plan your adventure? Our team of safari experts is here to help you every step
            of the way.
          </p>
        </div>
      </div>
    </section>
  )
}
