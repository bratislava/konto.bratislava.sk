const mockPublish = jest.fn().mockResolvedValue({})

class AmqpConnection {
  publish = mockPublish
}

class Nack {
  constructor(requeue) {
    this.requeue = requeue
  }
}

const rabbitRpcDecorator = (target, propertyKey, descriptor) => descriptor
const RabbitRPC = () => rabbitRpcDecorator

const rabbitSubscribeDecorator = (target, propertyKey, descriptor) => descriptor
const RabbitSubscribe = () => rabbitSubscribeDecorator

export { AmqpConnection, mockPublish, Nack, RabbitRPC, RabbitSubscribe }
