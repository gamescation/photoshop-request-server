const { NextResponse } = require('next/server');
const prisma = require('../../../../lib/prisma');
const { encryptJwtBase64, decryptJwtBase64 } = require('../../../../helper/encryption');
const { userIdFromReq } = require('../../../../helper/userHelper');

async function POST(req, res) {
    try {
        const json = await req.json();
        const userId = await userIdFromReq(json);
        console.log("Saving image from user");
        const { secure_url, originalImageId, request } = json;

        if (!originalImageId) {
            return  NextResponse.json({ success: false });
        }

        const body = decryptJwtBase64(originalImageId);
        const { imageId } = body;

        console.log("imageId: ", imageId);

        const newImage =  await prisma.image.create({
            data: {
                user: {
                    connect: {
                        id: userId
                    }
                },
                request,
                originalImageId: imageId, 
                secure_url,
                active: true,
                uploaded: true,
                response: true
            }
        })

        const originalImage = await prisma.image.findFirst({
            where: {
                id: imageId
            },
            select: {
                userId: true
            }
        })

        if (originalImage) {
            // add push notification to original
            await prisma.image.update({
                where: {
                    id: imageId,
                },
                data: {
                    responses: {
                        increment: 1
                    }
                }
            })


            await prisma.user.update({
                where: {
                    id: originalImage.userId,
                },
                data: {
                    responses: {
                        increment: 1
                    }
                }
            })

            console.log("Saved: ", newImage.id);
        }
        return NextResponse.json({ success: true, id: encryptJwtBase64({ data: { imageId: newImage.id }}) });
    } catch(e) {
        console.error(`Error posting update ${e.message} ${e.stack}`);
        return NextResponse.json({ success: false });
    }
}

module.exports = {
    POST
};