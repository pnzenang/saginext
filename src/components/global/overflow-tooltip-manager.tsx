'use client'

import * as React from 'react'

const overflowTooltipSelector = '.truncate, [class*="line-clamp-"]'

const managedTitleAttribute = 'data-overflow-tooltip-managed'
const tooltipOwnerSelector = '[data-overflow-tooltip-owner="true"]'

const normalizeTooltipText = (value: string | null | undefined) => {
  const normalizedValue = value?.replace(/\s+/g, ' ').trim()

  return normalizedValue || undefined
}

const hasVisibleOverflow = (element: HTMLElement) =>
  element.scrollWidth > element.clientWidth + 1 || element.scrollHeight > element.clientHeight + 1

const getTooltipText = (element: HTMLElement) =>
  normalizeTooltipText(element.getAttribute('aria-label')) ?? normalizeTooltipText(element.textContent)

const OverflowTooltipManager = () => {
  React.useEffect(() => {
    const originalTitles = new WeakMap<HTMLElement, string | null>()

    let frameId = 0
    let resizeObserver: ResizeObserver | undefined

    const getCandidates = () => Array.from(document.querySelectorAll<HTMLElement>(overflowTooltipSelector))

    const applyOverflowTitle = (element: HTMLElement) => {
      if (element.closest(tooltipOwnerSelector)) return

      if (!originalTitles.has(element)) {
        originalTitles.set(element, element.getAttribute('title'))
      }

      const originalTitle = originalTitles.get(element)
      const hasExplicitTitle = normalizeTooltipText(originalTitle)

      if (hasExplicitTitle) return

      const tooltipText = getTooltipText(element)
      const isManaged = element.getAttribute(managedTitleAttribute) === 'true'

      if (tooltipText && hasVisibleOverflow(element)) {
        if (element.getAttribute('title') !== tooltipText) {
          element.setAttribute('title', tooltipText)
        }

        if (!isManaged) {
          element.setAttribute(managedTitleAttribute, 'true')
        }

        return
      }

      if (isManaged) {
        element.removeAttribute('title')
        element.removeAttribute(managedTitleAttribute)
      }
    }

    const refreshOverflowTitles = () => {
      const candidates = getCandidates()

      resizeObserver?.disconnect()

      candidates.forEach(element => {
        applyOverflowTitle(element)
        resizeObserver?.observe(element)
      })
    }

    const scheduleRefresh = () => {
      window.cancelAnimationFrame(frameId)
      frameId = window.requestAnimationFrame(refreshOverflowTitles)
    }

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(scheduleRefresh)
    }

    const mutationObserver = new MutationObserver(scheduleRefresh)

    mutationObserver.observe(document.body, {
      attributeFilter: ['aria-label', 'class', 'style', 'title'],
      attributes: true,
      characterData: true,
      childList: true,
      subtree: true
    })

    scheduleRefresh()

    return () => {
      window.cancelAnimationFrame(frameId)
      mutationObserver.disconnect()
      resizeObserver?.disconnect()
    }
  }, [])

  return null
}

export { OverflowTooltipManager }
