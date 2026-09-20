import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { EventsSection } from "@/components/home/EventsSection";
import { SocialFeed } from "@/components/home/SocialFeed";
import { FeaturedStories } from "@/components/home/FeaturedStories";
import { ContactSection } from "@/components/home/ContactSection";
import { buscarEventosDestaque, buscarHistoriasDestaque, buscarInstagram } from "@/lib/api";
import type { Evento, Historia } from "@/types";

export default async function Home() {
  // Cada busca falha de forma isolada: se o backend estiver fora do ar
  // momentaneamente, uma seção fica vazia em vez de derrubar a Home inteira.
  const [eventos, historias, instagram] = await Promise.all([
    buscarEventosDestaque().catch((): Evento[] => []),
    buscarHistoriasDestaque().catch((): Historia[] => []),
    buscarInstagram(),
  ]);

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero proximoEvento={eventos[0]} />
        <EventsSection eventos={eventos} />
        <SocialFeed dados={instagram} />
        <FeaturedStories historias={historias} />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
