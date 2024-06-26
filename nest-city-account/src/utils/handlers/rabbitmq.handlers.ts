export const rabbitmqRequeueDelay = (requeueNumber: number): number => {
  if (requeueNumber < 4) {
    return 120000 // 2 minutes
  }
  
  return 3600000 // 1 hour
}
