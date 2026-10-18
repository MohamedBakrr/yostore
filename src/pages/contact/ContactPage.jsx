import { Link } from "react-router";
import { ArrowRight, CircleQuestionMark, Mail, Truck } from "lucide-react";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import ContactForm from "../../components/forms/ContactForm";
import DemoNotice from "../../components/checkout/DemoNotice";

const METHODS = [
    {
        icon: Mail,
        title: "Email",
        body: "hello@yostore.example",
        note: "Opens your own mail app. Messages sent that way reach a real inbox; the demo form on this page does not.",
        href: "mailto:hello@yostore.example",
        action: "Write an email",
    },
    {
        icon: CircleQuestionMark,
        title: "Answers",
        body: "Coupons, payments, accounts and storage",
        note: "Most questions are already covered in the FAQ, with links to the pages that prove each answer.",
        to: "/faq",
        action: "Read the FAQ",
    },
    {
        icon: Truck,
        title: "Shipping & tracking",
        body: "Costs, timelines and demo tracking",
        note: "The shipping page shows the exact configuration checkout uses — one shared source of truth.",
        to: "/shipping",
        action: "View shipping info",
    },
];

/**
 * Contact page (SPEC §18). Real routes and a real mail link on the left; a
 * fully simulated — and clearly labelled — message form on the right.
 */
export default function ContactPage() {
    useDocumentTitle("Contact", {
        description:
            "How to reach the YoStore demo: a real mail link, routes to the FAQ and shipping pages, and a clearly simulated contact form.",
    });

    return (
        <div className="page-frame py-12 md:py-16">
            <header className="max-w-2xl">
                <p className="eyebrow">Contact</p>
                <h1 className="mt-3 font-display text-4xl leading-tight text-balance-tight md:text-5xl">
                    Talk to us — or read the honest answers first.
                </h1>
                <p className="mt-4 text-sm leading-relaxed text-muted">
                    YoStore is a frontend demonstration, so there is no support
                    team behind the curtain. Everything to the left is a real
                    way out: a mail link and pages that document exactly how the
                    store behaves.
                </p>
            </header>

            <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-12">
                <div className="lg:col-span-5">
                    <h2 className="font-display text-2xl leading-tight">
                        Where to go
                    </h2>
                    <ul className="mt-5 space-y-4">
                        {METHODS.map(
                            ({ icon: Icon, title, body, note, to, href, action }) => {
                                const content = (
                                    <>
                                        <div className="flex items-start gap-3">
                                            <Icon
                                                className="mt-0.5 size-5 shrink-0 text-accent"
                                                aria-hidden="true"
                                            />
                                            <div>
                                                <h3 className="font-display text-lg leading-snug">
                                                    {title}
                                                </h3>
                                                <p className="mt-0.5 text-sm font-medium text-ink">
                                                    {body}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="mt-3 text-xs leading-relaxed text-muted">
                                            {note}
                                        </p>
                                        <span className="link-underline mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-ink">
                                            {action}
                                            <ArrowRight
                                                className="size-3.5"
                                                aria-hidden="true"
                                            />
                                        </span>
                                    </>
                                );

                                return (
                                    <li key={title}>
                                        {to ? (
                                            <Link
                                                to={to}
                                                className="card-flat block px-5 py-5 transition-colors hover:border-hair-strong"
                                            >
                                                {content}
                                            </Link>
                                        ) : (
                                            <a
                                                href={href}
                                                className="card-flat block px-5 py-5 transition-colors hover:border-hair-strong"
                                            >
                                                {content}
                                            </a>
                                        )}
                                    </li>
                                );
                            },
                        )}
                    </ul>

                    <p className="mt-6 text-xs leading-relaxed text-muted">
                        No phone number is listed on purpose: this demo has no
                        call centre, and inventing one would be dishonest.
                    </p>
                </div>

                <div className="lg:col-span-7">
                    <section
                        aria-labelledby="contact-form-heading"
                        className="card-flat p-6 md:p-8"
                    >
                        <h2
                            id="contact-form-heading"
                            className="font-display text-2xl leading-tight"
                        >
                            Send a message
                        </h2>
                        <p className="mt-2 text-sm leading-relaxed text-muted">
                            Validated exactly like every other form in the
                            store, with a loading state and a confirmation —
                            the only thing missing is a recipient.
                        </p>
                        <div className="mt-6">
                            <ContactForm />
                        </div>
                    </section>

                    <DemoNotice label="Simulated submission." className="mt-6">
                        Nothing you type here is sent, stored, or emailed. The
                        form runs a short local timer and then confirms — no
                        network request is made, and closing the tab discards
                        everything.
                    </DemoNotice>

                    <p className="mt-4 text-sm leading-relaxed text-muted">
                        Looking for shipping costs, payment behavior, or how
                        demo accounts work?{" "}
                        <Link
                            to="/faq"
                            className="link-underline font-medium text-ink"
                        >
                            The FAQ covers all of it
                        </Link>
                        .
                    </p>
                </div>
            </div>
        </div>
    );
}
