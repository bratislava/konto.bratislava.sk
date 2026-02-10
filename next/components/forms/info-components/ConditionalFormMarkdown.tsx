import FormMarkdown, { FormMarkdownProps } from '@/components/forms/info-components/FormMarkdown'

type ConditionalFormMarkdownProps = FormMarkdownProps & {
  isMarkdown?: boolean
}

const ConditionalFormMarkdown = ({
  isMarkdown,
  children,
  ...rest
}: ConditionalFormMarkdownProps) => {
  if (isMarkdown) {
    return <FormMarkdown {...rest}>{children}</FormMarkdown>
  }
  return <>{children}</>
}

export default ConditionalFormMarkdown
