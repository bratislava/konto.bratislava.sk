// eslint-disable-next-line no-undef
const mockPublish = jest.fn().mockResolvedValue({})

class AmqpConnection {
  publish = mockPublish
}

class Nack {
  constructor(requeue) {
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
