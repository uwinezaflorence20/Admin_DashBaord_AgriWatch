'use client';

export default function JsonLd() {
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "AgriWatch",
    "alternateName": ["AgriWatch AI", "Agri Watch"],
    "url": "https://www.agriwatch.com",
    "logo": "https://www.agriwatch.com/icon.png",
    "description": "AgriWatch is an AI-powered platform that detects late blight disease in potato crops, helping farmers protect their harvest through early detection and smart monitoring.",
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "availableLanguage": ["English", "Kinyarwanda", "French"]
      }
    ]
  };

  const softwareData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "AgriWatch",
    "description": "AI-powered early detection of late blight disease in potato crops.",
    "url": "https://www.agriwatch.com",
    "applicationCategory": "AgricultureApplication",
    "operatingSystem": "Web"
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareData) }}
      />
    </>
  );
}
