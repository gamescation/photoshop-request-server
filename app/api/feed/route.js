const { NextResponse } = require('next/server');
const prisma = require('../../../lib/prisma');
const { imageReturnValues } = require('../../../helper/returnValues');


async function POST(req, res) {
    const json = await req.json();
    const { page = 1, pageSize = 10 } = json;

    console.log("Fetching images: ", page);
    try { 
        const images = await prisma.image.findMany({
            where: {
                deleted: false,
                archived: false,
                active: true,
                response: false
            },
            skip: (page - 1) * pageSize,
            take: parseInt(pageSize),
            select: {
                secure_url: true,
                request: true,
                amount: true,
                id: true,
                createdAt: true,
                responses: true
            },
            orderBy: {
                createdAt: 'desc' 
            }
        })

        if (!images?.length) {
            // console.log("Could not find images");
            return NextResponse.json({ success: true, images: [] });
        }

        return NextResponse.json({ success: true, images: images.map((image) => {
            return imageReturnValues(image)
        }) });
    } catch(e) {
        console.error(`Error posting upload ${e.message} ${e.stack}`);
        return NextResponse.json({ success: false });
    }
}

module.exports = {
    POST
};