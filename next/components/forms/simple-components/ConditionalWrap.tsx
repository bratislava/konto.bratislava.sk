import { PropsWithChildren, ReactNode } from 'react'

type ConditionalWrapProps = PropsWithChildren<{
  condition: boolean
  wrap: (children: ReactNode) => ReactNode
}>

const ConditionalWrap = ({ condition, children, wrap }: ConditionalWrapProps) => {
  return condition ? wrap(children) : children
}

export default ConditionalWrap
