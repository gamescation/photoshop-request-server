const { NextResponse } = require('next/server');
const { userIdFromReq } = require('../../../../helper/userHelper');
const prisma = require('../../../../lib/prisma');
const { imageReturnValues } = require('../../../../helper/returnValues');
const { decryptJwtBase64 } = require('../../../../helper/encryption');


async function POST(req, res) {

    try { 
        const json = await req.json();
        const userId = await userIdFromReq(json);

        const { originalImageId, page = 1, pageSize = 10 } = json;

        console.log("Fetching responses: ", userId, page);
        if (!originalImageId) {
            return  NextResponse.json({ success: false });
        }

        const body = decryptJwtBase64(originalImageId);
        const { imageId } = body;


        const images = await prisma.image.findMany({
            where: {
                originalImageId: imageId,
                deleted: false,
                archived: false,
                active: true,
                response: true
            },
            skip: (page - 1) * pageSize,
            take: parseInt(pageSize),
            select: {
                secure_url: true,
                request: true,
                userId: true,
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
        console.error(`Error fetching responses ${e.message} ${e.stack}`);
        return NextResponse.json({ success: false });
    }
}

module.exports = {
    POST
};