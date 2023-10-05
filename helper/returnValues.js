const { encryptJwtBase64 } = require("./encryption")

const imageReturnValues = function(image) {
    return {
        secure_url: image.secure_url,
        id: encryptJwtBase64({ data: { imageId: image.id }}),
        createdAt: image.createdAt,
        request: image.request,
        amount: image.amount,
        userId: image.userId,
        responses: image.responses,
    }
}

module.exports = {
    imageReturnValues
}