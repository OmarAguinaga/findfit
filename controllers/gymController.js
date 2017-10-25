const mongoose = require('mongoose');
const Gym = mongoose.model('Gym');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');

const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    const isPhoto = file.mimetype.startsWith('image/');
    if (isPhoto) {
      next(null, true);
    } else {
      next({ message: "That filetype isn't allowed!" }, false);
    }
  }
};

exports.homePage = (req, res) => {
  res.render('index');
};

exports.addGym = (req, res) => {
  res.render('editGym', { title: '👊 Add Gym' });
};

// Photo upload
exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
  // check if there is no new file to resize
  if (!req.file) {
    next(); // skip to the next middleware
    return;
  }
  const extension = req.file.mimetype.split('/')[1];
  req.body.photo = `${uuid.v4()}.${extension}`;
  //now we resize
  const photo = await jimp.read(req.file.buffer);
  await photo.resize(800, jimp.AUTO);
  await photo.write(`./public/uploads/${req.body.photo}`);

  // once we have written the photo to our file system, keep going
  next();
};

exports.createGym = async (req, res) => {
  req.body.author = req.user._id; // Associate user with the gym
  const gym = await new Gym(req.body).save();
  req.flash(
    'success',
    `Successfully created ${gym.name}. Care to leave a review?`
  );
  res.redirect(`/gym/${gym.slug}`);
};

exports.getGyms = async (req, res) => {
  // query the database for a list of all gyms
  const gyms = await Gym.find();
  res.render('gyms', { title: 'Gyms', gyms });
};

const confirmOwner = (store, user) => {
  if (!store.author.equals(user._id)) {
    throw Error('You must own a Gym in order to edit it!');
  }
};

exports.editGym = async (req, res) => {
  // Find the gym given the id
  const gym = await Gym.findOne({ _id: req.params.id });
  // Confirm they are the owner of the gym
  // TODO
  confirmOwner(gym, req.user);
  // Render out the edit form so the user can update
  res.render('editGym', { title: `Edit: ${gym.name}`, gym });
};

exports.updateGym = async (req, res) => {
  // set the location data to be point
  req.body.location.type = 'Point';
  // find and update gym
  const gym = await Gym.findOneAndUpdate({ _id: req.params.id }, req.body, {
    new: true, // return the new gym instead the onl one
    runValidators: true
  }).exec();

  req.flash(
    'success',
    `Succesfully updated <strong>${gym.name}</strong>. <a href="/gym/${gym.slug}">View Gym </a>`
  );
  res.redirect(`/gyms/${gym._id}/edit`);
  // redirect them to the gym and tell them it worked
};

exports.getGymBySlug = async (req, res, next) => {
  const gym = await Gym.findOne({ slug: req.params.slug }).populate('author');
  if (!gym) return next();
  res.render('gym', { gym, title: gym.name });
};

exports.getGymsByTag = async (req, res) => {
  const tag = req.params.tag;
  const tagQuery = tag || { $exists: true };

  const tagsPromise = Gym.getTagsList();
  const gymsPromise = Gym.find({ tags: tagQuery });

  const [tags, gyms] = await Promise.all([tagsPromise, gymsPromise]);

  res.render('tags', { tags, gyms, title: 'Tags', tag });
};

exports.searchGym = async (req, res) => {
  const gyms = await Gym
    // find stores that mathc
    .find(
      {
        $text: {
          $search: req.query.q
        }
      },
      {
        score: { $meta: 'textScore' }
      }
    )
    // then sort them
    .sort({
      score: { $meta: 'textScore' }
    })
    // limit to only 5 results
    .limit(5);
  res.json(gyms);
};
