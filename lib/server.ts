'use server'
import nodemailer from 'nodemailer'
import chrome from '@sparticuz/chromium'
import puppeteer from 'puppeteer-core'

const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: 'maelnaggar1223@gmail.com',
        pass: 'nwlb vxnh kxru hkga', 
    }
})

export const sendMailPdfs = async (request: any) => {
    let attachments = [] as any

    const ticketsPdfs = Object.keys(request.addedTicket.tickets).map(async (ticket: any) => {
        const noOfTickets = parseInt(request.addedTicket.tickets[ticket])
        for(let i = 0; i < noOfTickets; i++)
        {
            const browser = await puppeteer.launch({
                args: chrome.args,
                defaultViewport: chrome.defaultViewport,
                executablePath: await chrome.executablePath(),
                headless: false,
            })
        
            const page = await browser.newPage()
        
            const htmlString = `<h1>This is a Ticket Pdf for ${request.event}</h1>`
        
            // await page.setContent(htmlString);
            await page.goto(process.env.NODE_ENV === 'production' ? `https://vibes-woad.vercel.app/ticket/${request.ticket}` : `http://localhost:3000/ticket/${request.ticket}`, {
                waitUntil: 'domcontentloaded'
            })
        
            // await page.waitForSelector('.bg-image')
            // await page.waitForSelector('.bg-image-inside')
        
            // await page.emulateMediaType('screen')
        
            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '2cm',
                    right: '2cm',
                    bottom: '2cm',
                    left: '2cm',
                },
            })
        
            await browser.close();

            attachments.push({
                filename: `${request.event}-${ticket}.pdf`,
                content: pdfBuffer
            })
        }
    })

    await Promise.all(ticketsPdfs)

    const mailOptions = {
        from: 'maelnaggar1223@gmail.com',
        to: [request.email],
        subject: 'Test',
        attachments: attachments
    }

    try
    {
        await transporter.sendMail(mailOptions)
    }
    catch(e: any)
    {
        console.log(e)
    }
}