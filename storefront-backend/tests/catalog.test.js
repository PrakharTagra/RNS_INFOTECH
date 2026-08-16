const request = require("supertest");

jest.mock("../src/models/Category");
jest.mock("../src/models/Product");

const createApp = require("../src/app");
const Category = require("../src/models/Category");
const Product = require("../src/models/Product");

const app = createApp();

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET /api/categories", () => {
  it("is public — no Authorization header required", async () => {
    Category.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });

    const res = await request(app).get("/api/categories");

    expect(res.status).toBe(200);
  });

  it("only queries active categories", async () => {
    const sort = jest.fn().mockResolvedValue([{ _id: "c1", name: "Pen Tablets" }]);
    Category.find.mockReturnValue({ sort });

    const res = await request(app).get("/api/categories");

    expect(res.status).toBe(200);
    expect(Category.find).toHaveBeenCalledWith({ isActive: true });
    expect(res.body.items).toHaveLength(1);
  });
});

describe("GET /api/categories/:slug", () => {
  it("returns 404 for an inactive or unknown category", async () => {
    Category.findOne.mockResolvedValue(null);

    const res = await request(app).get("/api/categories/discontinued-line");

    expect(res.status).toBe(404);
  });

  it("returns the category by slug", async () => {
    Category.findOne.mockResolvedValue({ _id: "c1", slug: "pen-tablets", name: "Pen Tablets" });

    const res = await request(app).get("/api/categories/pen-tablets");

    expect(res.status).toBe(200);
    expect(Category.findOne).toHaveBeenCalledWith({ slug: "pen-tablets", isActive: true });
    expect(res.body.category.slug).toBe("pen-tablets");
  });
});

describe("GET /api/products", () => {
  it("always forces isActive: true regardless of query params", async () => {
    const populate = jest.fn().mockReturnThis();
    const sort = jest.fn().mockReturnThis();
    const skip = jest.fn().mockReturnThis();
    const limit = jest.fn().mockResolvedValue([]);
    Product.find.mockReturnValue({ populate, sort, skip, limit });
    Product.countDocuments.mockResolvedValue(0);

    const res = await request(app).get("/api/products").query({ isActive: "false" });

    expect(res.status).toBe(200);
    expect(Product.find).toHaveBeenCalledWith(expect.objectContaining({ isActive: true }));
  });

  it("resolves a category slug filter to an id before querying products", async () => {
    Category.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue({ _id: "c1" }) });
    const populate = jest.fn().mockReturnThis();
    const sort = jest.fn().mockReturnThis();
    const skip = jest.fn().mockReturnThis();
    const limit = jest.fn().mockResolvedValue([]);
    Product.find.mockReturnValue({ populate, sort, skip, limit });
    Product.countDocuments.mockResolvedValue(0);

    const res = await request(app).get("/api/products").query({ category: "pen-tablets" });

    expect(res.status).toBe(200);
    expect(Product.find).toHaveBeenCalledWith(expect.objectContaining({ category: "c1" }));
  });

  it("returns an empty result set for an unknown category filter instead of an error", async () => {
    Category.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });
    const populate = jest.fn().mockReturnThis();
    const sort = jest.fn().mockReturnThis();
    const skip = jest.fn().mockReturnThis();
    const limit = jest.fn().mockResolvedValue([]);
    Product.find.mockReturnValue({ populate, sort, skip, limit });
    Product.countDocuments.mockResolvedValue(0);

    const res = await request(app).get("/api/products").query({ category: "does-not-exist" });

    expect(res.status).toBe(200);
    expect(Product.find).toHaveBeenCalledWith(expect.objectContaining({ category: null }));
  });

  it("rejects an invalid sort value with 400", async () => {
    const res = await request(app).get("/api/products").query({ sort: "cheapest-first" });
    expect(res.status).toBe(400);
  });
});

describe("GET /api/products/:slug", () => {
  it("returns 404 for an inactive or unknown product", async () => {
    Product.findOne.mockReturnValue({ populate: jest.fn().mockResolvedValue(null) });

    const res = await request(app).get("/api/products/discontinued-tablet");

    expect(res.status).toBe(404);
  });

  it("returns the product by slug", async () => {
    Product.findOne.mockReturnValue({
      populate: jest.fn().mockResolvedValue({ _id: "p1", slug: "wave-pen-tablet", name: "Wave Pen Tablet" }),
    });

    const res = await request(app).get("/api/products/wave-pen-tablet");

    expect(res.status).toBe(200);
    expect(res.body.product.slug).toBe("wave-pen-tablet");
  });
});
