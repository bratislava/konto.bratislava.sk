type AccountSectionHeaderBase = {
  title: string
  text?: string
  /** This is used when page contains other h1, such as homepage */
  titleAsParagraph?: boolean
}

const AccountSectionHeader = (props: AccountSectionHeaderBase) => {
  const { title, text, titleAsParagraph } = props
  return (
    <div className="bg-gray-50">
      <span className="m-auto flex size-full max-w-(--breakpoint-lg) flex-col justify-end py-6 pl-4 lg:px-0 lg:py-16">
        {titleAsParagraph ? (
          <p className="text-h1">{title}</p>
        ) : (
          <h1 className="text-h1">{title}</h1>
        )}
        {text && <p className="mt-3 text-p1">{text}</p>}
      </span>
    </div>
  )
}

export default AccountSectionHeader
