import * as z from 'zod'

export const PhysicalEntityUpdatedAtByRelationSchema = z.object({
  physicalEntityId: z.string(),
  birthNumber: z.string(),
})

export const PhysicalEntityUpdatedAtByRelationListSchema = z.array(
  PhysicalEntityUpdatedAtByRelationSchema
)

export type PhysicalEntityUpdatedAtByRelation = z.infer<
  typeof PhysicalEntityUpdatedAtByRelationSchema
>
export type PhysicalEntityUpdatedAtByRelationList = z.infer<
  typeof PhysicalEntityUpdatedAtByRelationListSchema
>
