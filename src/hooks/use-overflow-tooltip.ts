'use client'

import * as React from 'react'

const truncatedTextSelector = '.truncate, [class*="line-clamp-"]'

const normalizeTooltipText = (value: string | null | undefined) => {
  const normalizedValue = value?.replace(/\s+/g, ' ').trim()

  return normalizedValue || undefined
}

const hasTruncationClass = (element: HTMLElement) =>
  Array.from(element.classList).some(className => className === 'truncate' || className.includes('line-clamp-'))

const getTruncatedTextCandidates = (element: HTMLElement) => {
  const candidates = new Set<HTMLElement>()

  if (hasTruncationClass(element)) candidates.add(element)

  element.querySelectorAll<HTMLElement>(truncatedTextSelector).forEach(candidate => candidates.add(candidate))

  return Array.from(candidates)
}

const hasVisibleOverflow = (element: HTMLElement) =>
  element.scrollWidth > element.clientWidth + 1 || element.scrollHeight > element.clientHeight + 1

const getElementTooltipText = (element: HTMLElement) =>
  normalizeTooltipText(element.getAttribute('aria-label')) ?? normalizeTooltipText(element.textContent)

export const getExplicitTooltipText = (title: React.HTMLAttributes<HTMLElement>['title']) =>
  typeof title === 'string' ? normalizeTooltipText(title) : undefined

export const useOverflowTooltip = <TElement extends HTMLElement>(explicitTooltipText?: string) => {
  const elementRef = React.useRef<TElement>(null)

  const [tooltipState, setTooltipState] = React.useState<{ isOverflowing: boolean; tooltipText?: string }>({
    isOverflowing: false
  })

  React.useEffect(() => {
    const element = elementRef.current

    if (!element) return

    let frameId = 0
    let resizeObserver: ResizeObserver | undefined

    const updateState = (nextState: { isOverflowing: boolean; tooltipText?: string }) => {
      setTooltipState(previousState =>
        previousState.isOverflowing === nextState.isOverflowing && previousState.tooltipText === nextState.tooltipText
          ? previousState
          : nextState
      )
    }

    const checkOverflow = () => {
      const candidates = getTruncatedTextCandidates(element)
      const overflowingCandidates = candidates.filter(hasVisibleOverflow)
      const fallbackOverflow = candidates.length === 0 && hasVisibleOverflow(element)
      const isOverflowing = overflowingCandidates.length > 0 || fallbackOverflow
      const overflowElement = overflowingCandidates[0] ?? (fallbackOverflow ? element : undefined)

      const tooltipText = isOverflowing
        ? explicitTooltipText ?? (overflowElement ? getElementTooltipText(overflowElement) : getElementTooltipText(element))
        : undefined

      updateState({ isOverflowing, tooltipText })
    }

    const scheduleCheck = () => {
      window.cancelAnimationFrame(frameId)
      frameId = window.requestAnimationFrame(checkOverflow)
    }

    const observeOverflowTargets = () => {
      if (!resizeObserver) return

      resizeObserver.disconnect()
      resizeObserver.observe(element)
      getTruncatedTextCandidates(element).forEach(candidate => resizeObserver?.observe(candidate))
    }

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(scheduleCheck)
      observeOverflowTargets()
    }

    const mutationObserver = new MutationObserver(() => {
      observeOverflowTargets()
      scheduleCheck()
    })

    mutationObserver.observe(element, {
      attributeFilter: ['aria-label', 'class', 'style'],
      attributes: true,
      characterData: true,
      childList: true,
      subtree: true
    })

    scheduleCheck()

    return () => {
      window.cancelAnimationFrame(frameId)
      mutationObserver.disconnect()
      resizeObserver?.disconnect()
    }
  }, [explicitTooltipText])

  return { elementRef, ...tooltipState }
}
