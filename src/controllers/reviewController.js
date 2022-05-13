const Review = require('../models/reviewModel');
const Book = require('../models/bookModel');
const { isValidObjectId, isValidBody, validString } = require('../utils/validation');
const { validate } = require('../models/bookModel');
const { request } = require('express');

// POST /books/:bookId/review
const addReview = async (req, res) => {
  try {
    let bookId = req.params.bookId;

    // check valid bookId
    if(!isValidObjectId(bookId)) return res.status(400).send({ status: false, message: "Enter a valid book id" });

    let checkBookId = await Book.findById(bookId);
    if(!checkBookId) return res.status(404).send({ status: false, message: "Book not found" });

    if(checkBookId.isDeleted == true) return res.status(404).send({ status: false, message: "Book not found or might have been deleted" })

    let data = req.body;

    // validate the request body
    if(isValidBody(data)) return res.status(400).send({ status: false, message: "Details required to add review to book" });

    // check rating
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
    await Book.updateOne(
      {_id: bookId},
      {$inc: {reviews: 1}}
    )

    res.status(200).send({ status: true, message: "Success", data: reviewData })
  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }
}


// PUT /books/:bookId/review/:reviewId

const updateReview = async (req, res) => {
  try {
    let getID = req.params

    // check valid bookId
    if(!isValidObjectId(getID.bookId)) return res.status(400).send({ status: false, message: "Enter a valid Book id" });
    
    // check valid reviewId
    if(!isValidObjectId(getID.reviewId)) return res.status(400).send({ status: false, message: "Enter a valid Review id" });

    let checkID = await Review.findOne({ _id: getID.reviewId, bookId: getID.bookId });
    if(!checkID) return res.status(404).send({ status: false, message: "Data not found, check ID's and try again" });

    if(checkID.isDeleted == true) return res.status(404).send({ status: false, message: "Review not found or might have been deleted" });

    let data = req.body;

    // validate the body
    if(isValidBody(data)) return res.status(400).send({ status: false, message: "Data is required to update document" });

    if(data.hasOwnProperty('bookId') || data.hasOwnProperty('isDeleted') || data.hasOwnProperty('reviewedAt')) return res.status(400).send({ status: false, message: 'Action is Forbidden' });

    if (validString(data.reviewedBy) || validString(data.review)) {
      return res.status(400).send({ status: false, message: "Enter valid data in review and reviewedBy" })
    }

    if(data.hasOwnProperty('rating')){

      // check rating
      if(!validString(data.rating)) return res.status(400).send({ status: false, message: "Rating should be in numbers" });

      if(!((data.rating < 6 ) && (data.rating > 0))) return res.status(400).send({ status: false, message: "Rating should be between 1 - 5 numbers" });
    }
    
    let updatedReview = await Review.findByIdAndUpdate(
      {_id: getID.reviewId},
      data,
      {new: true}
    )
 
    res.status(200).send({ status: true, message: "Review updated successfully", data: updatedReview }); 
  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }
}

// DELETE /books/:bookId/review/:reviewId
const deleteReview = async (req, res) => {
  try {
    let getID = req.params

    // check valid bookId
    if(!isValidObjectId(getID.bookId)) return res.status(400).send({ status: false, message: "Enter a valid Book id" });
    
    // check valid reviewId
    if(!isValidObjectId(getID.reviewId)) return res.status(400).send({ status: false, message: "Enter a valid Review id" });

    let checkID = await Review.findOne({ _id: getID.reviewId, bookId: getID.bookId });
    if(!checkID) return res.status(404).send({ status: false, message: "Data not found, check ID's and try again" });

    if(checkID.isDeleted == true) return res.status(404).send({ status: false, message: "Review not found or might have been deleted" });

    await Review.updateOne(
      {_id: getID.reviewId},
      { isDeleted: true }
    )
    await Book.updateOne(
      {_id: getID.bookId},
      {$inc: {reviews: -1}}
    )
    
    res.status(200).send({ status: true, message: "Review deleted successfully" });
  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }
} 

module.exports = { addReview, updateReview, deleteReview };