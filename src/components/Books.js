import React from "react";
import "./Books.scss";

export default function Books(props) {
  return (
    <ul className="Books">
      {props.books.map((book) => (
        <li className="Books__book" key={book.rank}>
          <div className="Books__book-rank">{book.rank}.</div>

          <div className="Books__book-cover">
            <img src={book.book_image} alt="book.title" />
          </div>

          <div className="Books__book-details">
            <h3>{book.title}</h3>
            <p>
              by <span>{book.author}</span>
            </p>
            <p>{book.description}</p>
            <p>
              ISBN: <span>{book.isbns[0].isbn10}</span>
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
