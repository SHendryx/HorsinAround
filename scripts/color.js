'use strict'

const themes = {
  Dark: {
    nav: '#222',
    bg: '#333',
    fg: '#222',
    accent: '#FFC535',
    border: '#000',
    primaryText: '#aaa',
    secondaryText: '#000',
    tertiaryText: '#fff'
  },
  Forest: {
    nav: '#3A2B29',
    bg: '#232528',
    fg: '#232528',
    accent: '#386150',
    button: '#3A2B29',
    buttonText: '#386150',
    buttonHover: '#386150',
    buttonTextHover: '#3A2B29',
    border: '#386150',
    borderHover: '#3A2B29',
    primaryText: '#386150',
    secondaryText: '#000',
    tertiaryText: '#fff',
    inputBg: '#232528',
    inputBgFocus: '#37383B'
  },
  Light: {
    nav: '#033860',
    bg: '#fff',
    fg: '#fff',
    accent: 'cadetblue',
    button: 'cadetblue',
    buttonText: '#fff',
    buttonHover: '#F05D5E',
    buttonTextHover: '#fff',
    border: 'cadetblue',
    borderHover: 'lightblue',
    primaryText: '#000',
    secondaryText: '#fff',
    tertiaryText: '#fff',
    inputBg: '#fff',
    inputBgFocus: '#eeeef5'
  }
}

const themeList = userTheme =>
  Object.keys(themes).map(theme => {
    return { name: theme, selected: theme === userTheme ? true : false }
  })

const colorStyle = theme => {
  const color = theme !== undefined ? themes[theme] : themes.Dark
  return `
  :root {
    --nav-color: ${color.nav};
    --bg-color: ${color.bg};
    --fg-color: ${color.fg};
    --accent-color: ${color.accent};
    --border-color: ${color.border};
    --border-hover-color: ${color.borderHover};
    --button-color: ${color.button};
    --button-text-color: ${color.buttonText};
    --button-text-hover-color: ${color.buttonTextHover};
    --button-hover-color: ${color.buttonHover};
    --primary-text-color: ${color.primaryText};
    --secondary-text-color: ${color.secondaryText};
    --tertiary-text-color: ${color.tertiaryText};
    --input-bg-color: ${color.inputBg};
    --input-bg-focus-color: ${color.inputBgFocus}
  }
  `
}

module.exports = { colorStyle, themes: themeList }
