import {
  getApplications,
  createApplication,
  updateApplication,
  deleteApplication,
} from "@/lib/actions";

// Mock auth
jest.mock("@/lib/auth", () => ({
  auth: jest.fn(),
}));

// Mock supabase-server
jest.mock("@/lib/supabase-server", () => ({
  supabase: {
    from: jest.fn(),
  },
}));

import { auth } from "@/lib/auth";
import { supabase } from "@/lib/supabase-server";

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockFrom = supabase.from as jest.Mock;

const mockSession = {
  user: { id: "user-123", name: "Test", email: "test@test.com" },
  expires: "2099-01-01",
};

describe("Server Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getApplications", () => {
    it("throws if not authenticated", async () => {
      mockAuth.mockResolvedValue(null as any);
      await expect(getApplications()).rejects.toThrow("Not authenticated");
    });

    it("fetches applications scoped by user_id", async () => {
      mockAuth.mockResolvedValue(mockSession as any);
      const mockData = [{ id: "1", company_name: "Acme", user_id: "user-123" }];
      const mockOrder = jest.fn().mockResolvedValue({ data: mockData, error: null });
      const mockEq = jest.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ select: mockSelect });

      const result = await getApplications();

      expect(mockFrom).toHaveBeenCalledWith("applications");
      expect(mockEq).toHaveBeenCalledWith("user_id", "user-123");
      expect(result).toEqual(mockData);
    });
  });

  describe("createApplication", () => {
    it("throws if not authenticated", async () => {
      mockAuth.mockResolvedValue(null as any);
      await expect(createApplication({} as any)).rejects.toThrow("Not authenticated");
    });

    it("inserts with user_id from session", async () => {
      mockAuth.mockResolvedValue(mockSession as any);
      const input = { company_name: "Acme", position: "Dev" };
      const mockSingle = jest.fn().mockResolvedValue({ data: { id: "1", ...input, user_id: "user-123" }, error: null });
      const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = jest.fn().mockReturnValue({ select: mockSelect });
      mockFrom.mockReturnValue({ insert: mockInsert });

      const result = await createApplication(input as any);

      expect(mockInsert).toHaveBeenCalledWith([{ ...input, user_id: "user-123" }]);
      expect(result).toEqual({ id: "1", ...input, user_id: "user-123" });
    });
  });

  describe("updateApplication", () => {
    it("scopes update by user_id", async () => {
      mockAuth.mockResolvedValue(mockSession as any);
      const mockSingle = jest.fn().mockResolvedValue({ data: { id: "1", status: "Offer" }, error: null });
      const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
      const mockEqUser = jest.fn().mockReturnValue({ select: mockSelect });
      const mockEqId = jest.fn().mockReturnValue({ eq: mockEqUser });
      const mockUpdate = jest.fn().mockReturnValue({ eq: mockEqId });
      mockFrom.mockReturnValue({ update: mockUpdate });

      await updateApplication("1", { status: "Offer" } as any);

      expect(mockEqId).toHaveBeenCalledWith("id", "1");
      expect(mockEqUser).toHaveBeenCalledWith("user_id", "user-123");
    });
  });

  describe("deleteApplication", () => {
    it("scopes delete by user_id", async () => {
      mockAuth.mockResolvedValue(mockSession as any);
      const mockEqUser = jest.fn().mockResolvedValue({ error: null });
      const mockEqId = jest.fn().mockReturnValue({ eq: mockEqUser });
      const mockDelete = jest.fn().mockReturnValue({ eq: mockEqId });
      mockFrom.mockReturnValue({ delete: mockDelete });

      await deleteApplication("1");

      expect(mockEqId).toHaveBeenCalledWith("id", "1");
      expect(mockEqUser).toHaveBeenCalledWith("user_id", "user-123");
    });
  });
});
