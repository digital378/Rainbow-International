/**
 * Component-level tests for WhatsApp and Email buttons on Friendship School cards.
 *
 * These tests render the exact JSX pattern used in AdminFriendshipSchools.tsx
 * and FriendshipQRTab.tsx and assert that:
 *  - The WA anchor is present and its href encodes the correct wa.me URL
 *  - The Mail anchor is present and its href encodes the correct mailto URL
 *  - Neither button renders when the respective contact field is blank
 */

import { describe, it, expect, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { buildWhatsAppUrl, buildEmailUrl } from "@/lib/friendship-url-utils";

const ORIGIN = "https://ristest.example.com";
const TOKEN = "abc123token456def";

type School = {
  id: number;
  name: string;
  token: string;
  contactPhone?: string;
  contactEmail?: string;
};

function SchoolCardButtons({ school, origin }: { school: School; origin: string }) {
  return (
    <div>
      {school.contactPhone && (
        <a
          href={buildWhatsAppUrl(school.contactPhone, school.token, school.name, origin)}
          data-testid={`button-whatsapp-${school.id}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          WA
        </a>
      )}
      {school.contactEmail && (
        <a
          href={buildEmailUrl(school.contactEmail, school.token, school.name, origin)}
          data-testid={`button-email-${school.id}`}
        >
          Mail
        </a>
      )}
    </div>
  );
}

describe("Friendship school card — WhatsApp button", () => {
  const schoolWithPhone: School = {
    id: 10,
    name: "Sunrise Academy",
    token: TOKEN,
    contactPhone: "9876543210",
  };

  it("renders the WA anchor when contactPhone is set", () => {
    render(<SchoolCardButtons school={schoolWithPhone} origin={ORIGIN} />);
    expect(screen.getByTestId("button-whatsapp-10")).toBeInTheDocument();
  });

  it("WA anchor href contains wa.me with 91-prefixed phone", () => {
    render(<SchoolCardButtons school={schoolWithPhone} origin={ORIGIN} />);
    const link = screen.getByTestId("button-whatsapp-10");
    expect(link).toHaveAttribute("href", expect.stringContaining("wa.me/919876543210"));
  });

  it("WA anchor href encodes the portal URL including the school token", () => {
    render(<SchoolCardButtons school={schoolWithPhone} origin={ORIGIN} />);
    const link = screen.getByTestId("button-whatsapp-10");
    const href = link.getAttribute("href") ?? "";
    const decoded = decodeURIComponent(href);
    expect(decoded).toContain(`${ORIGIN}/alliances/friendship/${TOKEN}`);
  });

  it("does NOT render the WA anchor when contactPhone is absent", () => {
    const noPhone: School = { id: 11, name: "No Phone School", token: TOKEN };
    render(<SchoolCardButtons school={noPhone} origin={ORIGIN} />);
    expect(screen.queryByTestId("button-whatsapp-11")).not.toBeInTheDocument();
  });

  it("does NOT render the WA anchor when contactPhone is empty string", () => {
    const emptyPhone: School = { id: 12, name: "Empty Phone", token: TOKEN, contactPhone: "" };
    render(<SchoolCardButtons school={emptyPhone} origin={ORIGIN} />);
    expect(screen.queryByTestId("button-whatsapp-12")).not.toBeInTheDocument();
  });
});

describe("Friendship school card — Email button", () => {
  const schoolWithEmail: School = {
    id: 20,
    name: "Riverside High",
    token: TOKEN,
    contactEmail: "admin@riverside.edu",
  };

  it("renders the Mail anchor when contactEmail is set", () => {
    render(<SchoolCardButtons school={schoolWithEmail} origin={ORIGIN} />);
    expect(screen.getByTestId("button-email-20")).toBeInTheDocument();
  });

  it("Mail anchor href starts with mailto: and the correct email address", () => {
    render(<SchoolCardButtons school={schoolWithEmail} origin={ORIGIN} />);
    const link = screen.getByTestId("button-email-20");
    expect(link).toHaveAttribute("href", expect.stringContaining("mailto:admin@riverside.edu"));
  });

  it("Mail anchor href contains a subject param", () => {
    render(<SchoolCardButtons school={schoolWithEmail} origin={ORIGIN} />);
    const link = screen.getByTestId("button-email-20");
    const href = link.getAttribute("href") ?? "";
    expect(href).toContain("subject=");
  });

  it("Mail anchor href body (decoded) contains the portal URL with the school token", () => {
    render(<SchoolCardButtons school={schoolWithEmail} origin={ORIGIN} />);
    const link = screen.getByTestId("button-email-20");
    const href = link.getAttribute("href") ?? "";
    const bodyMatch = href.match(/body=([^&]*)/);
    expect(bodyMatch).toBeTruthy();
    const body = decodeURIComponent(bodyMatch![1]);
    expect(body).toContain(`${ORIGIN}/alliances/friendship/${TOKEN}`);
  });

  it("does NOT render the Mail anchor when contactEmail is absent", () => {
    const noEmail: School = { id: 21, name: "No Email School", token: TOKEN };
    render(<SchoolCardButtons school={noEmail} origin={ORIGIN} />);
    expect(screen.queryByTestId("button-email-21")).not.toBeInTheDocument();
  });

  it("does NOT render the Mail anchor when contactEmail is empty string", () => {
    const emptyEmail: School = { id: 22, name: "Empty Email", token: TOKEN, contactEmail: "" };
    render(<SchoolCardButtons school={emptyEmail} origin={ORIGIN} />);
    expect(screen.queryByTestId("button-email-22")).not.toBeInTheDocument();
  });
});

describe("Friendship school card — school with neither phone nor email", () => {
  const noContactSchool: School = {
    id: 30,
    name: "No Contact School",
    token: TOKEN,
  };

  it("renders neither WA nor Mail buttons", () => {
    render(<SchoolCardButtons school={noContactSchool} origin={ORIGIN} />);
    expect(screen.queryByTestId("button-whatsapp-30")).not.toBeInTheDocument();
    expect(screen.queryByTestId("button-email-30")).not.toBeInTheDocument();
  });
});

describe("Friendship school card — school with both phone and email", () => {
  const fullContactSchool: School = {
    id: 40,
    name: "Full Contact School",
    token: TOKEN,
    contactPhone: "9123456789",
    contactEmail: "principal@fullcontact.edu",
  };

  it("renders both WA and Mail buttons", () => {
    render(<SchoolCardButtons school={fullContactSchool} origin={ORIGIN} />);
    expect(screen.getByTestId("button-whatsapp-40")).toBeInTheDocument();
    expect(screen.getByTestId("button-email-40")).toBeInTheDocument();
  });

  it("WA href contains the 91-prefixed normalized phone", () => {
    render(<SchoolCardButtons school={fullContactSchool} origin={ORIGIN} />);
    const link = screen.getByTestId("button-whatsapp-40");
    expect(link).toHaveAttribute("href", expect.stringContaining("wa.me/919123456789"));
  });

  it("Mail href starts with the correct mailto address", () => {
    render(<SchoolCardButtons school={fullContactSchool} origin={ORIGIN} />);
    const link = screen.getByTestId("button-email-40");
    expect(link).toHaveAttribute("href", expect.stringContaining("mailto:principal@fullcontact.edu"));
  });
});
