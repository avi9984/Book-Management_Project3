const Book = require('../models/bookModel');
const User = require('../models/userModel');
const Review = require('../models/reviewModel');
const { isValidBody, isValidObjectId, validString, validDate, validISBN } = require('../utils/validation');


const createBook = async function (req, res) {
  try {
    let data = req.body;
    if (isValidBody(data)) {
      return res.status(400).send({ status: false, message: "Enter Book details" });
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
    
    if (!data.releasedAt) {
      return res.status(400).send({ status: false, message: "ReleasedAt date is required" })
    }

    let availableUserId = await User.findById(data.userId)
    if (!availableUserId) {
      return res.status(404).send({ status: false, message: "User not found" })
    }

    if (validString(data.excerpt) || validString(data.category) || validString(data.subcategory)) {
      return res.status(400).send({ status: false, message: "Data should be valid and does not contains numbers" })
    }

    let checkUniqueValue = await Book.findOne({ $or: [{ title: data.title }, { ISBN: data.ISBN }] })
    if (checkUniqueValue) {
      return res.status(400).send({ status: false, message: "title or ISBN already exist" })
    }

    if(validDate(data.releasedAt)) {
      return res.status(400).send({ status: false, message: "Enter a valid released date in (YYYY-MM-DD) formate" })
    }

    if(validISBN(data.ISBN)) {
      return res.status(400).send({ status: false, message: "Enter a valid ISBN number" })
    }

    let createBook = await Book.create(data)
    res.status(201).send({ status: true, message: "Book Created Successfully", data: createBook })
  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }
};



const getFilteredBooks = async (req, res) => {
  try {
    let data = req.query;

    if (isValidBody(data)) {
      let getBooks = await Book.find({ isDeleted: false }).sort({ title: 1 }).select({ title: 1, excerpt: 1, userId: 1, category: 1, reviews: 1, releasedAt: 1 });

      if (getBooks.length == 0) return res.status(404).send({ status: false, message: "No books found" });
      return res.status(200).send({ status: true, message: "Books list", data: getBooks });
    }

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

    if(getBook.isDeleted == true) return res.status(404).send({ status: false, message: "Book not found or have already been deleted" })

    let getReviews = await Review.find({ bookId: getBook._id, isDeleted: false }).select({ isDeleted: 0, __v: 0, createdAt: 0, updatedAt: 0 });

    getBook._doc.reviewsData = getReviews

    res.status(200).send({ status: true, message: "Books list", data: getBook })
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

    if (!data.releasedAt) {
      return res.status(400).send({ status: false, message: "ReleasedAt date is required" })
    }

    if(data.hasOwnProperty('userId') || data.hasOwnProperty('reviews') || data.hasOwnProperty('isDeleted') || data.hasOwnProperty('deletedAt')) return res.status(400).send({ status: false, message: 'Action is Forbidden' });

    if(data.hasOwnProperty('title')) {
      let checkUniqueValue = await Book.findOne({ title: data.title })

      if (checkUniqueValue) return res.status(400).send({ status: false, message: "Title already exist" })
    }
    if(data.hasOwnProperty('ISBN')) {
      if(validISBN(data.ISBN)) {
        return res.status(400).send({ status: false, message: "Enter a valid ISBN number" })
      }
      let checkUniqueValue = await Book.findOne({ ISBN: data.ISBN  })

      if (checkUniqueValue) return res.status(400).send({ status: false, message: "ISBN already exist" })
    }
  
    if (validString(data.excerpt) || validString(data.category) || validString(data.subcategory)) {
      return res.status(400).send({ status: false, message: "Data should not contain Numbers" })
    }
    
    if(validDate(data.releasedAt)) {
      return res.status(400).send({ status: false, message: "Enter a valid released date in (YYYY-MM-DD) formate" })
    }

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

const deleteBook = async function (req, res) {
  try {
      const bookId = req.params.bookId;
      const book = await Book.findById(bookId);

      if (!book) {
          return res.status(404).send({status: false,msg:"No such book exists"});
      }
      if (book.isDeleted == true) {
          return res.status(404).send({ status: false, msg: "Book not found or has already been deleted" })
      }
      
    await Book.updateOne({ _id: bookId }, { isDeleted: true ,deletedAt: Date.now()} );
    res.status(200).send({status: true, message: "Book deleted successfully"});
  }
  catch (err) {
      res.status(500).send({status: false, error: err.message })
  }
}

module.exports = { getFilteredBooks, getBookById, createBook, updateBook, deleteBook };