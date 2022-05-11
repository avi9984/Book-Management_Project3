const Review = require('../models/reviewModel');
const Book = require('../models/bookModel');
const { isValidObjectId, isValidBody, validString } = require('../utils/validation')

const addReview = async (req, res) => {
  try {
    let bookId = req.params.bookId;

    if(!isValidObjectId(bookId)) return res.status(400).send({ status: false, message: "Enter a valid book id" });

    let checkBookId = await Book.findById(bookId);
    if(!checkBookId) return res.status(404).send({ status: false, message: "Book not found" });

    if(checkBookId.isDeleted == true) return res.status(404).send({ status: false, message: "Book not found or might have been deleted" })

    let data = req.body;
    if(isValidBody(data)) return res.status(400).send({ status: false, message: "Details required to add review to book" });

    if(!data.rating) return res.status(400).send({ status: false, message: "Rating is required and should not be 0" });

    if(data.hasOwnProperty('reviewedBy')){
      if(validString(data.reviewedBy)) return res.status(400).send({ status: false, message: "Name should not contain numbers" });
    }
    
    if (validString(data.reviewedBy) || validString(data.review)) {
      return res.status(400).send({ status: false, message: "Enter valid data in review and reviewedBy" })
    }

    if(!validString(data.rating)) return res.status(400).send({ status: false, message: "Rating should be in numbers" });
    if(!((data.rating < 6 ) && (data.rating > 0))) return res.status(400).send({ status: false, message: "Rating should be between 1 - 5 numbers" });

    data.bookId = bookId;

    let reviewData = await Review.create(data) ;
    await Book.findByIdAndUpdate(
      {_id: bookId},
      {$inc: {reviews: 1}}
    )

    res.status(200).send({ status: true, message: "Success", data: reviewData })
  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }
}

const updateReview = async (req, res) => {
  try {
    let getID = req.params

    if(!isValidObjectId(getID.bookId)) return res.status(400).send({ status: false, message: "Enter a valid Book id" });
    if(!isValidObjectId(getID.reviewId)) return res.status(400).send({ status: false, message: "Enter a valid Review id" });

    let checkID = await Review.findOne({ _id: getID.reviewId, bookId: getID.bookId });
    if(!checkID) return res.status(404).send({ status: false, message: "Data not found, check ID's and try again" });

    if(checkID.isDeleted == true) return res.status(404).send({ status: false, message: "Review not found or might have been deleted" });

    let data = req.body;
    if(isValidBody(data)) return res.status(400).send({ status: false, message: "Data is required to update document" });

    if(data.hasOwnProperty('bookId') || data.hasOwnProperty('isDeleted') || data.hasOwnProperty('reviewedAt')) return res.status(403).send({ status: false, message: 'Action is Forbidden' });

    if (validString(data.reviewedBy) || validString(data.review)) {
      return res.status(400).send({ status: false, message: "Enter valid data in review and reviewedBy" })
    }

    if(data.hasOwnProperty('rating')){
      if(!validString(data.rating)) return res.status(400).send({ status: false, message: "Rating should be in numbers" });

      if(!((data.rating < 6 ) && (data.rating > 0))) return res.status(400).send({ status: false, message: "Rating should be between 1 - 5 numbers" });
    }
    

    let updatedReview = await Review.findByIdAndUpdate(
      {_id: getID.reviewId},
      data,
      {new: true}
    ).select({ isDeleted: 0, __v: 0, createdAt: 0, updatedAt: 0 })

    let getBook = await Book.findById(getID.bookId).select({ __v: 0 });

    let { ...responseData } = getBook._doc;
    responseData.reviewData = updatedReview
 
    res.status(200).send({ status: true, message: "Book list", data: responseData });
  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }
}

const deleteReview = async (req, res) => {
  try {
    let getID = req.params

    if(!isValidObjectId(getID.bookId)) return res.status(400).send({ status: false, message: "Enter a valid Book id" });
    if(!isValidObjectId(getID.reviewId)) return res.status(400).send({ status: false, message: "Enter a valid Review id" });

    let checkID = await Review.findOne({ _id: getID.reviewId, bookId: getID.bookId });
    if(!checkID) return res.status(404).send({ status: false, message: "Data not found, check ID's and try again" });

    if(checkID.isDeleted == true) return res.status(404).send({ status: false, message: "Review not found or might have been deleted" });

    await Review.findByIdAndUpdate(
      {_id: getID.reviewId},
      { isDeleted: true }
    )
    await Book.findByIdAndUpdate(
      {_id: getID.bookId},
      {$inc: {reviews: -1}}
    )
    
    res.status(200).send({ status: true, message: "Review deleted successfully" });
  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }
} 

module.exports = { addReview, updateReview, deleteReview };