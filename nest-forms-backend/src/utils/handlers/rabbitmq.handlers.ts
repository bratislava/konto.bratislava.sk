export default function rabbitmqRequeueDelay(requeueNumber: number): number {
  if (requeueNumber === 1) {
    return 120_000
  }
  return 3_600_000
}
