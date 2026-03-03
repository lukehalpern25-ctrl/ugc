"use client";

import { useState } from "react";
import Image from "next/image";
import { resourceSections } from "@/lib/steps";
import InlineVideo from "./InlineVideo";

export default function ResourcesTab() {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleSection = (id: string) => {
    setOpenSection((prev) => (prev === id ? null : id));
  };

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-3 pb-24">
      {resourceSections.map((section) => {
        const isOpen = openSection === section.id;

        return (
          <div
            key={section.id}
            className="rounded-xl border border-border bg-surface overflow-hidden"
          >
            {/* Accordion header */}
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center gap-3 p-4 text-left active:bg-surface-light transition-colors"
            >
              <span className="text-2xl">{section.icon}</span>
              <span className="flex-1 font-semibold text-foreground">
                {section.title}
              </span>
              <svg
                className={`w-5 h-5 text-muted transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Expanded content */}
            {isOpen && (
              <div className="px-4 pb-4 space-y-4">
                {section.description && (
                  <p className="text-sm text-muted">{section.description}</p>
                )}
                {/* Example Winners — video cards with impression badges */}
                {section.id === "example-winners" &&
                  section.items.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-lg border border-border bg-surface-light overflow-hidden"
                    >
                      {item.file && (
                        <div className="aspect-[9/16] relative">
                          <InlineVideo
                            src={item.file}
                            className="w-full h-full"
                          />
                          {item.impressions && (
                            <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                              <svg
                                className="w-3.5 h-3.5"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                              </svg>
                              {item.impressions}
                            </div>
                          )}
                        </div>
                      )}
                      {(item.title || item.description) && (
                        <div className="p-3">
                          {item.title && (
                            <h4 className="font-semibold text-foreground text-sm">
                              {item.title}
                            </h4>
                          )}
                          {item.description && (
                            <p className="text-xs text-muted mt-1">
                              {item.description}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                {/* Background Audio — YouTube embeds */}
                {section.id === "background-audio" &&
                  section.items.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-lg border border-border bg-surface-light overflow-hidden"
                    >
                      {item.youtubeId && (
                        <div className="aspect-video">
                          <iframe
                            src={`https://www.youtube.com/embed/${item.youtubeId}`}
                            title={item.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full"
                          />
                        </div>
                      )}
                      {(item.title || item.description) && (
                        <div className="p-3">
                          {item.title && (
                            <h4 className="font-semibold text-foreground text-sm">
                              {item.title}
                            </h4>
                          )}
                          {item.description && (
                            <p className="text-xs text-muted mt-1">
                              {item.description}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                {/* Workout Videos — TikTok links with square thumbnails */}
                {section.id === "workout-videos" && (
                  <div className="grid grid-cols-2 gap-3">
                    {section.items.map((item) => (
                      <a
                        key={item.id}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block rounded-lg border border-border bg-surface-light overflow-hidden active:scale-[0.98] transition-all"
                      >
                        {item.thumbnail && (
                          <div className="aspect-square relative">
                            <Image
                              src={item.thumbnail}
                              alt="Workout video"
                              fill
                              className="object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                                <svg
                                  className="w-5 h-5 text-white ml-0.5"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              </div>
                            </div>
                            <div className="absolute bottom-1.5 right-1.5 bg-black/70 backdrop-blur-sm text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full">
                              TikTok
                            </div>
                          </div>
                        )}
                      </a>
                    ))}
                  </div>
                )}

                {/* Captions & Snapchat Text — copyable text buttons */}
                {section.id === "captions-text" &&
                  section.items.map((item) => (
                    <div key={item.id}>
                      {item.thumbnail && (
                        <div className="rounded-lg overflow-hidden border border-border mb-3">
                          <Image
                            src={item.thumbnail}
                            alt={item.title}
                            width={600}
                            height={400}
                            className="w-full h-auto"
                          />
                        </div>
                      )}
                      <h4 className="font-semibold text-foreground text-sm mb-1">
                        {item.title}
                      </h4>
                      {item.description && (
                        <p className="text-xs text-muted mb-2">
                          {item.description}
                        </p>
                      )}
                      {item.copyTexts && (
                        <div className="space-y-2">
                          {item.copyTexts.map((text, i) => {
                            const copyId = `${item.id}-${i}`;
                            return (
                              <button
                                key={i}
                                onClick={() => handleCopy(text, copyId)}
                                className="w-full flex items-center justify-between gap-3 px-3 py-2.5 bg-surface-light border border-border rounded-lg text-left hover:border-primary/50 active:scale-[0.98] transition-all"
                              >
                                <span className="text-sm text-foreground">
                                  &ldquo;{text}&rdquo;
                                </span>
                                <span className="flex-shrink-0">
                                  {copiedId === copyId ? (
                                    <svg
                                      className="w-4 h-4 text-success"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                      strokeWidth={2.5}
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M5 13l4 4L19 7"
                                      />
                                    </svg>
                                  ) : (
                                    <svg
                                      className="w-4 h-4 text-muted"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                      strokeWidth={2}
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                      />
                                    </svg>
                                  )}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Quick Reference — always visible */}
      <section className="rounded-xl border border-primary/20 bg-primary/5 p-5 mt-3">
        <h3 className="font-bold text-primary-light mb-3">Quick Reference</h3>
        <ul className="space-y-2 text-sm text-muted">
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">&bull;</span>
            Film everything on Snapchat in ONE continuous video
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">&bull;</span>
            2 iPhones: one for Snapchat filming, one for app demo
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">&bull;</span>
            Background noise is KEY — bar, restaurant, or show at home
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">&bull;</span>
            Camera flip should be ~2 seconds — fast and natural
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">&bull;</span>
            Never mention &quot;app&quot; or &quot;Gymdex&quot; in captions
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">&bull;</span>
            ALWAYS respond to comments — this is essential for reach
          </li>
        </ul>
      </section>
    </div>
  );
}
