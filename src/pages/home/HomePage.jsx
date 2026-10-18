import { MotionConfig } from "motion/react";
import { useDocumentTitle } from "../../hooks";
import Hero from "./sections/Hero";
import CollectionsSection from "./sections/CollectionsSection";
import FeaturedProductsSection from "./sections/FeaturedProductsSection";
import CampaignMaterialStudy from "./sections/CampaignMaterialStudy";
import CampaignWeekendEdit from "./sections/CampaignWeekendEdit";
import CuratedRailSection from "./sections/CuratedRailSection";
import BenefitsSection from "./sections/BenefitsSection";
import NewsletterSection from "./sections/NewsletterSection";
import FaqTeaserSection from "./sections/FaqTeaserSection";

/**
 * Landing page — the editorial signature of YoStore. The announcement bar,
 * navbar, and footer belong to AppLayout; everything between them is composed
 * here, section by section, each owning its own data and states.
 */
export default function HomePage() {
    useDocumentTitle("The current edit — curated objects, honestly priced", {
        description:
            "YoStore is a demo storefront: curated collections, the highest-rated products in the DummyJSON catalog, real shipping windows, a simulated newsletter and honest FAQ answers — no real orders are ever placed.",
    });

    return (
        <MotionConfig reducedMotion="user">
            <div className="bg-paper">
                <Hero />
                <CollectionsSection />
                <FeaturedProductsSection />
                <CampaignMaterialStudy />
                <CampaignWeekendEdit />
                <CuratedRailSection />
                <BenefitsSection />
                <NewsletterSection />
                <FaqTeaserSection />
            </div>
        </MotionConfig>
    );
}
