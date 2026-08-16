const request = require("supertest");

jest.mock("../src/models/ChatThread");

const createApp = require("../src/app");
const ChatThread = require("../src/models/ChatThread");
const { signGuestChatToken } = require("../src/services/chatToken.service");

const app = createApp();

describe("POST /api/chat/threads", () => {
  it("creates a new support thread for a guest customer", async () => {
    ChatThread.findOne.mockResolvedValue(null);
    ChatThread.create.mockResolvedValue({
      _id: "t1",
      threadId: "guest_abc",
      customerName: "Guest",
      customerEmail: "guest@example.com",
      status: "open",
      messages: [],
    });

    const res = await request(app)
      .post("/api/chat/threads")
      .send({ threadId: "guest_abc", customerName: "Guest", customerEmail: "guest@example.com" });

    expect(res.status).toBe(201);
    expect(ChatThread.create).toHaveBeenCalledWith(
      expect.objectContaining({
        threadId: "guest_abc",
        customerName: "Guest",
        customerEmail: "guest@example.com",
      })
    );
  });
});

describe("POST /api/chat/threads/:threadId/messages", () => {
  it("appends a customer message to an existing thread", async () => {
    ChatThread.findOne.mockResolvedValue({
      threadId: "guest_abc",
      customerName: "Guest",
      customerEmail: "guest@example.com",
      messages: [],
      save: jest.fn().mockResolvedValue(true),
    });

    const res = await request(app)
      .post("/api/chat/threads/guest_abc/messages")
      .set("x-chat-token", signGuestChatToken("guest_abc"))
      .send({ text: "Need help with delivery" });

    expect(res.status).toBe(201);
    expect(res.body.thread.messages).toHaveLength(1);
  });
});
