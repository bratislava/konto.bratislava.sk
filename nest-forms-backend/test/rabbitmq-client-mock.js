// eslint-disable-next-line no-undef -- jest is a global injected by the Jest test runner; not declared in this plain JS file
const mockPublish = jest.fn().mockResolvedValue({})

class AmqpConnection {
  publish = mockPublish
}

// eslint-disable-next-line @typescript-eslint/no-extraneous-class -- JavaScript mock file; class structure required to match the module API
class Nack {
  constructor(requeue) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- JavaScript file; constructor parameter is untyped by design
    this.requeue = requeue
  }
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-return -- descriptor is intentionally returned as-is in this no-op decorator mock
const rabbitRpcDecorator = (target, propertyKey, descriptor) => descriptor
const RabbitRPC = () => rabbitRpcDecorator

// eslint-disable-next-line @typescript-eslint/no-unsafe-return -- descriptor is intentionally returned as-is in this no-op decorator mock
const rabbitSubscribeDecorator = (target, propertyKey, descriptor) => descriptor
const RabbitSubscribe = () => rabbitSubscribeDecorator

export { AmqpConnection, mockPublish, Nack, RabbitRPC, RabbitSubscribe }
