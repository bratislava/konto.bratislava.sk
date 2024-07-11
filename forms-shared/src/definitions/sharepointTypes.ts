export type SharepointColumnMapValue = {
  type: 'json_path'
  info: string
} | {
  type: 'mag_number' | 'title'
}

type SharepointRelationData = {
  databaseName: string
  tableName: string
  originalTableId: string
  columnMap: Record<string, SharepointColumnMapValue>
}

export type SharepointData = {
  databaseName: string
  tableName: string
  columnMap: Record<string, SharepointColumnMapValue>
  oneToMany?: Record<string, SharepointRelationData>
  oneToOne?: Array<SharepointRelationData>
}
