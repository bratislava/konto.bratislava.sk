import {
  ChecklistItem,
  ChecklistItemProps,
} from '@/src/components/page-contents/Stepper/ChecklistItem'

export type ChecklistProps = {
  order: number
  title?: string | null
  description?: string | null
  checklistItems?: ChecklistItemProps[] | null
}

export const Checklist = ({ order, title, description, checklistItems }: ChecklistProps) => {
  const NumberedOrderComponent = () => {
    return (
      <div
        className="flex items-center justify-center rounded-full bg-white font-mono font-bold text-gray-700"
        style={{ height: '100px', width: '100px', fontSize: '40px' }}
      >
        {order}
      </div>
    )
  }

  return (
    <div className="flex flex-row gap-2">
      <NumberedOrderComponent />

      <div className="flex flex-col gap-2">
        <h3 className="text-size-p-large font-bold">{title}</h3>
        <div className="text-size-p-large">{description}</div>
        <div className="flex flex-col gap-2">
          {checklistItems?.map((item) => (
            <ChecklistItem key={item.title} {...item} />
          ))}
        </div>
      </div>
    </div>
  )
}
