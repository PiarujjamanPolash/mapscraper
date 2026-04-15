import axios from "axios";

/**
 * Extract email addresses from a website URL
 * Crawls the main page + common subpages for contact info
 */
export async function extractEmails(websiteUrl: string): Promise<string[]> {
  const emails = new Set<string>();

  const pagesToCheck = [
    websiteUrl,
    `${websiteUrl}/contact`,
    `${websiteUrl}/about`,
    `${websiteUrl}/contacto`,
    `${websiteUrl}/sobre-nosotros`,
  ];

  for (const pageUrl of pagesToCheck) {
    try {
      const response = await axios.get(pageUrl, {
        timeout: 5000,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; LeadBot/1.0)",
        },
        maxRedirects: 3,
        validateStatus: (status) => status < 400,
      });

      if (typeof response.data === "string") {
        const found = extractEmailsFromText(response.data);
        found.forEach((email) => emails.add(email.toLowerCase()));
      }
    } catch {
      // Skip pages that fail to load
      continue;
    }
  }

  // Filter out common false positives
  return Array.from(emails).filter(
    (email) =>
      !email.includes("example.com") &&
      !email.includes("sentry.") &&
      !email.includes("wixpress.com") &&
      !email.includes(".png") &&
      !email.includes(".jpg") &&
      !email.endsWith(".js") &&
      !email.endsWith(".css") &&
      email.length < 60
  );
}

/**
 * Extract emails from raw HTML/text using regex
 */
function extractEmailsFromText(text: string): string[] {
  const emailRegex =
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const matches = text.match(emailRegex);
  return matches ? Array.from(new Set(matches)) : [];
}

/**
 * Detect WhatsApp links from HTML
 */
export function extractWhatsApp(html: string): string | null {
  const waRegex = /(?:wa\.me|api\.whatsapp\.com\/send\?phone=)\/?([\d+]+)/;
  const match = html.match(waRegex);
  return match ? match[1] : null;
}
