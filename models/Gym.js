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

gymSchema.statics.getTopGyms = function() {
  return this.aggregate([
    // Lookup Gyms and populate their reviews
    {
      $lookup: {
        from: 'reviews',
        localField: '_id',
        foreignField: 'gym',
        as: 'reviews'
      }
    },
    // filter for only items that have 2 or more reviews
    { $match: { 'reviews.1': { $exists: true } } },
    // add  the average reviews field
    {
      $project: {
        photo: '$$ROOT.photo',
        name: '$$ROOT.name',
        reviews: '$$ROOT.reviews',
        slug: '$$ROOT.slug',
        averageRating: { $avg: '$reviews.rating' }
      }
    },
    // sort it by our new field, highest reviews first
    { $sort: { averageRating: -1 } },
    // limit to at most 10
    { $limit: 10 }
  ]);
};

// find reviews where the gyms _id property === reviews gym property
gymSchema.virtual('reviews', {
  ref: 'Review', // what model to link?
  localField: '_id', // which field on the gym?
  foreignField: 'gym' // which field on the review?
});

function autopopulate(next) {
  this.populate('reviews');
  next();
}

gymSchema.pre('find', autopopulate);
gymSchema.pre('findOne', autopopulate);

module.exports = mongoose.model('Gym', gymSchema);
