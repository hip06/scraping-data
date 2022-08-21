const startBrowser = require('./browser')
const scrapeController = require('./scrapeController')

let browser = startBrowser()
scrapeController(browser)