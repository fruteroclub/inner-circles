import BootstrapCirclesButton from "@/components/buttons/bootstrap-circles-button";
import PageWrapper from "@/components/layout/page-wrapper";
import { Section } from "@/components/layout/section";

export default function Home() {
  return (
    <PageWrapper>
      <Section>
        <h1 className="text-4xl font-bold">Hola (Inner Circles)</h1>
        <BootstrapCirclesButton>Bootstrap Circles</BootstrapCirclesButton>
      </Section>
    </PageWrapper>
  );
}
