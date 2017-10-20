const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');

const gymSchema = new mongoose.Schema({
  // Create Schema
  name: {
    type: String,
    trim: true,
    required: 'Pease enter a Gym name '
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
        required: 'You must supply coordinates'
      }
    ],
    address: {
      type: String,
      required: 'You must supply an address'
    }
  },
  photo: String,
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: 'You must supply an author'
  }
});

gymSchema.pre('save', async function(next) {
  if (!this.isModified('name')) {
    next();
    return;
  }
  this.slug = slug(this.name);

  // find other gyyms that have a lug of gym, gym-1, gym-2
  const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
  const gymsWithSlug = await this.constructor.find({ slug: slugRegEx });
  if (gymsWithSlug.length) {
    this.slug = `${this.slug}-${gymsWithSlug.length + 1}`;
  }

  next();

  // TODO Make more resiliant so alugs are unique
});

gymSchema.statics.getTagsList = function() {
  return this.aggregate([
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
};

module.exports = mongoose.model('Gym', gymSchema);
