import { Typography } from '@bratislava/component-library'
import { useState } from 'react'

import { ChevronDownIcon } from '@/src/assets/ui-icons'
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
  const [isOpen, setIsOpen] = useState(order === 1)
  const NumberedOrderComponent = () => {
    return (
      <div
        className="flex items-center justify-center rounded-full bg-black font-bold text-white"
        style={{ height: '40px', width: '40px', fontSize: '16px' }}
      >
        {order}
      </div>
    )
  }

  return (
    <div className="flex flex-row justify-between gap-2">
      <div className="flex flex-row gap-4">
        <NumberedOrderComponent />

        <div className="flex flex-col gap-2">
          <Typography variant="h3" className="font-bold">
            {title}
          </Typography>
          <Typography variant="p-default">{description}</Typography>

          {isOpen && (
            <div className="flex flex-col gap-2">
              {checklistItems?.map((item) => (
                <ChecklistItem key={item.title} {...item} />
              ))}
            </div>
          )}
        </div>
      </div>
      <button className="flex items-start" onClick={() => setIsOpen(!isOpen)}>
        <ChevronDownIcon className="size-6" />
      </button>
    </div>
  )
}
