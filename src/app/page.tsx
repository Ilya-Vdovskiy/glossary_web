import { Header } from "@/components/Header";
import { HomeExperience } from "@/components/HomeExperience";
import { getStats, glossary } from "@/lib/glossary";

export default function HomePage() {
  return (
    <>
      <Header />
      <HomeExperience data={glossary} stats={getStats()} />
    </>
  );
}
