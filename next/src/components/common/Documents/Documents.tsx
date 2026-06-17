import LinkRowCard from '@/src/components/common/Documents/LinkRowCard'
import SectionHeader from '@/src/components/layouts/SectionHeader'

type FileProps = {
  title: string
  link: string
}

type Props = {
  title: string
  description: string
  files: FileProps[]
}

const Documents = ({ title, description, files }: Props) => {
  return (
    <div className="flex flex-col gap-6">
      <SectionHeader title={title} text={description} />

      <ul className="flex flex-col rounded-lg border border-border-active-default py-2">
        {files.map((file, index) => (
          <LinkRowCard
            key={file.title}
            title={file.title}
            link={file.link}
            isLastItem={index === files.length - 1}
          />
        ))}
      </ul>
    </div>
  )
}

export default Documents
