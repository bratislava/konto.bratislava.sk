export default function rabbitmqRequeueDelay(
  requeueNumber: number,
): number | false {
  if (requeueNumber === 1) {
    return 120_000
  }
  return 3_600_000
  // if (requeueNumber < 4) {
  //   return 120_000
  // }
  // if (requeueNumber === 4) {
  //   return 600_000
  // }
  // if (requeueNumber === 5) {
  //   return 1_800_000
  // }
  // if (requeueNumber === 6) {
  //   return 3_600_000
  // }
  // if (requeueNumber === 7) {
  //   return 7_200_000
  // }
  // if (requeueNumber === 8) {
  //   return 43_200_000
  // }
  // if (requeueNumber === 9) {
  //   return 86_400_000
  // }
  // return false
}
