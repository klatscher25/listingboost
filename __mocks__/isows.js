// Mock for isows WebSocket library
module.exports = {
  WebSocket: class MockWebSocket {
    constructor(url, protocols) {
      this.url = url
      this.protocols = protocols
      this.readyState = 1 // OPEN
      this.CONNECTING = 0
      this.OPEN = 1
      this.CLOSING = 2
      this.CLOSED = 3
    }

    send() {}
    close() {}
    addEventListener() {}
    removeEventListener() {}
    dispatchEvent() {}
  },
  getNativeWebSocket: () => global.WebSocket || class MockWebSocket {},
}
