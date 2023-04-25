export function renderTitle(title: string) {
    window.document.title = `Redcore - ${title}`
}

export const firstLetterCapitalize = (s: string) => s && s[0].toUpperCase() + s.slice(1)
