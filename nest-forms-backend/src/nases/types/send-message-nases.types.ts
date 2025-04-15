export enum SendMessageNasesMethodType {
  Self = 'Self', // TODO better name
  Eid = 'Eid',
}

export type SendMessageNasesMethod =
  | {
      type: SendMessageNasesMethodType.Self
    }
  | {
      type: SendMessageNasesMethodType.Eid
      senderUri: string
    }
