import { fetchApplications, insertApplication, updateApplication, deleteApplication } from "@/lib/queries";
import { supabase } from "@/lib/supabase";

jest.mock("@/lib/supabase", () => ({
  supabase: {
    from: jest.fn(),
  },
}));

const mockFrom = supabase.from as jest.Mock;

describe("queries", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("fetchApplications", () => {
    it("fetches all applications ordered by created_at desc", async () => {
      const mockData = [{ id: "1", company_name: "Acme" }];
      const mockOrder = jest.fn().mockResolvedValue({ data: mockData, error: null });
      const mockSelect = jest.fn().mockReturnValue({ order: mockOrder });
      mockFrom.mockReturnValue({ select: mockSelect });

      const result = await fetchApplications();

      expect(mockFrom).toHaveBeenCalledWith("applications");
      expect(mockSelect).toHaveBeenCalledWith("*");
      expect(mockOrder).toHaveBeenCalledWith("created_at", { ascending: false });
      expect(result).toEqual(mockData);
    });

    it("throws on error", async () => {
      const mockOrder = jest.fn().mockResolvedValue({ data: null, error: { message: "fail" } });
      const mockSelect = jest.fn().mockReturnValue({ order: mockOrder });
      mockFrom.mockReturnValue({ select: mockSelect });

      await expect(fetchApplications()).rejects.toThrow("fail");
    });
  });

  describe("insertApplication", () => {
    it("inserts and returns the new application", async () => {
      const input = { company_name: "Acme", position: "Dev" };
      const mockSingle = jest.fn().mockResolvedValue({ data: { id: "1", ...input }, error: null });
      const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = jest.fn().mockReturnValue({ select: mockSelect });
      mockFrom.mockReturnValue({ insert: mockInsert });

      const result = await insertApplication(input as any);

      expect(mockInsert).toHaveBeenCalledWith([input]);
      expect(result).toEqual({ id: "1", ...input });
    });
  });

  describe("updateApplication", () => {
    it("updates by id and returns updated row", async () => {
      const mockSingle = jest.fn().mockResolvedValue({ data: { id: "1", status: "Offer" }, error: null });
      const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
      const mockEq = jest.fn().mockReturnValue({ select: mockSelect });
      const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ update: mockUpdate });

      const result = await updateApplication("1", { status: "Offer" } as any);

      expect(mockUpdate).toHaveBeenCalledWith({ status: "Offer" });
      expect(mockEq).toHaveBeenCalledWith("id", "1");
      expect(result).toEqual({ id: "1", status: "Offer" });
    });
  });

  describe("deleteApplication", () => {
    it("deletes by id", async () => {
      const mockEq = jest.fn().mockResolvedValue({ error: null });
      const mockDelete = jest.fn().mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ delete: mockDelete });

      await deleteApplication("1");

      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith("id", "1");
    });
  });
});
