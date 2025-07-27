function withValidProperties(
  properties) {
  return Object.fromEntries(
    Object.entries(properties).filter(([key, value]) => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return !!value;
    }),
  );
}

export default function handler(req, res) {
  const URL = process.env.NEXT_PUBLIC_URL || "https://miniapp.g1ve.xyz";

  const manifest = {
    accountAssociation: {
      header: process.env.FARCASTER_HEADER || "eyJmaWQiOjQ5ODU0NCwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDBGNTJDQjQzOTJEMkZFYjJhMEMxMjkwYTNlN0UyMUJjMjI0NTNBNzIifQ",
      payload: process.env.FARCASTER_PAYLOAD || "eyJkb21haW4iOiJtaW5pYXBwLmcxdmUueHl6In0",
      signature: process.env.FARCASTER_SIGNATURE || "MHg0MDBmZGUyM2JlZDgxOWE4YWMxM2M4YjcwNGVlYjMwMmRjMmFkN2RmNTIyMWI3Mzg1N2Y4NTZkZjNlZmYwZjY4MTFhNGU1OGRkMzU0NjFhNjBiYWMyNzY5NjcyODE5NDRhNzJjMTNhNGNjZGNkYjY1M2Y5NjBlZTczNjA0ZDE1MDFi",
    },
    miniapp: withValidProperties({
      version: "1",
      name: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || "G1VE",
      iconUrl: process.env.NEXT_PUBLIC_APP_ICON || "https://miniapp.g1ve.xyz/icon.png",
      homeUrl: URL,
      imageUrl: process.env.NEXT_PUBLIC_APP_HERO_IMAGE || "https://miniapp.g1ve.xyz/frame-image.png",
      buttonTitle: process.env.NEXT_PUBLIC_APP_BUTTON_TITLE || "Generosity Onchain",
      splashImageUrl: process.env.NEXT_PUBLIC_APP_SPLASH_IMAGE || "https://miniapp.g1ve.xyz/splash.png",
      splashBackgroundColor: process.env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR || "#000000",
      webhookUrl: `${URL}/api/webhook`,
      description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || "G1VE is a daily onchain donation app built to make giving viral.",
      subtitle: process.env.NEXT_PUBLIC_APP_SUBTITLE || "WAGMI, IRL",
      primaryCategory: process.env.NEXT_PUBLIC_APP_PRIMARY_CATEGORY || "social",
      tags: process.env.NEXT_PUBLIC_APP_TAGS ? process.env.NEXT_PUBLIC_APP_TAGS.split(',') : ["social", "wagmi", "non-profit"],
      tagline: process.env.NEXT_PUBLIC_APP_TAGLINE || "Generosity, Onchain.",
      ogTitle: process.env.NEXT_PUBLIC_APP_OG_TITLE || "G1VE - Scan. Donate. WAGMI.",
      ogDescription: process.env.NEXT_PUBLIC_APP_OG_DESCRIPTION || "Support public goods, build your streak, and grow your impact.",
      ogImageUrl: process.env.NEXT_PUBLIC_APP_OG_IMAGE || "https://miniapp.g1ve.xyz/frame-image.png",
    }),
  };

  res.setHeader('Content-Type', 'application/json');
  res.status(200).json(manifest);
} 