export function getConditionId(condition: string): number {
    const conditionMap: { [key: string]: number } = {
        New: 1000,
        Used: 3000,
        'For parts or not working': 7000,
    }
    return conditionMap[condition] || 3000
}

// Helper function to safely get element text
export function getElementText(element: Element, tagName: string): string {
    const node = element.getElementsByTagName(tagName)[0]
    return node?.textContent || ''
}

// Helper function to safely get number from element
export function getElementNumber(item: Element, tagName: string): number {
    const text = getElementText(item, tagName)
    return text ? parseInt(text, 10) : 0
}
