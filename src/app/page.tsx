"use client";

import {
  ArrowRight,
  Building2,
  CalendarCheck,
  Check,
  ClipboardCheck,
  Home,
  Mail,
  Menu,
  Phone,
  Send,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import Image from "next/image";
import { FormEvent, useState } from "react";
import styles from "./page.module.css";

const email = "Info@amollu.com";
const phoneDisplay = "682-560-0797";
const phoneHref = "tel:6825600797";
const siteUrl = "https://www.amolluservices.com";

const services = [
  {
    icon: Home,
    title: "Residential Services",
    text: "Routine cleaning, upkeep, and property care support for homes that need dependable attention.",
  },
  {
    icon: Building2,
    title: "Commercial Services",
    text: "Reliable cleaning and maintenance coordination for offices, suites, and business properties.",
  },
  {
    icon: Wrench,
    title: "Facility Solutions",
    text: "Practical support for ongoing facility needs, from scheduled care to issue spotting and follow-through.",
  },
];

const plans = [
  {
    title: "Essential Care",
    cadence: "Routine support",
    description: "A dependable starting point for properties that need consistent upkeep.",
    features: ["Scheduled cleaning", "Basic property checks", "Clear service communication"],
  },
  {
    title: "Premium Care",
    cadence: "Most requested",
    description: "For properties that benefit from recurring attention and priority coordination.",
    features: ["Recurring service visits", "Detail-focused care", "Priority scheduling requests"],
  },
  {
    title: "Complete Care",
    cadence: "Full support",
    description: "A broader care plan for owners who want a more hands-off property support experience.",
    features: ["Ongoing property care", "Maintenance coordination", "Consistent follow-up"],
  },
];

const stats = [
  ["Residential", "Home-focused care"],
  ["Commercial", "Business-ready service"],
  ["Flexible", "Quote-based plans"],
];

const serviceDetails = [
  {
    title: "Residential property care",
    text: "Homeowners can request cleaning, routine upkeep, property checks, recurring care, and maintenance support based on the needs of the property.",
  },
  {
    title: "Commercial property care",
    text: "Businesses can request cleaning and maintenance coordination for offices, suites, and other commercial spaces that need reliable follow-through.",
  },
  {
    title: "Facility solutions",
    text: "Facility requests can include scheduled care, issue spotting, service coordination, and practical support for ongoing property operations.",
  },
  {
    title: "Quote-based service plans",
    text: "Amollu Services does not publish one-size-fits-all pricing. Each request starts with a quote conversation so scope, cadence, and priorities are clear.",
  },
];

const faqs = [
  {
    question: "What services does Amollu Services provide?",
    answer:
      "Amollu Services provides residential property care, commercial property care, cleaning, maintenance support, recurring upkeep, and facility solutions.",
  },
  {
    question: "How do I request a quote from Amollu Services?",
    answer:
      "Submit the quote form on this website, email Info@amollu.com, or call 682-560-0797. A team member will review the request and follow up.",
  },
  {
    question: "Does Amollu Services publish standard pricing?",
    answer:
      "Amollu Services uses quote-based plans because every property can have different service needs, schedules, and priorities.",
  },
  {
    question: "Can Amollu Services help with recurring property care?",
    answer:
      "Yes. The quote form includes recurring property care as a requested service option, and the team can discuss routine, premium, or full-support plans.",
  },
  {
    question: "What happens after I submit the website form?",
    answer:
      "The request is sent to Amollu Services, a confirmation email is sent to the requester, and the team can follow up using the details provided.",
  },
];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      name: "Amollu Services",
      url: siteUrl,
      publisher: {
        "@id": `${siteUrl}/#business`,
      },
      inLanguage: "en-US",
    },
    {
      "@type": ["LocalBusiness", "HomeAndConstructionBusiness"],
      "@id": `${siteUrl}/#business`,
      name: "Amollu Services",
      url: siteUrl,
      logo: `${siteUrl}/brand/amollu-logo-horizontal.png`,
      image: `${siteUrl}/brand/amollu-logo-horizontal.png`,
      email,
      telephone: "+1-682-560-0797",
      priceRange: "Quote-based",
      description:
        "Amollu Services provides residential, commercial, and facility property care, including cleaning, maintenance support, recurring upkeep, and quote-based service plans.",
      contactPoint: [
        {
          "@type": "ContactPoint",
          telephone: "+1-682-560-0797",
          email,
          contactType: "customer service",
          availableLanguage: ["English"],
        },
      ],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Amollu Services property care",
        itemListElement: serviceDetails.map((service) => ({
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: service.title,
            description: service.text,
            provider: {
              "@id": `${siteUrl}/#business`,
            },
          },
          url: `${siteUrl}/#quote`,
        })),
      },
    },
    {
      "@type": "FAQPage",
      "@id": `${siteUrl}/#faq-schema`,
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    },
  ],
};

type SubmitState = "idle" | "loading" | "success" | "error";

export default function HomePage() {
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setSubmitState("loading");
    setMessage("");

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(result.message || "Please try again in a moment.");
      }

      form.reset();
      setSubmitState("success");
      setMessage(result.message || "Thanks. Your request has been sent.");
    } catch (error) {
      setSubmitState("error");
      setMessage(error instanceof Error ? error.message : "Please try again in a moment.");
    }
  }

  return (
    <main className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <header className={styles.header}>
        <a className={styles.brand} href="#top" aria-label="Amollu Services home">
          <Image
            src="/brand/amollu-logo-horizontal.png"
            alt="Amollu Services"
            width={275}
            height={150}
            priority
          />
        </a>
        <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ""}`} aria-label="Primary navigation">
          <a href="#services" onClick={() => setMenuOpen(false)}>
            Services
          </a>
          <a href="#plans" onClick={() => setMenuOpen(false)}>
            Plans
          </a>
          <a href="#about" onClick={() => setMenuOpen(false)}>
            About
          </a>
          <a href="#faq" onClick={() => setMenuOpen(false)}>
            FAQ
          </a>
          <a href="#quote" onClick={() => setMenuOpen(false)}>
            Contact
          </a>
        </nav>
        <a className={styles.headerCta} href="#quote">
          Request a Quote
          <ArrowRight size={16} aria-hidden="true" />
        </a>
        <button
          className={styles.menuButton}
          type="button"
          aria-label="Navigation menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((isOpen) => !isOpen)}
        >
          <Menu size={22} aria-hidden="true" />
        </button>
      </header>

      <section className={styles.hero} id="top">
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>Property care and facility solutions</p>
          <h1>Reliable property services built around your space.</h1>
          <p className={styles.heroText}>
            Amollu Services helps homeowners and businesses keep their properties clean,
            maintained, and ready for the day-to-day.
          </p>
          <div className={styles.heroActions}>
            <a className={styles.primaryButton} href="#quote">
              <CalendarCheck size={19} aria-hidden="true" />
              Request a Free Estimate
            </a>
            <a className={styles.secondaryButton} href="#services">
              Explore Services
              <ArrowRight size={18} aria-hidden="true" />
            </a>
          </div>
          <div className={styles.contactStrip} aria-label="Contact Amollu Services">
            <a href={phoneHref}>
              <Phone size={16} aria-hidden="true" />
              {phoneDisplay}
            </a>
            <a href={`mailto:${email}`}>
              <Mail size={16} aria-hidden="true" />
              {email}
            </a>
          </div>
        </div>

        <div className={styles.heroVisual} aria-label="Amollu Services property care overview">
          <div className={styles.visualTop}>
            <span>Clean. Maintained. Ready.</span>
          </div>
          <div className={styles.propertyGrid}>
            <div className={styles.propertyCard}>
              <Home size={28} aria-hidden="true" />
              <span>Residential</span>
            </div>
            <div className={styles.propertyCard}>
              <Building2 size={28} aria-hidden="true" />
              <span>Commercial</span>
            </div>
            <div className={styles.propertyCard}>
              <ShieldCheck size={28} aria-hidden="true" />
              <span>Care Plans</span>
            </div>
            <div className={styles.propertyCard}>
              <ClipboardCheck size={28} aria-hidden="true" />
              <span>Facility Support</span>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.services} id="services">
        <div className={styles.sectionIntro}>
          <p className={styles.eyebrow}>What Amollu handles</p>
          <h2>Property care for homes, businesses, and facilities.</h2>
        </div>
        <div className={styles.serviceGrid}>
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <article className={styles.serviceCard} key={service.title}>
                <span className={styles.iconCircle}>
                  <Icon size={28} aria-hidden="true" />
                </span>
                <h3>{service.title}</h3>
                <p>{service.text}</p>
                <a href="#quote">
                  Get a quote
                  <ArrowRight size={16} aria-hidden="true" />
                </a>
              </article>
            );
          })}
        </div>
      </section>

      <section className={styles.plans} id="plans">
        <div className={styles.sectionIntro}>
          <p className={styles.eyebrow}>Service plans</p>
          <h2>Choose the level of care that fits the property.</h2>
        </div>
        <div className={styles.planGrid}>
          {plans.map((plan, index) => (
            <article className={`${styles.planCard} ${index === 1 ? styles.featuredPlan : ""}`} key={plan.title}>
              {index === 1 ? <span className={styles.planBadge}>Popular starting point</span> : null}
              <CalendarCheck size={30} aria-hidden="true" />
              <p>{plan.cadence}</p>
              <h3>{plan.title}</h3>
              <span>{plan.description}</span>
              <ul>
                {plan.features.map((feature) => (
                  <li key={feature}>
                    <Check size={17} aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
              <a href="#quote">Request this plan</a>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.about} id="about">
        <div className={styles.aboutCopy}>
          <p className={styles.eyebrow}>About Amollu Services</p>
          <h2>Built for property owners who want dependable follow-through.</h2>
          <p>
            Amollu Services provides residential, commercial, and facility care
            support with a practical approach: understand the property, define the
            work clearly, and keep communication straightforward.
          </p>
          <p>
            Every request starts with a quote conversation so the scope, schedule,
            and priorities match the space before service begins.
          </p>
        </div>
        <div className={styles.aboutPanel}>
          {stats.map(([label, text]) => (
            <div key={label}>
              <strong>{label}</strong>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.serviceDetails} id="service-details" aria-labelledby="service-details-heading">
        <div className={styles.sectionIntro}>
          <p className={styles.eyebrow}>Service details</p>
          <h2 id="service-details-heading">Clear property care options for homeowners and businesses.</h2>
        </div>
        <div className={styles.detailGrid}>
          {serviceDetails.map((service) => (
            <article key={service.title}>
              <h3>{service.title}</h3>
              <p>{service.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.faq} id="faq" aria-labelledby="faq-heading">
        <div className={styles.sectionIntro}>
          <p className={styles.eyebrow}>Common questions</p>
          <h2 id="faq-heading">Answers about Amollu Services and quote requests.</h2>
        </div>
        <div className={styles.faqList}>
          {faqs.map((faq) => (
            <details key={faq.question}>
              <summary>{faq.question}</summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className={styles.quote} id="quote">
        <div className={styles.quoteIntro}>
          <p className={styles.eyebrow}>Request a free estimate</p>
          <h2>Tell Amollu what your property needs.</h2>
          <p>
            Share a few details and the team will follow up using the contact
            information below.
          </p>
          <div className={styles.directContact}>
            <a href={phoneHref}>
              <Phone size={18} aria-hidden="true" />
              {phoneDisplay}
            </a>
            <a href={`mailto:${email}`}>
              <Mail size={18} aria-hidden="true" />
              {email}
            </a>
          </div>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label>
            Name
            <input name="name" type="text" autoComplete="name" required />
          </label>
          <label>
            Email
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <label>
            Phone
            <input name="phone" type="tel" autoComplete="tel" />
          </label>
          <label>
            Property type
            <select name="propertyType" required defaultValue="">
              <option value="" disabled>
                Select one
              </option>
              <option>Residential</option>
              <option>Commercial</option>
              <option>Facility</option>
              <option>Not sure yet</option>
            </select>
          </label>
          <label>
            Requested service
            <select name="service" required defaultValue="">
              <option value="" disabled>
                Select one
              </option>
              <option>Cleaning</option>
              <option>Maintenance support</option>
              <option>Recurring property care</option>
              <option>Facility solution</option>
              <option>Other</option>
            </select>
          </label>
          <label className={styles.fullField}>
            Message
            <textarea
              name="message"
              required
              rows={5}
              placeholder="Tell us about the property, timing, and what kind of support you need."
            />
          </label>
          <button className={styles.submitButton} type="submit" disabled={submitState === "loading"}>
            <Send size={18} aria-hidden="true" />
            {submitState === "loading" ? "Sending..." : "Send Quote Request"}
          </button>
          {message ? (
            <p className={`${styles.formMessage} ${submitState === "success" ? styles.success : styles.error}`}>
              {message}
            </p>
          ) : null}
        </form>
      </section>

      <footer className={styles.footer}>
        <div>
          <Image
            src="/brand/amollu-logo-horizontal-dark.svg"
            alt="Amollu Services"
            width={250}
            height={137}
          />
          <p>Property care and facility solutions for residential and commercial spaces.</p>
        </div>
        <div className={styles.footerLinks}>
          <a href="#services">Services</a>
          <a href="#plans">Plans</a>
          <a href="#about">About</a>
          <a href="#faq">FAQ</a>
          <a href="#quote">Contact</a>
        </div>
        <div className={styles.footerContact}>
          <a href={phoneHref}>
            <Phone size={16} aria-hidden="true" />
            {phoneDisplay}
          </a>
          <a href={`mailto:${email}`}>
            <Mail size={16} aria-hidden="true" />
            {email}
          </a>
        </div>
      </footer>
    </main>
  );
}
