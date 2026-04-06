import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

// Mock LanguageSwitcher so useLang() returns { lang: "de", setLang: jest.fn() }
jest.mock("@/components/ui/LanguageSwitcher", () => ({
  useLang: () => ({ lang: "de", setLang: jest.fn() }),
}));

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

import SetupWizard from "@/app/dashboard/provider/setup/SetupWizard";

const mockProvider = {
  id: "provider-123",
  businessName: "Kita Sonnenschein",
  city: "Erfurt",
  phone: "+49 361 123456",
  description: null,
  address: null,
  website: null,
};

beforeEach(() => {
  mockFetch.mockReset();
  // Default: PATCH returns success
  mockFetch.mockResolvedValue({
    ok: true,
    json: async () => ({ data: { ...mockProvider }, error: null }),
  });
});

describe("SetupWizard", () => {
  it("renders step 1 (Welcome) on initial load", () => {
    render(<SetupWizard provider={mockProvider} />);

    // Step 1 shows the welcome heading
    expect(screen.getByText(/Willkommen/i)).toBeInTheDocument();
    // Step indicator shows step 1 of 3
    expect(screen.getByText(/1.*3/)).toBeInTheDocument();
    // Has a Start button
    expect(screen.getByRole("button", { name: /Start/i })).toBeInTheDocument();
  });

  it("clicking 'Start' advances to step 2", async () => {
    render(<SetupWizard provider={mockProvider} />);

    fireEvent.click(screen.getByRole("button", { name: /Start/i }));

    await waitFor(() => {
      expect(screen.getByText(/2.*3/)).toBeInTheDocument();
    });
  });

  it("step 2 shows description and website fields", async () => {
    render(<SetupWizard provider={mockProvider} />);

    fireEvent.click(screen.getByRole("button", { name: /Start/i }));

    await waitFor(() => {
      // Description textarea
      expect(screen.getByRole("textbox", { name: /Beschreibung|Description/i })).toBeInTheDocument();
      // Website input
      expect(screen.getByRole("textbox", { name: /Website/i })).toBeInTheDocument();
    });
  });

  it("clicking 'Next' on step 2 advances to step 3", async () => {
    render(<SetupWizard provider={mockProvider} />);

    // Advance to step 2
    fireEvent.click(screen.getByRole("button", { name: /Start/i }));

    await waitFor(() => {
      expect(screen.getByText(/2.*3/)).toBeInTheDocument();
    });

    // Fill in the required description field
    const descriptionField = screen.getByRole("textbox", { name: /Beschreibung|Description/i });
    fireEvent.change(descriptionField, { target: { value: "Wir sind eine tolle Kita in Erfurt." } });

    // Click Next
    fireEvent.click(screen.getByRole("button", { name: /Weiter|Next/i }));

    await waitFor(() => {
      expect(screen.getByText(/3.*3/)).toBeInTheDocument();
    });
  });

  it("step 3 shows address and city fields", async () => {
    render(<SetupWizard provider={mockProvider} />);

    // Advance through steps 1 and 2
    fireEvent.click(screen.getByRole("button", { name: /Start/i }));
    await waitFor(() => screen.getByText(/2.*3/));

    const descriptionField = screen.getByRole("textbox", { name: /Beschreibung|Description/i });
    fireEvent.change(descriptionField, { target: { value: "Wir sind eine tolle Kita." } });
    fireEvent.click(screen.getByRole("button", { name: /Weiter|Next/i }));

    await waitFor(() => {
      expect(screen.getByText(/3.*3/)).toBeInTheDocument();
      // Address input
      expect(screen.getByRole("textbox", { name: /Adresse|Address/i })).toBeInTheDocument();
      // City input pre-filled
      const cityInput = screen.getByRole("textbox", { name: /Stadt|City/i });
      expect(cityInput).toBeInTheDocument();
      expect(cityInput).toHaveValue("Erfurt");
    });
  });

  it("submitting step 3 calls PATCH with all collected data", async () => {
    render(<SetupWizard provider={mockProvider} />);

    // Step 1 → 2
    fireEvent.click(screen.getByRole("button", { name: /Start/i }));
    await waitFor(() => screen.getByText(/2.*3/));

    // Fill step 2
    fireEvent.change(screen.getByRole("textbox", { name: /Beschreibung|Description/i }), {
      target: { value: "Tolle Kita" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: /Website/i }), {
      target: { value: "https://kita.de" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Weiter|Next/i }));

    await waitFor(() => screen.getByText(/3.*3/));

    // Fill step 3
    fireEvent.change(screen.getByRole("textbox", { name: /Adresse|Address/i }), {
      target: { value: "Musterstraße 1" },
    });

    // Submit
    fireEvent.click(screen.getByRole("button", { name: /Speichern|Save|Fertig|Finish|Abschließen/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/providers/${mockProvider.id}`,
        expect.objectContaining({
          method: "PATCH",
          body: expect.stringContaining("Tolle Kita"),
        })
      );
    });
  });
});
