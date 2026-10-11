import Hero from '../../features/home/components/Hero';
import Highlights from '../../features/home/components/Highlights';
import DestinationExplorer from '../../features/destinations/components/DestinationExplorer';
import SpeciesSection from '../../features/ecosystem/components/SpeciesSection';
import CommunitySection from '../../features/community/components/CommunitySection';
import AssociationsSection from '../../features/associations/components/AssociationsSection';
import VisitSection from '../../features/visit/components/VisitSection';
import BeforeYouGo from '../../features/visit/components/BeforeYouGo';
import AppSection from '../../features/mobile-app/components/AppSection';

// Recorrido del turista: inspirarse → dónde ir → qué verá → por qué importa →
// a quién escribirle → cuándo ir → cómo prepararse → llevar la app.
export default function HomePage() {
  return (
    <>
      <Hero />
      <Highlights />
      <DestinationExplorer />
      <SpeciesSection />
      <CommunitySection />
      <AssociationsSection />
      <VisitSection />
      <BeforeYouGo />
      <AppSection />
    </>
  );
}
