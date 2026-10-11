import Hero from '../../features/home/components/Hero';
import DestinationExplorer from '../../features/destinations/components/DestinationExplorer';
import AssociationsSection from '../../features/associations/components/AssociationsSection';
import SpeciesSection from '../../features/ecosystem/components/SpeciesSection';
import CommunitySection from '../../features/community/components/CommunitySection';
import VisitSection from '../../features/visit/components/VisitSection';
import BeforeYouGo from '../../features/visit/components/BeforeYouGo';
import AppSection from '../../features/mobile-app/components/AppSection';

export default function HomePage() {
  return (
    <>
      <Hero />
      <DestinationExplorer />
      <AssociationsSection />
      <SpeciesSection />
      <CommunitySection />
      <VisitSection />
      <BeforeYouGo />
      <AppSection />
    </>
  );
}
