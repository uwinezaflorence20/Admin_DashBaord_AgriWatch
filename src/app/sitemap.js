export default async function sitemap() {
  const baseUrl = "https://www.jmlustitia.com";

  // In a real app, you might fetch dynamic routes (e.g., articles) from an API
  // For now, we'll list the main marketing routes and service IDs

  const staticRoutes = [
    "",
    "/about",
    "/services",
    "/news",
    "/team",
    "/careers",
    "/contact",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: route === "" ? 1 : 0.8,
  }));

  // Service detail routes
  const serviceIds = [
    "legal-advisory-litigation",
    "contract-commercial-law",
    "notary-services",
    "corporate-business-law",
    "property-real-estate-law",
    "adr-mediation",
  ];

  const serviceRoutes = serviceIds.map((id) => ({
    url: `${baseUrl}/services/${id}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...serviceRoutes];
}
