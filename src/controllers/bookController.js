const Book = require('../models/bookModel');
const User = require('../models/userModel')
const { isValidBody, isValidObjectId, validString } = require('../utils/validation');

const currentFullDate = () => {
  let timestamps = new Date()
  return timestamps.getFullYear() + "-" + (timestamps.getMonth() + 1) + "-" + timestamps.getDate()
}  

const createBook = async function (req, res) {


  try {
    let data = req.body;
    if (isValidBody(data)) {
      return res.status(400).send({ status: false, message: "Enter Valid Book details" });
    }

    if (!data.title) {
      return res.status(400).send({ status: false, message: "Book title is required" });
    }

    if (!data.excerpt) {
      return res.status(400).send({ status: false, message: "Excerpt is required" });
    }

    if (!data.ISBN) {
      return res.status(400).send({ status: false, message: "ISBN number is required" });
    }

    if (!data.category) {
      return res.status(400).send({ status: false, message: "category is required" });
    }

    if (!data.subcategory) {
      return res.status(400).send({ status: false, message: "subcategory is required" });
    }

    if (!data.userId) {
      return res.status(400).send({ status: false, message: "UserId is required" })
    }

    let availableUserId = await User.findById(data.userId)
    if (!availableUserId) {
      return res.status(404).send({ status: false, message: "User not found" })
    }

    if (validString(data.excerpt) || validString(data.category) || validString(data.subcategory)) {
      return res.status(400).send({ status: false, message: "data should not contain Numbers" })
    }

    let checkUniqueValue = await Book.findOne({ $or: [{ title: data.title }, { ISBN: data.ISBN }] })
    if (checkUniqueValue) {
      return res.status(400).send({ status: false, message: "title or ISBN already exist" })
    }

    data.releasedAt = currentFullDate();

    let createBook = await Book.create(data)
    res.status(201).send({ status: true, message: "Book Created Successfully", data: createBook })
  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }
};



const getFilteredBooks = async (req, res) => {
  try {
    let data = req.query;

    if (data.hasOwnProperty('userId')) {
      if (!isValidObjectId(data.userId)) return res.status(400).send({ status: false, message: "Enter a valid user id" });
      let { ...tempData } = data;
      delete (tempData.userId);
      let checkValues = Object.values(tempData);

      if (validString(checkValues)) return res.status(400).send({ status: false, message: "Filter data should not contain numbers excluding user id" })
    } else {
      let checkValues = Object.values(data);

      if (validString(checkValues)) return res.status(400).send({ status: false, message: "Filter data should not contain numbers excluding user id" })
    }

    if (isValidBody(data)) {
      let getBooks = await Book.find({ isDeleted: false }).sort({ title: 1 }).select({ title: 1, excerpt: 1, userId: 1, category: 1, reviews: 1, releasedAt: 1 });

      if (getBooks.length == 0) return res.status(404).send({ status: false, message: "No books found" });
      return res.status(200).send({ status: true, message: "Books list", data: getBooks });
    }

    data.isDeleted = false;

    let getFilterBooks = await Book.find(data).sort({ title: 1 }).select({ title: 1, excerpt: 1, userId: 1, category: 1, reviews: 1, releasedAt: 1 });

    if (getFilterBooks.length == 0) return res.status(404).send({ status: false, message: "No books found" });

    res.status(200).send({ status: true, message: "Books list", data: getFilterBooks });
  } catch (err) {
    res.status(500).send({ status: false, message: err.message })
  }
}




const getBookById = async (req, res) => {
  try {
    let bookId = req.params.bookId;
    if (!isValidObjectId(bookId)) return res.status(400).send({ status: false, message: "Enter a correct book id" });

    let getBook = await Book.findById(bookId).select({ __v: 0 });
    if (!getBook) return res.status(404).send({ status: false, message: "No book found" })

    let { ...data } = getBook._doc;
    data.reviewsData = [];

    res.status(200).send({ status: true, message: "Books list", data: data })
  } catch (err) {
    res.status(500).send({ status: false, message: err.message })
  }
}

const updateBook = async (req, res) => {
  try {
    let bookId = req.params.bookId
    if(!bookId) return res.status(400).send({ status: false, message: "Book Id is required" });

    let checkBookId = await Book.findById(bookId);
    if(!checkBookId) return res.status(404).send({ status: false, message: "Book not found" });

    if(checkBookId.isDeleted == true) return res.status(404).send({ status: false, message: "Book not found or might have been deleted" });

    let data = req.body;
    if(isValidBody(data)) return res.status(400).send({ status: false, message: "Data is required to update document" });

    if(data.hasOwnProperty('userId') || data.hasOwnProperty('reviews') || data.hasOwnProperty('isDeleted') || data.hasOwnProperty('deletedAt')) return res.status(403).send({ status: false, message: 'Action is Forbidden' });

    if(data.hasOwnProperty('title') || data.hasOwnProperty('ISBN')) {
      let checkUniqueValue = await Book.findOne({ $or: [{ title: data.title }, { ISBN: data.ISBN }] })

      if (checkUniqueValue) return res.status(400).send({ status: false, message: "Title or ISBN already exist" })
    }

    if (validString(data.excerpt) || validString(data.category) || validString(data.subcategory)) {
      return res.status(400).send({ status: false, message: "Data should not contain Numbers" })
    }
    
    data.releasedAt = currentFullDate()

    let updatedBookData = await Book.findByIdAndUpdate(
      {_id: bookId },
      data,
      {new: true}
    )
    res.send({ status: true, message: "Success", data: updatedBookData })

  } catch (err) {
    res.status(500).send({ status: false, message: err.message })
  }
}

const deletebook = async function (req, res) {
  try {
      const bookId = req.params.bookId;
      const book = await bookModel.findById(bookId);

      if (!book) {
          return res.status(404).send({status: false,msg:"No such book exists"});
      }

      if (book.isDeleted == true) {
          return res.status(400).send({ status: false, msg: "book has already been deleted" })
      }

      const userId = book.userId;
      const id = req.userId;
      if (id != userId) {
          return res.status(403).send({ status: false, msg: "Not authorized..!" });
      }

      const deletedtedUser = await bookModel.findOneAndUpdate({ _id: bookId }, { $set: { isDeleted: true ,deletedAt: Date.now()} }, { new: true });
      res.status(200).send({status: true, msg: "book deleted successfully", data: deletedtedUser });
  }
  catch (err) {
      res.status(500).send({status: false, msg: "Error", error: err.message })
  }
}

module.exports = { getFilteredBooks, getBookById, createBook, updateBook, deletebook };