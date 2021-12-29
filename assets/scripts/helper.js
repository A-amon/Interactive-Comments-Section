/**
 * Extract image filename from full path
 * @param {string} imagePath 
 * @returns {string}
 */
export const getImageName = (imagePath) => {
	const splitPath = imagePath.split('/')
	return splitPath[splitPath.length - 1]
}

/**
 * Check if text is empty string
 * @param {string} text 
 * @returns {boolean}
 */
export const isTextEmpty = (text) => {
	const textWithoutSpace = text.replace(/\s/g,'')
	return textWithoutSpace.length === 0
}

/**
 * Create HTML element from HTML code
 * @param {string} html 
 * @returns {HTMLElement}
 */
export const createElement = (html) => {
	const template = document.createElement('template')
	template.innerHTML = html
	return template.content.firstElementChild.cloneNode(true)
}