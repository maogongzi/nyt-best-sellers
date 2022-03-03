import format from "date-fns/format";
import React, { Component } from "react";
import Books from "./Books";
import Loading from "./Loading";
import "./App.scss";

const NYT_API_KEY = "TCA6F3ERSCl405KagmGI7MIe8rn2bu2U";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // bestseller category
      listCode: "paperback-nonfiction",
      // date of the data to be viewed, default to today
      dataDate: format(new Date(), "yyyy-MM-dd"),

      loading: true,
      error: null,
      // cached raw list of books returned from nytimes
      rawBooks: [],
      // total books recorded by nytimes
      rawTotal: 0,
      rawOffset: 0,

      // currently rendered books in the view
      renderedBooks: [],
      // how many books to display each time user clicks "show more"
      pageSize: 5,

      // default sorting type: by rank
      sortType: "rank",
      // supported sorting types
      sortTypes: [
        {
          code: "rank",
          name: "Rank"
        },
        {
          code: "rank_last_week",
          name: "Rank Last Week"
        },
        {
          code: "weeks_on_list",
          name: "Weeks On List"
        }
      ]
    };

    this.handleShowMore = this.handleShowMore.bind(this);
    this.handleSortChange = this.handleSortChange.bind(this);
  }

  componentDidMount() {
    // fetch from the beginning of the list
    this.fetchBooks(this.state.rawOffset);
  }

  /**
   *  Sort the currently rendered books by given condition
   */
  sortBooks(books) {
    let ret = [...books];
    let sortType = this.state.sortType;

    ret.sort((a, b) => {
      return a[sortType] - b[sortType];
    });

    return ret;
  }

  /**
   *  Fetch a batch of books from NYT api
   *
   *  @params {Number} offset   list offset, must be a multiple of 20
   */
  fetchBooks(offset) {
    const nyt_api_url = `https://api.nytimes.com/svc/books/v3/lists/${this.state.dataDate}/${this.state.listCode}.json?api-key=${NYT_API_KEY}&offset=${offset}`;

    fetch(nyt_api_url, {
      method: "GET",
      headers: {
        Accept: "application/json"
      }
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }

        return response.text().then((err) => {
          return Promise.reject({
            status: response.status,
            statusText: response.statusText,
            errorMessage: err
          });
        });
      })
      .then(({ results, num_results }) => {
        let rawBooks = [...this.state.rawBooks, ...results.books];
        let renderedBooks = rawBooks.slice(
          0,
          this.state.renderedBooks.length + this.state.pageSize
        );

        this.setState({
          rawBooks,
          renderedBooks,
          rawTotal: num_results
        });
      })
      .catch((error) => {
        this.setState({
          error
        });
      })
      .finally(() => {
        this.setState({
          loading: false
        });
      });
  }

  /**
   *  Handle sort type change
   */
  handleSortChange(event) {
    this.setState({
      sortType: event.target.value
    });
  }

  /**
   *  Handle clicking on "show more"
   *
   *  Each time we read from the cached books and render 5 per page, if there
   *  aren't sufficient books left in the cache, we request the api to get
   *  more, or alter the page size to just render the remained books.
   */
  handleShowMore() {
    if (
      this.state.renderedBooks.length + this.state.pageSize <=
      this.state.rawBooks.length
    ) {
      this.setState({
        renderedBooks: this.state.rawBooks.slice(
          0,
          this.state.renderedBooks.length + this.state.pageSize
        )
      });
    } else {
      if (this.state.rawTotal > this.state.rawBooks.length) {
        if (
          this.state.renderedBooks.length + this.state.pageSize >
          this.state.rawTotal
        ) {
          this.setState({
            pageSize: this.state.rawTotal - this.state.renderedBooks.length
          });
        }

        this.fetchBooks((this.state.rawOffset + 1) * 20);
      } else {
        let pageSize =
          this.state.rawBooks.length - this.state.renderedBooks.length;

        this.setState({
          pageSize,
          renderedBooks: this.state.rawBooks.slice(
            0,
            this.state.renderedBooks.length + pageSize
          )
        });
      }
    }
  }

  render() {
    let footer;

    if (this.state.loading) {
      footer = <Loading />;
    } else if (this.state.error) {
      footer = <p>Failed to fetch books, please try again later.</p>;
    } else {
      if (this.state.renderedBooks.length < this.state.rawTotal) {
        footer = (
          <button onClick={this.handleShowMore} title="Click to load more">
            Show More
          </button>
        );
      } else {
        footer = <p>End of the list</p>;
      }
    }

    return (
      <div className="App">
        <h1 className="App__header">Wiley</h1>

        <div className="App__content">
          <h3>Paperback Nonfiction Bestsellers</h3>
          Sort by:
          <select
            value={this.state.sortType}
            disabled={this.state.loading}
            onChange={this.handleSortChange}
          >
            {this.state.sortTypes.map((type) => (
              <option key={type.code} value={type.code}>
                {type.name}
              </option>
            ))}
          </select>
          {this.state.renderedBooks.length > 0 && (
            <Books books={this.sortBooks(this.state.renderedBooks)} />
          )}
          <div className="App__content-footer">{footer}</div>
        </div>
      </div>
    );
  }
}

export default App;
