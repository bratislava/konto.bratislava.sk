type ColumnMapValue = {
  type: 'json_path' | 'mag_number' | 'title'
  info?: string
}

export type SharepointData = {
  databaseName: string
  tableName: string
  columnMap: Record<string, ColumnMapValue>
}
