export enum SendMessageNasesSenderType {
  Self = 'Self',
  Eid = 'Eid',
}

export type SendMessageNasesSender =
  | {
      type: SendMessageNasesSenderType.Self
    }
  | {
      type: SendMessageNasesSenderType.Eid
      senderUri: string
    }
