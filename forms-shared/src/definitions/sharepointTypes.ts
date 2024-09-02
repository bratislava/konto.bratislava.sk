export type SharepointColumnMapValue =
  | {
      type: 'json_path'
      info: string
    }
  | {
      type: 'mag_number' | 'title'
    }

export type SharepointRelationData = {
  databaseName: string
  originalTableId: string
  columnMap: Record<string, SharepointColumnMapValue>
}

export type SharepointData = {
  databaseName: string
  columnMap: Record<string, SharepointColumnMapValue>
  oneToMany?: Record<string, SharepointRelationData>
  oneToOne?: Record<string, SharepointRelationData>
}
