import { FC, forwardRef, ReactNode, useEffect, useRef, useState } from 'react'

export type SlideComponent<P extends Record<string, any> = {}> = FC<{
  status: 'active'|'next'|'prev'
} & P>
export type SC<P extends Record<string, any> = {}> = SlideComponent<P>

export type ActiveHandler = (...args: any) => (void|(() => void))

const Slide = forwardRef<
  HTMLElement,
  {
    name: string,
    onActive?: ActiveHandler,
    status?: 'active' | 'next' | 'prev',
    children: ReactNode
  }
>((props, ref) => {
  const oldStatus = useRef<typeof props['status']|undefined>(undefined)
  const onInactive = useRef<() => void|undefined>()

  useEffect(() => {
    if (props.onActive !== undefined) {
      if (props.status === 'active' && oldStatus.current !== 'active') {
        const callback = props.onActive()
        if (typeof callback === 'function') onInactive.current = callback
        oldStatus.current = 'active'
      }
      if (props.status !== 'active' && oldStatus.current === 'active') {
        onInactive.current?.()
        onInactive.current = undefined
        oldStatus.current = props.status
      }
    }
  }, [props, props.onActive, props.status])

  const articlePropsSetter = () => {
    return Object.fromEntries(
      Object.entries({
        ...props,
        className: `slide slide-${props.name}`,
        'data-status': props.status ?? 'next'
      } as typeof props & { className: string, 'data-status': string }).filter(([key]) => !['name', 'status', 'onActive', 'children'].some(it => it === key))
    ) as Omit<typeof props, 'name' | 'status' | 'onActive' | 'children'> & {
      className: string,
      'data-status': string
    }
  }

  const [articleProps, setArticleProps] = useState(articlePropsSetter)

  useEffect(() => setArticleProps(articlePropsSetter), [props])  // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <article {...articleProps} ref={ref}>
      <div className="slide-wrapper">
        {props.children}
      </div>
    </article>
  )
})

export default Slide