const Joi = require('joi');

module.exports = (req, res, next) => {
    const commentSchema = Joi.object({
        comment: Joi.object({
            body: Joi.string().required().messages({
                'string.empty': '评论内容不能为空。',
            }),
            rating: Joi.number().min(1).max(5).required().messages({
                'number.base': '评分必须是数字。',
                'number.min': '评分不能低于1。',
                'number.max': '评分不能高于5。',
                'any.required': '评分不能为空。',
            })
        }).required()
    });

    const { error } = commentSchema.validate(req.body);

    if (error) {
        const msg = error.details.map(el => el.message).join(', ');
        return res.status(400).send(msg); // 直接发送错误信息
    } else {
        next();
    }
};