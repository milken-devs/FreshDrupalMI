import React from "react";
import { Col, Container, Row } from "react-bootstrap";
import ResultsList from "./ResultsList";
import KeywordForm from "./KeywordForm";
import FilterList from "./FilterList";
import SearchResult from "./SearchResult";

interface SearchState {
  keywords: string;
  results: Array<SearchResult>;
  filters: FilterList;
  currentActiveRequest: boolean;
}

class Search extends React.Component<any, SearchState> {
  constructor(props) {
    super(props);
    this.state = {
      keywords: "",
      results: [],
      filters: <FilterList filters={[]} />,
      currentActiveRequest: false,
    };
  }

  componentDidMount(): void {
    const keywords = this.getQueryVariable("keywords");
    if (keywords) {
      this.searchOnSubmitHandler({ keywords: keywords });
    }
  }

  render() {
    return (
      <Container fluid={true} className={"outline"}>
        <Row>
          <Col lg={12} className={"py-1"}>
            <Container
              fluid={true}
              className={"text-align-center mx-auto my-2"}
            >
              <h5 className={"display-5"}>Search the Milken Institute</h5>
              <KeywordForm
                onSubmit={this.searchOnSubmitHandler.bind(this)}
                keywords={this.state.keywords}
              />
            </Container>
          </Col>
        </Row>
        <Row>
          <Col lg={2} sm={1} style={{ background: "#dfdfdf" }}>
            {this.state.filters}
          </Col>
          <Col lg={10} sm={11} style={{ minHeight: "300px" }}>
            <ResultsList
              results={this.state.results}
              currentActiveRequest={this.state.currentActiveRequest}
            />
          </Col>
        </Row>
      </Container>
    );
  }

  setResults(results: Array<SearchResult>) {
    this.setState({
      results: results,
    });
  }

  setKeywords(keywords: string) {
    this.setState({
      keywords: keywords,
    });
  }

  setCurrentActiveRequest(requestIsActive: boolean) {
    this.setState({
      currentActiveRequest: requestIsActive,
    });
  }

  searchOnSubmitHandler(values) {
    console.log("Searching...", values);
    this.setCurrentActiveRequest(true);
    this.setKeywords(values.keywords);
    fetch(`/api/v1.0/search?_format=json&keywords=${values.keywords}`)
      .then((res) => res.json())
      .then((ajaxResults) => {
        console.log(ajaxResults);
        if (ajaxResults) {
          this.setCurrentActiveRequest(false);
          const me = this;
          const results = [];
          ajaxResults.data.map((singleresult) => {
            results.push(<SearchResult {...singleresult} />);
          });
          this.setState({
            results: results,
          });

          const activeFilters = <FilterList filters={ajaxResults.filters} />;
          this.setState({
            filters: activeFilters,
          });
          console.log("Search Object", this);
        }
      });
  }

  getQueryVariable(variable: string): string {
    const query = window.location.search.substring(1);
    console.log(query);
    const vars = query.split("&");
    console.log(vars);
    for (let i = 0; i < vars.length; i++) {
      const pair = vars[i].split("=");
      console.log(pair);
      if (pair[0] == variable) {
        return pair[1];
      }
    }
    return "";
  }
}

export default Search;