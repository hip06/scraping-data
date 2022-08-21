const scrapeCategory = (browser, url) => new Promise(async (resolve, reject) => {
    try {
        let page = await browser.newPage()
        console.log('>> Mở tab mới ...');
        await page.goto(url)
        console.log('>>Truy cập vào ' + url)
        await page.waitForSelector('#webpage')
        console.log('>> Website đã laod xong...');

        const dataCategory = await page.$$eval('#navbar-menu > ul > li', els => {
            dataCategory = els.map(el => {
                return {
                    category: el.querySelector('a').innerText,
                    link: el.querySelector('a').href
                }
            })
            return dataCategory
        })
        await page.close()
        console.log('>> Tab đã đóng.');
        resolve(dataCategory)

    } catch (error) {
        console.log('lỗi ở scrape category: ' + error)
        reject(error)
    }
})

const scraper = (browser, url) => new Promise(async (resolve, reject) => {
    try {
        let newPage = await browser.newPage()
        console.log('>> Đã mở tab mới ...');
        await newPage.goto(url)
        console.log(">> Đã truy cập vào trang " + url)
        await newPage.waitForSelector('#main')
        console.log('>> Đã load xong tag main ...');

        const scrapeData = {}

        // lấy header
        const headerData = await newPage.$eval('header', (el) => {
            return {
                title: el.querySelector('h1').innerText,
                description: el.querySelector('p').innerText
            }
        })
        scrapeData.header = headerData

        // lấy links detail item
        const detailLinks = await newPage.$$eval('#left-col > section.section-post-listing > ul > li', (els) => {
            detailLinks = els.map(el => {
                return el.querySelector('.post-meta > h3 > a').href
            })
            return detailLinks
        })

        // console.log(detailLinks)
        const scraperDetail = async (link) => new Promise(async (resolve, reject) => {
            try {
                let pageDetail = await browser.newPage()
                await pageDetail.goto(link)
                console.log('>> Truy cập ' + link);
                await pageDetail.waitForSelector('#main')

                const detailData = {}
                // bắt đầu cạo
                // cạo ảnh
                const images = await pageDetail.$$eval('#left-col > article > div.post-images > div > div.swiper-wrapper > div.swiper-slide', (els) => {
                    images = els.map(el => {
                        return el.querySelector('img')?.src
                    })
                    return images.filter(i => !i === false)
                })
                detailData.images = images

                // lấy header detail
                const header = await pageDetail.$eval('header.page-header', (el) => {
                    return {
                        title: el.querySelector('h1 > a').innerText,
                        star: el.querySelector('h1 > span')?.className?.replace(/^\D+/g, ''),
                        class: {
                            content: el.querySelector('p').innerText,
                            classType: el.querySelector('p > a > strong').innerText
                        },
                        address: el.querySelector('address').innerText,
                        attributes: {
                            price: el.querySelector('div.post-attributes > .price > span').innerText,
                            acreage: el.querySelector('div.post-attributes > .acreage > span').innerText,
                            published: el.querySelector('div.post-attributes > .published > span').innerText,
                            hashtag: el.querySelector('div.post-attributes > .hashtag > span').innerText
                        }
                    }
                })
                detailData.header = header
                // thông tin mô tả
                const mainContentHeader = await pageDetail
                    .$eval('#left-col > article.the-post > section.post-main-content', (el) => el.querySelector('div.section-header > h2').innerText)
                const mainContentContent = await pageDetail
                    .$$eval('#left-col > article.the-post > section.post-main-content > .section-content > p', (els) => els.map(el => el.innerText))

                detailData.mainContent = {
                    header: mainContentHeader,
                    content: mainContentContent
                }
                // đặc ddierm tin đăng
                const overviewHeader = await pageDetail
                    .$eval('#left-col > article.the-post > section.post-overview', (el) => el.querySelector('div.section-header > h3').innerText)
                const overviewContent = await pageDetail
                    .$$eval('#left-col > article.the-post > section.post-overview > .section-content > table.table > tbody > tr', (els) => els.map(el => ({
                        name: el.querySelector('td:first-child').innerText,
                        content: el.querySelector('td:last-child').innerText
                    })))

                detailData.overview = {
                    header: overviewHeader,
                    content: overviewContent
                }
                // thông tin liên hệ
                const contactHeader = await pageDetail
                    .$eval('#left-col > article.the-post > section.post-contact', (el) => el.querySelector('div.section-header > h3').innerText)
                const contactContent = await pageDetail
                    .$$eval('#left-col > article.the-post > section.post-contact > .section-content > table.table > tbody > tr', (els) => els.map(el => ({
                        name: el.querySelector('td:first-child').innerText,
                        content: el.querySelector('td:last-child').innerText
                    })))

                detailData.contact = {
                    header: contactHeader,
                    content: contactContent
                }

                await pageDetail.close()
                console.log('>> Đã đóng tab ' + link)
                resolve(detailData)
            } catch (error) {
                console.log('Lấy data detail lỗi: ' + error);
                reject(error)
            }
        })
        const details = []
        for (let link of detailLinks) {
            const detail = await scraperDetail(link)
            details.push(detail)
        }
        scrapeData.body = details
        console.log('>> Trình duyệt đã đóng.');
        resolve(scrapeData)
    } catch (error) {
        reject(error)
    }
})

module.exports = {
    scrapeCategory,
    scraper
}