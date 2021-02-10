// This file serves as a generic data fetcher from Drupal JSON API
// It currently fetches all entities that match the type given
// For now, the fields searched are specified by buildAPIFilterPathList
// It also does json_api=true&include=.... based on each type
// Includes can be overriden by passing a string array of fields to include in the data

import { DrupalJsonApiParams } from "drupal-jsonapi-params";

export class JSONApiGenericFetcher {

  apiEntityTypePath: string;

  apiFilterPathList: Array<string>;

  apiFilterValue: string;

  apiIncluded: Array<string>;

  apiQueryParamBuilder: DrupalJsonApiParams;

  type: string;

  urlOrigin: URL;

  error: Error;

  urlAbsoluteResult: URL;

  constructor( entityType: string, filterValue: string, apiIncluded: Array<string> = null) {
    
    console.log("JSONApiGenericFetcher: constructor", this);

    this.type = entityType;

    this.apiEntityTypePath = this.buildAPIEntityTypePath();

    this.apiFilterPathList = this.buildAPIFilterPathList();

    this.apiFilterValue = filterValue;
    
    this.apiIncluded = ( apiIncluded !== undefined && apiIncluded?.length > 0 ) ? apiIncluded : this.buildAPIIncludeList();
    
    this.apiQueryParamBuilder = new DrupalJsonApiParams();
    
    
    this.urlOrigin = new URL(document.location.origin.toString());
  }

  buildAPIEntityTypePath( typeOverride: string = null ): string {
    let arrayTypeSplit = this.type.split("--");
    return String.prototype.concat("/jsonapi/",arrayTypeSplit.shift(),"/",arrayTypeSplit.shift());
  }

  buildAPIFilterPathList( typeOverride: string = null, onlyParentFieldName: boolean = null ): Array<string> {
    let typeLocal = (typeOverride !== null && typeOverride.length > 2) ? typeOverride : this.type;
    let suffix = (onlyParentFieldName !== null && onlyParentFieldName === true) ? "" : ".name";

    switch(typeLocal){
      case "node--article":
        return ["field_topics".concat(suffix)];
      default:
        throw new Error("JSONApiGenericFetcher: Unsupported Filters for Type: ".concat(this.type));
    }
  }

  buildAPIIncludeList( typeOverride: string = null ): Array<string> {
    switch(this.type){
      case "node--article":
        return ["field_content", "field_topics", "field_centers", "field_promo_slide"];
      default:
        throw new Error("JSONApiGenericFetcher: Unsupported Default Includes for Type: ".concat(this.type));
    }
  }

  buildFilterQuery(): void {
    this.apiQueryParamBuilder.addInclude(this.apiIncluded);
    if(this.apiFilterPathList?.length > 0){
      this.apiQueryParamBuilder.addGroup("group_tag_filters", "OR");
    }
    this.apiFilterPathList?.map((filterPath) => {
      this.apiQueryParamBuilder.addFilter(filterPath, this.apiFilterValue, "=", "group_tag_filters" );
    })
    if(this.apiIncluded?.length > 0){
      this.apiQueryParamBuilder.addInclude(this.apiIncluded.join());
    } 
  }

  getAbsoluteURL(): string {
    return this.urlOrigin.toString().concat(
      this.apiEntityTypePath, 
      "?jsonapi_include=true&", 
      this.apiQueryParamBuilder.getQueryString({ encode: false })
    );
  }
  
  async getData(): Promise<any> {
    if (this.apiQueryParamBuilder !== undefined) {
      this.buildFilterQuery();
      console.debug("JSONApiGenericFetcher.getData with url: ", this.getAbsoluteURL());
      return fetch(
        new Request(
          this.getAbsoluteURL()
        )
      ).catch(this.handleError);
    }
    this.handleError(new Error("Not Enough Data to make a getData call"));
  }

  handleError(err) {
    this.error = err;
    console.error(
      "JSONApiGenericFetcher has encountered an error with fetching the data:",
      err
    );
  }

}

export default JSONApiGenericFetcher;
