const scrapers = require('./scraper')
const fs = require('fs')

const scrapeController = async (browserInstance) => {
    const url = 'https://digital-world-2.myshopify.com/'
    try {
        let browser = await browserInstance
        // gọi hàm cạo ở file s scrape
        const categories = await scrapers.scrapeCategory(browser, url)
        // console.log(categories);
        categories.forEach(async (category) => {
            const items = await scrapers.scrapeItems(browser, category.link)
            console.log(items);
            // items.forEach(async (item) => {
            //     const rs = await scrapers.scraper(browser, item)
            //     fs.writeFile('ecommerce.json', JSON.stringify({ [category]: rs }), (err) => {
            //         if (err) console.log('Ghi data vô file json thất bại: ' + err)
            //         console.log('Thêm data thanh công !.')
            //     })
            // })
        })
        await browser.close()
    } catch (e) {
        console.log('Lỗi ở scrape controller: ' + e);
    }
}

module.exports = scrapeController