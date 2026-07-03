import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Zones from './components/Zones';
import Items from './components/Items';
import Quests from './components/Quests';
import Raids from './components/Raids';
import Classes from './components/Classes';
import GuildProgression from './components/GuildProgression';
import HunterBonuses from './components/HunterBonuses';
import Auctions from './components/Auctions';
import KronoTracker from './components/KronoTracker';
import Glossary from './components/Glossary';
import Patreon from './components/Patreon';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen bg-frost-ice-900">
      <Navbar />
      <main>
        <Hero />
        <Zones />
        <Items />
        <Quests />
        <Raids />
        <Classes />
        <GuildProgression />
        <HunterBonuses />
        <Auctions />
        <KronoTracker />
        <Glossary />
        <Patreon />
      </main>
      <Footer />
    </div>
  );
}
