type AccountSectionHeaderBase = {
  title: string
  text?: string
}

const AccountSectionHeader = (props: AccountSectionHeaderBase) => {
  const { title, text } = props
  return (
    <div className="bg-gray-50">
      <span className="m-auto flex h-full w-full max-w-screen-lg flex-col justify-end py-6 pl-4 lg:px-0 lg:py-16">
        <h1 className="text-h1">{title}</h1>
        {text && <p className="text-p1 mt-3">{text}</p>}
      </span>
    </div>
  )
}

export default AccountSectionHeader
