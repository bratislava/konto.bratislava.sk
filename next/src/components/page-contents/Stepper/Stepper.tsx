import { Checklist, ChecklistProps } from '@/src/components/page-contents/Stepper/Checklist'

type Props = {
  title: string
  description: string
  checklists: ChecklistProps[]
}

export const Stepper = ({ title, description, checklists }: Props) => {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-size-h2 font-bold">{title}</h2>

      <p className="text-size-p-large">{description}</p>

      <div className="flex flex-col gap-2">
        {checklists.map((checklist, index) => (
          <>
            <Checklist key={checklist.title} {...checklist} order={index + 1} />

            {index !== checklists.length - 1 && <div className="h-px w-full bg-gray-200" />}
          </>
        ))}
      </div>
    </div>
  )
}
