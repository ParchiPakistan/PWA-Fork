import { HeroSection } from "@/components/landing/HeroSection"
import { HowItWorksSection } from "@/components/landing/HowItWorksSection"
import { MerchantShowcaseSection } from "@/components/landing/MerchantShowcaseSection"
import { StudentFeaturesSection } from "@/components/landing/StudentFeaturesSection"
import { MerchantFeaturesSection } from "@/components/landing/MerchantFeaturesSection"
import { AboutUsSection } from "@/components/landing/AboutUsSection"
import { FAQSection } from "@/components/landing/FAQSection"
import { Footer } from "@/components/landing/Footer"

export default function LandingPage() {
  return (
    <main className="flex flex-col min-h-screen">
      <HeroSection />
      <HowItWorksSection />
      <MerchantShowcaseSection />
      <StudentFeaturesSection />
      <MerchantFeaturesSection />
      <AboutUsSection />
      <FAQSection />
      <Footer />
    </main>
  )
}
