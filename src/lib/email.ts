/**
 * src/lib/email.ts
 *
 * Central email helper using the Resend SDK.
 * Sender: onboarding@resend.dev (Resend's shared sandbox domain).
 *
 * All functions are fire-and-forget safe: they catch and log errors internally
 * and never throw. Bilingual emails: German (default) + English subtitle.
 */

import { Resend } from "resend";

const FROM = "ChildCompass <onboarding@resend.dev>";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

// ─── sendBookingRequestEmail ──────────────────────────────────────────────────
// Sent to provider when a parent creates a new booking request.

export async function sendBookingRequestEmail(
  to: string,
  data: {
    providerName: string;
    parentName: string;
    childName: string;
    listingTitle: string;
    message?: string;
    dashboardUrl: string;
  }
): Promise<void> {
  try {
    const text = [
      `Neue Buchungsanfrage — New Booking Request`,
      ``,
      `Hallo ${data.providerName},`,
      ``,
      `Sie haben eine neue Buchungsanfrage erhalten.`,
      `(You have received a new booking request.)`,
      ``,
      `Angebot / Listing:  ${data.listingTitle}`,
      `Kind / Child:       ${data.childName}`,
      `Elternteil / Parent:${data.parentName}`,
      data.message ? `Nachricht / Message: ${data.message}` : "",
      ``,
      `Bitte antworten Sie über Ihr Dashboard:`,
      `(Please respond via your dashboard:)`,
      data.dashboardUrl,
      ``,
      `Mit freundlichen Grüßen,`,
      `Das ChildCompass-Team`,
    ]
      .filter((line) => line !== undefined)
      .join("\n");

    await getResend().emails.send({
      from: FROM,
      to,
      subject: `Neue Buchungsanfrage: ${data.listingTitle}`,
      text,
    });
  } catch (err) {
    console.error("[email] sendBookingRequestEmail failed", err);
  }
}

// ─── sendBookingConfirmedEmail ────────────────────────────────────────────────
// Sent to parent when a provider confirms their booking.

export async function sendBookingConfirmedEmail(
  to: string,
  data: {
    parentName: string;
    childName: string;
    listingTitle: string;
    providerName: string;
    dashboardUrl: string;
  }
): Promise<void> {
  try {
    const text = [
      `Buchung bestätigt — Booking Confirmed`,
      ``,
      `Hallo ${data.parentName},`,
      ``,
      `Ihre Buchungsanfrage wurde bestätigt!`,
      `(Your booking request has been confirmed!)`,
      ``,
      `Angebot / Listing:  ${data.listingTitle}`,
      `Anbieter / Provider:${data.providerName}`,
      `Kind / Child:       ${data.childName}`,
      ``,
      `Details finden Sie in Ihrem Dashboard:`,
      `(Find details in your dashboard:)`,
      data.dashboardUrl,
      ``,
      `Mit freundlichen Grüßen,`,
      `Das ChildCompass-Team`,
    ].join("\n");

    await getResend().emails.send({
      from: FROM,
      to,
      subject: `Buchung bestätigt: ${data.listingTitle}`,
      text,
    });
  } catch (err) {
    console.error("[email] sendBookingConfirmedEmail failed", err);
  }
}

// ─── sendBookingDeclinedEmail ─────────────────────────────────────────────────
// Sent to parent when a provider declines their booking.

export async function sendBookingDeclinedEmail(
  to: string,
  data: {
    parentName: string;
    childName: string;
    listingTitle: string;
    providerName: string;
  }
): Promise<void> {
  try {
    const text = [
      `Buchung abgelehnt — Booking Declined`,
      ``,
      `Hallo ${data.parentName},`,
      ``,
      `Leider wurde Ihre Buchungsanfrage abgelehnt.`,
      `(Unfortunately your booking request has been declined.)`,
      ``,
      `Angebot / Listing:  ${data.listingTitle}`,
      `Anbieter / Provider:${data.providerName}`,
      `Kind / Child:       ${data.childName}`,
      ``,
      `Sie können weitere Angebote auf ChildCompass entdecken.`,
      `(You can discover more listings on ChildCompass.)`,
      ``,
      `Mit freundlichen Grüßen,`,
      `Das ChildCompass-Team`,
    ].join("\n");

    await getResend().emails.send({
      from: FROM,
      to,
      subject: `Buchung abgelehnt: ${data.listingTitle}`,
      text,
    });
  } catch (err) {
    console.error("[email] sendBookingDeclinedEmail failed", err);
  }
}

// ─── sendBookingCancelledEmail ────────────────────────────────────────────────
// Sent to provider when a parent cancels their booking.

export async function sendBookingCancelledEmail(
  to: string,
  data: {
    providerName: string;
    parentName: string;
    childName: string;
    listingTitle: string;
  }
): Promise<void> {
  try {
    const text = [
      `Buchung storniert — Booking Cancelled`,
      ``,
      `Hallo ${data.providerName},`,
      ``,
      `Eine Buchung wurde storniert.`,
      `(A booking has been cancelled.)`,
      ``,
      `Angebot / Listing:  ${data.listingTitle}`,
      `Kind / Child:       ${data.childName}`,
      `Elternteil / Parent:${data.parentName}`,
      ``,
      `Mit freundlichen Grüßen,`,
      `Das ChildCompass-Team`,
    ].join("\n");

    await getResend().emails.send({
      from: FROM,
      to,
      subject: `Buchung storniert: ${data.listingTitle}`,
      text,
    });
  } catch (err) {
    console.error("[email] sendBookingCancelledEmail failed", err);
  }
}
