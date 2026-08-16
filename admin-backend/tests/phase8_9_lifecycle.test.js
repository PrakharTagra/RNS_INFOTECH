const mongoose = require("mongoose");

jest.mock("../src/models/Order");

const Order = require("../src/models/Order");
const { canTransition, transitionOrder } = require("../src/services/orderLifecycle.service");

describe("Phase 8 order lifecycle", () => {
  beforeEach(() => jest.clearAllMocks());

  test("allows only the canonical next transition", () => {
    expect(canTransition("pending", "confirmed")).toBe(true);
    expect(canTransition("confirmed", "packed")).toBe(true);
    expect(canTransition("packed", "shipped")).toBe(true);
    expect(canTransition("shipped", "delivered")).toBe(false);
    expect(canTransition("delivered", "packed")).toBe(false);
  });

  test("transition records timestamp/history and saves when using a mocked model", async () => {
    const save = jest.fn().mockResolvedValue(true);
    const order = { _id: new mongoose.Types.ObjectId(), status: "confirmed", statusHistory: [], save };
    Order.findOneAndUpdate.mockResolvedValue(undefined);

    const updated = await transitionOrder(order, "packed", { actorType: "admin", actorId: order._id, note: "Packed" });

    expect(updated.status).toBe("packed");
    expect(updated.packedAt).toBeInstanceOf(Date);
    expect(updated.statusHistory).toHaveLength(1);
    expect(updated.statusHistory[0].status).toBe("packed");
    expect(save).toHaveBeenCalled();
  });
});
