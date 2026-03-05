"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { urlFor } from "@/sanity/lib/image";

gsap.registerPlugin(ScrollTrigger);

export interface SanityWork {
    _id: string;
    title: string;
    subtext: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    coverImage: any;
    caseStudyLink?: string;
    testimonialLink?: string;
    viewWorkLink?: string;
}

interface WorksSectionClientProps {
    works: SanityWork[];
}

const WorksSectionClient = ({ works }: WorksSectionClientProps) => {
    const containerRef = useRef<HTMLElement>(null);

    useGSAP(
        () => {
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

            // ─── Title: pin + orange fill ─────────────────────────────────────────────
            const titleFill =
                containerRef.current?.querySelector<HTMLElement>(".works-title-fill");

            if (titleFill) {
                gsap
                    .timeline({
                        scrollTrigger: {
                            trigger: ".title-section-container",
                            start: "center center",
                            end: "+=60%",
                            pin: true,
                            scrub: true,
                            pinSpacing: true,
                        },
                    })
                    .fromTo(
                        titleFill,
                        { "--title-fill": "0%" },
                        { "--title-fill": "100%", ease: "none" },
                    );
            }

            // ─── Cards ────────────────────────────────────────────────────────────────
            const wrappers = gsap.utils.toArray<HTMLElement>(".work-item-wrapper");

            wrappers.forEach((wrapper) => {
                const card = wrapper.querySelector<HTMLElement>(".work-item");
                const image = card?.querySelector<HTMLElement>(".work-item-image img");

                if (!card) return;

                // ── Entrance: card rotates in from below ──────────────────────────────
                gsap.fromTo(
                    card,
                    {
                        rotateZ: 18,
                        rotateX: 6,
                        scale: 0.72,
                        transformOrigin: "center bottom",
                        transformPerspective: 1400,
                    },
                    {
                        rotateZ: 0,
                        rotateX: 0,
                        scale: 1,
                        ease: "power2.out",
                        force3D: true,
                        scrollTrigger: {
                            trigger: wrapper,
                            start: "top bottom",
                            end: "top 20%",
                            scrub: true,
                            invalidateOnRefresh: true,
                        },
                    },
                );

                // ── Image de-zoom synced with entrance ────────────────────────────────
                if (image) {
                    gsap.fromTo(
                        image,
                        { scale: 1.28 },
                        {
                            scale: 1,
                            ease: "power2.out",
                            force3D: true,
                            scrollTrigger: {
                                trigger: wrapper,
                                start: "top bottom",
                                end: "top 20%",
                                scrub: true,
                                invalidateOnRefresh: true,
                            },
                        },
                    );
                }
            });
        },
        { scope: containerRef },
    );

    return (
        <section
            className="works-section-container-main"
            data-node-id="484:1124"
            ref={containerRef}
        >
            <div className="works-title-wrap">
                <div className="title-section-container">
                    <h2>
                        <span className="works-title-fill">CURATED WORKS</span>
                    </h2>
                </div>
            </div>

            <div className="works-item-container-wrap">
                {works.map((work) => {
                    const imageUrl = work.coverImage
                        ? urlFor(work.coverImage).width(1920).height(1080).url()
                        : "/images/work-image.png";

                    return (
                        <div className="work-item-wrapper" key={work._id}>
                            {/* Whole card is clickable if viewWorkLink is set */}
                            <article
                                className={`work-item${work.viewWorkLink ? " work-item--clickable" : ""}`}
                                data-node-id="553:1148"
                                onClick={() => {
                                    if (work.viewWorkLink) window.open(work.viewWorkLink, "_blank", "noopener,noreferrer");
                                }}
                                role={work.viewWorkLink ? "link" : undefined}
                                tabIndex={work.viewWorkLink ? 0 : undefined}
                                onKeyDown={(e) => {
                                    if (work.viewWorkLink && (e.key === "Enter" || e.key === " ")) {
                                        window.open(work.viewWorkLink, "_blank", "noopener,noreferrer");
                                    }
                                }}
                            >
                                {/* Cover image */}
                                <div className="work-item-image">
                                    <Image
                                        src={imageUrl}
                                        alt={work.title}
                                        fill
                                        sizes="100vw"
                                        style={{ objectFit: "cover", objectPosition: "center" }}
                                        priority={false}
                                    />
                                </div>

                                <div className="work-item-overlay" aria-hidden="true" />

                                {/* Optional links — only rendered if they have a value */}
                                {(work.caseStudyLink || work.testimonialLink || work.viewWorkLink) && (
                                    <div
                                        className="top-right-section work-card-links"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {work.caseStudyLink && (
                                            <Link
                                                href={work.caseStudyLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                CASE STUDY
                                            </Link>
                                        )}
                                        {work.testimonialLink && (
                                            <Link
                                                href={work.testimonialLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                TESTIMONIAL
                                            </Link>
                                        )}
                                        {work.viewWorkLink && (
                                            <Link
                                                href={work.viewWorkLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                VIEW WORK
                                            </Link>
                                        )}
                                    </div>
                                )}

                                <div className="work-card-bottom">
                                    <h4>{work.title}</h4>
                                    <p>{work.subtext}</p>
                                </div>
                            </article>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

export default WorksSectionClient;
