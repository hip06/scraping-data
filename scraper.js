const scrapeCategory = (browser, url) => new Promise(async (resolve, reject) => {
    try {
        let page = await browser.newPage()
        console.log('>> Mở tab mới ...');
        await page.goto(url)
        console.log('>>Truy cập vào ' + url)
        await page.waitForSelector('#shopify-section-all-collections')
        console.log('>> Website đã laod xong...');

        const dataCategory = await page.$$eval('#shopify-section-all-collections > div.all-collections > div.sdcollections-content > ul.sdcollections-list > li', els => {
            dataCategory = els.map(el => {
                return {
                    category: el.querySelector('div.collection-name').innerText,
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
const scrapeItems = (browser, url) => new Promise(async (resolve, reject) => {
    try {
        let page = await browser.newPage()
        console.log('>> Mở tab mới ...');
        await page.goto(url)
        console.log('>>Truy cập vào ' + url)
        await page.waitForSelector('#collection_content')
        console.log('>> Website đã laod xong...');

        const items = await page.$$eval('#collection-product-grid > div.grid-element', els => {
            items = els.map(el => {
                return el.querySelector('a.grid-view-item__link').href
            })
            return items
        })
        // await page.close()
        // console.log('>> Tab đã đóng.');
        resolve(items)

    } catch (error) {
        console.log('lỗi ở scrape items: ' + error)
        reject(error)
    }
})

const scraper = (browser, url) => new Promise(async (resolve, reject) => {
    try {
        let newPage = await browser.newPage()
        console.log('>> Đã mở tab mới ...');
        await newPage.goto(url)
        console.log(">> Đã truy cập vào trang " + url)
        await newPage.waitForSelector('#shopify-section-product-template')
        console.log('>> Đã load xong tag main ...');

        const scrapeData = {}

        // lấy tên sản phẩm
        const name = await newPage.$eval('header.section-header', (el) => {
            return el.querySelector('h3')?.innerText
        })
        scrapeData.name = name

        // Lấy ảnh sp
        const thumb = await newPage.$eval('#ProductPhoto', (el) => {
            return el.querySelector('#ProductPhotoImg')?.src
        })
        scrapeData.thumb = thumb
        const images = await newPage.$$eval('#ProductThumbs > div.owl-wrapper-outer > div.owl-wrapper > div.owl-item', (els) => {
            images = els.map(el => {
                return el.querySelector('a.product-single__thumbnail').href
            })
            return images
        })
        scrapeData.images = images


        // Lấy giá sp
        const price = await newPage.$eval('#ProductPrice', (el) => {
            return el.querySelector('span.money')?.innerText
        })
        scrapeData.price = price


        // Lấy mô tả sp
        const description = await newPage.$$eval('div.product-single__description > ul > li', (els) => {
            description = els.map(el => {
                return el?.innerText
            })
            return description
        })
        scrapeData.description = description

        // lấy variants
        const variants = await newPage.$$eval('form.product-single__form > div.product-form__item', (els) => {
            variants = els.map(el => {
                const variants = el.querySelectorAll('fieldset.single-option-radio > label')
                const values = []
                for (let variant of variants) values.push(variant?.innerText)
                return {
                    label: el.querySelector('label.single-option-radio__label')?.innerText,
                    variants: values
                }
            })
            return variants
        })
        scrapeData.variants = variants

        // Lấy thông tin sp
        const infomationTitles = await newPage.$$eval('#tabs-information > ul > li', (els) => {
            infomationTitles = els.map(el => {
                return el.querySelector('a')?.innerText
            })
            return infomationTitles
        })
        const desc = await newPage.$eval('#desc', (el) => {
            return el?.textContent
        })
        const size = await newPage.$eval('#size', (el) => {
            return el?.innerText
        })
        const delivery = await newPage.$eval('#delivery', (el) => {
            return el?.textContent
        })
        const payment = await newPage.$eval('#payment', (el) => {
            return el?.innerText
        })
        scrapeData.infomations = {
            [infomationTitles[0]]: desc,
            [infomationTitles[1]]: size,
            [infomationTitles[2]]: delivery,
            [infomationTitles[3]]: payment,
        }


        // console.log(detailLinks)
        // const scraperDetail = async (link) => new Promise(async (resolve, reject) => {
        //     try {
        //         let pageDetail = await browser.newPage()
        //         await pageDetail.goto(link)
        //         console.log('>> Truy cập ' + link);
        //         await pageDetail.waitForSelector('#main')

        //         const detailData = {}
        //         // bắt đầu cạo
        //         // cạo ảnh
        //         const images = await pageDetail.$$eval('#left-col > article > div.post-images > div > div.swiper-wrapper > div.swiper-slide', (els) => {
        //             images = els.map(el => {
        //                 return el.querySelector('img')?.src
        //             })
        //             return images.filter(i => !i === false)
        //         })
        //         detailData.images = images

        //         // lấy header detail
        //         const header = await pageDetail.$eval('header.page-header', (el) => {
        //             return {
        //                 title: el.querySelector('h1 > a').innerText,
        //                 star: el.querySelector('h1 > span')?.className?.replace(/^\D+/g, ''),
        //                 class: {
        //                     content: el.querySelector('p').innerText,
        //                     classType: el.querySelector('p > a > strong').innerText
        //                 },
        //                 address: el.querySelector('address').innerText,
        //                 attributes: {
        //                     price: el.querySelector('div.post-attributes > .price > span').innerText,
        //                     acreage: el.querySelector('div.post-attributes > .acreage > span').innerText,
        //                     published: el.querySelector('div.post-attributes > .published > span').innerText,
        //                     hashtag: el.querySelector('div.post-attributes > .hashtag > span').innerText
        //                 }
        //             }
        //         })
        //         detailData.header = header
        //         // thông tin mô tả
        //         const mainContentHeader = await pageDetail
        //             .$eval('#left-col > article.the-post > section.post-main-content', (el) => el.querySelector('div.section-header > h2').innerText)
        //         const mainContentContent = await pageDetail
        //             .$$eval('#left-col > article.the-post > section.post-main-content > .section-content > p', (els) => els.map(el => el.innerText))

        //         detailData.mainContent = {
        //             header: mainContentHeader,
        //             content: mainContentContent
        //         }
        //         // đặc ddierm tin đăng
        //         const overviewHeader = await pageDetail
        //             .$eval('#left-col > article.the-post > section.post-overview', (el) => el.querySelector('div.section-header > h3').innerText)
        //         const overviewContent = await pageDetail
        //             .$$eval('#left-col > article.the-post > section.post-overview > .section-content > table.table > tbody > tr', (els) => els.map(el => ({
        //                 name: el.querySelector('td:first-child').innerText,
        //                 content: el.querySelector('td:last-child').innerText
        //             })))

        //         detailData.overview = {
        //             header: overviewHeader,
        //             content: overviewContent
        //         }
        //         // thông tin liên hệ
        //         const contactHeader = await pageDetail
        //             .$eval('#left-col > article.the-post > section.post-contact', (el) => el.querySelector('div.section-header > h3').innerText)
        //         const contactContent = await pageDetail
        //             .$$eval('#left-col > article.the-post > section.post-contact > .section-content > table.table > tbody > tr', (els) => els.map(el => ({
        //                 name: el.querySelector('td:first-child').innerText,
        //                 content: el.querySelector('td:last-child').innerText
        //             })))

        //         detailData.contact = {
        //             header: contactHeader,
        //             content: contactContent
        //         }

        //         await pageDetail.close()
        //         console.log('>> Đã đóng tab ' + link)
        //         resolve(detailData)
        //     } catch (error) {
        //         console.log('Lấy data detail lỗi: ' + error);
        //         reject(error)
        //     }
        // })
        // const details = []
        // for (let link of detailLinks) {
        //     const detail = await scraperDetail(link)
        //     details.push(detail)
        // }
        // scrapeData.body = details
        console.log('>> Trình duyệt đã đóng.');
        resolve(scrapeData)
    } catch (error) {
        reject(error)
    }
})

module.exports = {
    scrapeCategory,
    scraper,
    scrapeItems
}