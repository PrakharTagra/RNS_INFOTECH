const request = require("supertest");

jest.mock("../src/models/Product");
jest.mock("../src/models/Review");

const createApp = require("../src/app");
const Product = require("../src/models/Product");
const Review = require("../src/models/Review");
const { signAccessToken } = require("../src/services/token.service");

const app = createApp();
const authHeader = `Bearer ${signAccessToken("user-123")}`;

describe("POST /api/products/:productId/reviews", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("rejects requests without a customer token", async () => {
    const res = await request(app).post("/api/products/p1/reviews").send({ rating: 5, comment: "Nice" });

    expect(res.status).toBe(401);
  });

  it("returns 404 when the product does not exist", async () => {
    Product.findById.mockResolvedValue(null);

    const res = await request(app)
      .post("/api/products/does-not-exist/reviews")
      .set("Authorization", authHeader)
      .send({ rating: 5, comment: "Great tablet" });

    expect(res.status).toBe(404);
  });

  it("creates a pending review for an existing product", async () => {
    Product.findById.mockResolvedValue({ _id: "p1", name: "Wave Tablet" });
    Review.create.mockResolvedValue({
      _id: "r1",
      product: "p1",
      user: "user-123",
      rating: 5,
      comment: "Great tablet",
      status: "pending",
    });

    const res = await request(app)
      .post("/api/products/p1/reviews")
      .set("Authorization", authHeader)
      .send({ rating: 5, comment: "Great tablet" });

    expect(res.status).toBe(201);
    expect(Review.create).toHaveBeenCalledWith(
      expect.objectContaining({
        product: "p1",
        user: "user-123",
        rating: 5,
        comment: "Great tablet",
        status: "pending",
      })
    );
  });
});
