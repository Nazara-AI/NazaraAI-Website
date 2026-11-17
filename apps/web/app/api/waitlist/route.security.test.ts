import { describe, it, expect, vi, beforeEach } from "vitest";

const sendMock = vi.hoisted(() => vi.fn());

vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(function Resend() {
    return { emails: { send: sendMock } };
  }),
}));

import { POST } from "./route";

function rawRequest(body: string) {
  return new Request("http://localhost/api/waitlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
}
const jsonRequest = (body: unknown) => rawRequest(JSON.stringify(body));
const sheetBody = () => JSON.parse((fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body);

describe("POST /api/waitlist — security", () => {
  beforeEach(() => {
    sendMock.mockReset();
    sendMock.mockResolvedValue({ data: { id: "email-id" }, error: null });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 200 })));
  });

  describe("HTML injection into the notification email", () => {
    it("escapes HTML in every field", async () => {
      const res = await POST(
        jsonRequest({
          fullName: '<a href="https://evil.example">Click</a>',
          email: "ada@example.com",
          company: "<script>alert(1)</script><img src=x onerror=alert(1)>",
        })
      );
      expect(res.status).toBe(200);
      const { html } = sendMock.mock.calls[0][0];
      expect(html).not.toContain("<a ");
      expect(html).not.toContain("<script>");
      expect(html).not.toContain("<img");
      expect(html).toContain("&lt;a href=&quot;https://evil.example&quot;&gt;");
      expect(html).toContain("&lt;script&gt;");
    });

    it("strips CR/LF so the subject cannot carry injected header lines", async () => {
      await POST(jsonRequest({ fullName: "Ada\r\nBcc: victim@example.com", email: "ada@example.com" }));
      const { subject } = sendMock.mock.calls[0][0];
      expect(subject).not.toMatch(/[\r\n]/);
    });
  });

  describe("formula injection into the Google Sheet", () => {
    it.each(["=HYPERLINK(\"https://evil.example\")", "+1+1", "-2+3", "@SUM(A1)"])(
      "neutralises a value starting with %s",
      async (payload) => {
        await POST(jsonRequest({ fullName: payload, email: "ada@example.com", company: payload }));
        const body = sheetBody();
        expect(body.fullName).toBe(`'${payload}`);
        expect(body.company).toBe(`'${payload}`);
      }
    );

    it("leaves ordinary values untouched", async () => {
      await POST(jsonRequest({ fullName: "Ada Lovelace", email: "ada@example.com", company: "Acme" }));
      expect(sheetBody()).toEqual({ fullName: "Ada Lovelace", email: "ada@example.com", company: "Acme" });
    });
  });

  describe("input validation", () => {
    it("returns 400 (not a crash) for malformed JSON", async () => {
      const res = await POST(rawRequest("{not json"));
      expect(res.status).toBe(400);
      expect((await res.json()).error).toBe("Invalid JSON");
    });

    it.each([null, [], "string", 42])("rejects a non-object body: %j", async (body) => {
      const res = await POST(jsonRequest(body));
      expect(res.status).toBe(400);
    });

    it.each([
      { fullName: { $ne: "" }, email: "ada@example.com" },
      { fullName: ["Ada"], email: "ada@example.com" },
      { fullName: "Ada", email: { toString: "x" } },
      { fullName: "Ada", email: "ada@example.com", company: 123 },
    ])("rejects non-string fields: %j", async (body) => {
      const res = await POST(jsonRequest(body));
      expect(res.status).toBe(400);
      expect(sendMock).not.toHaveBeenCalled();
    });

    it("rejects whitespace-only required fields", async () => {
      const res = await POST(jsonRequest({ fullName: "   ", email: "ada@example.com" }));
      expect(res.status).toBe(400);
    });

    it.each(["not-an-email", "a@b", "a b@example.com", "<x>@example.com", "ada@example.com\r\nBcc: x@y.z"])(
      "rejects invalid email %j",
      async (email) => {
        const res = await POST(jsonRequest({ fullName: "Ada", email }));
        expect(res.status).toBe(400);
        expect(sendMock).not.toHaveBeenCalled();
      }
    );

    it("rejects overly long fields", async () => {
      const res = await POST(jsonRequest({ fullName: "A".repeat(500), email: "ada@example.com" }));
      expect(res.status).toBe(400);
      expect((await res.json()).error).toBe("Field too long");
    });

    it("rejects oversized request bodies with 413", async () => {
      const res = await POST(jsonRequest({ fullName: "Ada", email: "ada@example.com", pad: "x".repeat(10_000) }));
      expect(res.status).toBe(413);
      expect(sendMock).not.toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    it("does not leak internal error details to the client", async () => {
      sendMock.mockRejectedValueOnce(new Error("RESEND_API_KEY=re_secret123 is invalid"));
      const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const res = await POST(jsonRequest({ fullName: "Ada", email: "ada@example.com" }));
      const text = await res.text();
      expect(res.status).toBe(500);
      expect(text).not.toContain("re_secret123");
      expect(text).not.toContain("RESEND_API_KEY");
      errSpy.mockRestore();
    });
  });
});
