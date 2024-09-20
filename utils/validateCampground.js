const Joi = require('joi');
const ExpressError = require('./ErrorHandler'); 
const sanitizeHtml = require('sanitize-html');

const extendedJoi = Joi.extend((joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
      'string.sanitize': '{{#label}} 不能包含非法字符或标签。',
    },
    rules: {
      sanitize: {
        validate(value, helpers) {
          const sanitizedValue = sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} });
          if (sanitizedValue !== value) {
            return helpers.error('string.sanitize');
          }
          return sanitizedValue;
        },
      },
    },
}));

const campgroundSchema = Joi.object({
    campground: Joi.object({
        title: extendedJoi.string().required().sanitize(),  // 进行 sanitization
        price: Joi.number().required().min(0),  
        description: extendedJoi.string().required().sanitize(),  // 进行 sanitization
        location: extendedJoi.string().required().sanitize(),  // 进行 sanitization
    }).required(),
    
    deletedImages: Joi.array().items(Joi.string()).optional().allow('')  
});

module.exports.validateCampground = (req, res, next) => {
    console.log('Request body:', req.body);

    const { error } = campgroundSchema.validate(req.body, { abortEarly: false });

    if (error) {
        console.log('Validation error details:', error.details);
        const msg = error.details.map(el => el.message).join(',');
        req.flash('error', msg);
        return res.redirect(req.get('Referrer') || '/');
    } else {
        next();
    }
};