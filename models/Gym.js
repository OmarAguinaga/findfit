const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');

const gymSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: 'Please enter a gym name!'
    },
    slug: String,
    description: {
      type: String,
      trim: true
    },
    tags: [String],
    created: {
      type: Date,
      default: Date.now
    },
    location: {
      type: {
        type: String,
        default: 'Point'
      },
      coordinates: [
        {
          type: Number,
          required: 'You must supply coordinates!'
        }
      ],
      address: {
        type: String,
        required: 'You must supply an address!'
      }
    },
    photo: String,
    author: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: 'You must supply an author'
    }
  },
  {
    toJSON: { virtuals: true },
    toOjbect: { virtuals: true }
  }
);

// Define our indexes
gymSchema.index({
  name: 'text',
  description: 'text'
});

gymSchema.index({ location: '2dsphere' });

gymSchema.pre('save', async function(next) {
  if (!this.isModified('name')) {
    next(); // skip it
    return; // stop this function from running
  }
  this.slug = slug(this.name);
  // find other gyms that have a slug of gym, gym-1, gym-2
  const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
  const gymsWithSlug = await this.constructor.find({ slug: slugRegEx });
  if (gymsWithSlug.length) {
    this.slug = `${this.slug}-${gymsWithSlug.length + 1}`;
  }
  next();
  // TODO make more resiliant so slugs are unique
});

gymSchema.statics.getTagsList = function() {
  return this.aggregate([
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
};

// find reviews where the gyms _id property === reviews gym property
gymSchema.virtual('reviews', {
  ref: 'Review', // what model to link?
  localField: '_id', // which field on the gym?
  foreignField: 'gym' // which field on the review?
});

module.exports = mongoose.model('Gym', gymSchema);
