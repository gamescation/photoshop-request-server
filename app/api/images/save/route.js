const { NextResponse } = require('next/server');
const prisma = require('../../../../lib/prisma');
const { encryptJwtBase64 } = require('../../../../helper/encryption');
const { userIdFromReq } = require('../../../../helper/userHelper');

async function POST(req, res) {
    console.log("Saving image from user");
    try {
        const json = await req.json();
        const userId = await userIdFromReq(json);

        const { secure_url, request, amount } = json;
        console.log("Saving image: ", secure_url);
        let newAmount = parseInt(amount.toString().replace(/[^0-9|]/g, ''), 10);

        const newImage =  await prisma.image.create({
            data: {
                user: {
                    connect: {
                        id: userId
                    }
                },
                secure_url,
                request,
                amount: newAmount,
                active: true,
                uploaded: true,
            }
        })
        
        await prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                posts: {
                    increment: 1
                }
            }
        })
        console.log("Saved: ", newImage.id);
        return NextResponse.json({ success: true, id: encryptJwtBase64({ data: { imageId: newImage.id }}) });
    } catch(e) {
        console.error(`Error posting update ${e.message} ${e.stack}`);
        return NextResponse.json({ success: false });
    }
}

module.exports = {
    POST
};