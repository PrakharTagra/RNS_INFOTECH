const request = require("supertest");

jest.mock("../src/models/AdminUser");
jest.mock("../src/models/Order");
jest.mock("../src/models/Product");
jest.mock("../src/models/Payment");
jest.mock("../src/services/inventory.service");
jest.mock("../src/services/coupon.service");

const createApp = require("../src/app");
const AdminUser = require("../src/models/AdminUser");
const Order = require("../src/models/Order");
const Product = require("../src/models/Product");
const Payment = require("../src/models/Payment");
const { releaseOrderStock } = require("../src/services/inventory.service");
const { releaseCoupon } = require("../src/services/coupon.service");
const { signAccessToken } = require("../src/services/token.service");

AdminUser.ROLES = ["Owner", "Manager", "Staff"];

const app = createApp();
const authHeader = `Bearer ${signAccessToken("admin123", "Owner")}`;

beforeEach(() => {
  jest.clearAllMocks();
  releaseOrderStock.mockResolvedValue(true);
  releaseCoupon.mockResolvedValue(true);
  AdminUser.findById.mockResolvedValue({ _id: "admin123", isActive: true, role: "Owner" });
});

describe("orders router auth", () => {
  it("rejects a request with no Authorization header", async () => {
    const res = await request(app).get("/api/orders");
    expect(res.status).toBe(401);
  });
});

describe("GET /api/orders", () => {
  it("lists orders with pagination, populated customer info, and a payment status", async () => {
    const orderDoc = {
      _id: "o1",
      status: "pending",
      toJSON: () => ({ _id: "o1", status: "pending" }),
    };
    const populate = jest.fn().mockReturnThis();
    const sort = jest.fn().mockReturnThis();
    const skip = jest.fn().mockReturnThis();
    const limit = jest.fn().mockResolvedValue([orderDoc]);
    Order.find.mockReturnValue({ populate, sort, skip, limit });
    Order.countDocuments.mockResolvedValue(1);
    Payment.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([{ order: "o1", status: "paid" }]) });

    const res = await request(app).get("/api/orders").set("Authorization", authHeader);

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(populate).toHaveBeenCalledWith("user", "name email");
    expect(res.body.items[0].paymentStatus).toBe("paid");
  });

  it("treats a non-id search string as a guaranteed-empty filter instead of erroring", async () => {
    const populate = jest.fn().mockReturnThis();
    const sort = jest.fn().mockReturnThis();
    const skip = jest.fn().mockReturnThis();
    const limit = jest.fn().mockResolvedValue([]);
    Order.find.mockReturnValue({ populate, sort, skip, limit });
    Order.countDocuments.mockResolvedValue(0);

    const res = await request(app).get("/api/orders").query({ search: "not-an-id" }).set("Authorization", authHeader);

    expect(res.status).toBe(200);
    expect(Order.find).toHaveBeenCalledWith(expect.objectContaining({ _id: null }));
  });
});

describe("GET /api/orders/:id", () => {
  it("returns 404 for an unknown order", async () => {
    Order.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(null) });

    const res = await request(app).get("/api/orders/o1").set("Authorization", authHeader);

    expect(res.status).toBe(404);
  });

  it("returns the order with an \"unpaid\" paymentStatus when it has no Payment yet", async () => {
    Order.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValue({
        _id: "o1",
        toJSON: () => ({ _id: "o1" }),
      }),
    });
    Payment.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });

    const res = await request(app).get("/api/orders/o1").set("Authorization", authHeader);

    expect(res.status).toBe(200);
    expect(res.body.order.paymentStatus).toBe("unpaid");
  });
});

describe("POST /api/orders/:id/confirm", () => {
  it("returns 404 for an unknown order", async () => {
    Order.findById.mockResolvedValue(null);

    const res = await request(app).post("/api/orders/o1/confirm").set("Authorization", authHeader);

    expect(res.status).toBe(404);
  });

  it("rejects confirming an order that isn't pending", async () => {
    Order.findById.mockResolvedValue({ _id: "o1", status: "shipped", save: jest.fn() });

    const res = await request(app).post("/api/orders/o1/confirm").set("Authorization", authHeader);

    expect(res.status).toBe(409);
  });

  it("confirms a pending order", async () => {
    const save = jest.fn().mockResolvedValue(true);
    const order = { _id: "o1", status: "pending", save };
    Order.findById.mockResolvedValue(order);

    const res = await request(app).post("/api/orders/o1/confirm").set("Authorization", authHeader);

    expect(res.status).toBe(200);
    expect(order.status).toBe("confirmed");
    expect(order.confirmedAt).toBeInstanceOf(Date);
    expect(save).toHaveBeenCalled();
  });
});

describe("POST /api/orders/:id/pack", () => {
  it("packs a confirmed order", async () => {
    const save = jest.fn().mockResolvedValue(true);
    const order = { _id: "o1", status: "confirmed", save };
    Order.findById.mockResolvedValue(order);
    const res = await request(app).post("/api/orders/o1/pack").set("Authorization", authHeader).send({});
    expect(res.status).toBe(200);
    expect(order.status).toBe("packed");
    expect(order.packedAt).toBeInstanceOf(Date);
  });
});

describe("POST /api/orders/:id/ship", () => {
  it("rejects a missing courierName/trackingId with 400", async () => {
    const res = await request(app).post("/api/orders/o1/ship").set("Authorization", authHeader).send({});
    expect(res.status).toBe(400);
  });

  it("rejects shipping an order that isn't confirmed", async () => {
    Order.findById.mockResolvedValue({ _id: "o1", status: "pending", save: jest.fn() });

    const res = await request(app)
      .post("/api/orders/o1/ship")
      .set("Authorization", authHeader)
      .send({ courierName: "BlueDart", trackingId: "BD12345" });

    expect(res.status).toBe(409);
  });

  it("ships a confirmed order with the given courier/tracking id", async () => {
    const save = jest.fn().mockResolvedValue(true);
    const order = { _id: "o1", status: "packed", save };
    Order.findById.mockResolvedValue(order);

    const res = await request(app)
      .post("/api/orders/o1/ship")
      .set("Authorization", authHeader)
      .send({ courierName: "BlueDart", trackingId: "BD12345" });

    expect(res.status).toBe(200);
    expect(order.status).toBe("shipped");
    expect(order.courierName).toBe("BlueDart");
    expect(order.trackingId).toBe("BD12345");
    expect(save).toHaveBeenCalled();
  });
});

describe("POST /api/orders/:id/cancel", () => {
  it("rejects cancelling a shipped order", async () => {
    Order.findById.mockResolvedValue({ _id: "o1", status: "shipped", items: [], save: jest.fn() });

    const res = await request(app).post("/api/orders/o1/cancel").set("Authorization", authHeader).send({});

    expect(res.status).toBe(409);
  });

  it("cancels a pending order and restores stock for every line item", async () => {
    const save = jest.fn().mockResolvedValue(true);
    const order = {
      _id: "o1",
      status: "pending",
      items: [
        { product: "p1", quantity: 2 },
        { product: "p2", quantity: 1 },
      ],
      save,
    };
    Order.findById.mockResolvedValue(order);
    Product.updateOne.mockResolvedValue({});

    const res = await request(app)
      .post("/api/orders/o1/cancel")
      .set("Authorization", authHeader)
      .send({ reason: "Customer requested cancellation" });

    expect(res.status).toBe(200);
    expect(order.status).toBe("cancelled");
    expect(order.cancelReason).toBe("Customer requested cancellation");
    expect(releaseOrderStock).toHaveBeenCalledWith(expect.objectContaining({ _id: "o1" }), expect.objectContaining({ reason: "Order cancelled" }));
  });
});
