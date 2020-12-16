import { SlideInterface } from 'DataTypes/Slide';
import {SlideDataFactory} from "Components/SlideDisplay/SlideDataFactory";
import { ImageFile } from 'DataTypes/ImageFile';
import * as eckStyles from './eck-entity-slide.scss';


const slideDisplayTemplate = document.createElement("template");
slideDisplayTemplate.innerHTML = `
<div class="card" >
    <div class="card-header"><slot name="bundle"></slot></div>
    <div class="card-body">
      <div class="card-title"><slot name="title"></slot></div>
    </div>
  </div>
</div>
`;

customElements.define(
  "eck-entity-slide",
  class EckEntitySlideElement extends HTMLElement {
    template: HTMLTemplateElement;
    styles: string;
    mountPoint: HTMLElement;
    entityData: SlideInterface;

    constructor() {
      super();
      const shadowRoot = this.attachShadow({ mode: "open" });
      const parsed = JSON.parse(this.getAttribute('data-entity'));
      this.entityData = SlideDataFactory(parsed.data);
      this.styles = eckStyles.default.toString();
      this.template = slideDisplayTemplate;
      this.addStyles(shadowRoot);
      this.applyTemplate(shadowRoot);
    }

    /**
     * Take the HTML template provided as the base fromework
     * for the component and apply the templated values from
     * the data provided.
     *
     * @param sr
     */
    applyTemplate = (sr: ShadowRoot) => {
      // Supply the template with a value for "title" slot

      const toAppend = document.createElement('h5');
      toAppend.slot = "title";
      toAppend.textContent = this.entityData.title;
      this.appendChild(toAppend);
      const bundleType = document.createElement("span");
      bundleType.slot = "bundle";
      bundleType.textContent = this.entityData.constructor.name
      this.appendChild(bundleType);

      // Then apply the tempalte to the shadowroot
      this.mountPoint = document.createElement("div");
      sr.appendChild(this.mountPoint);
      const clone = this.template.content.cloneNode(true);
      this.mountPoint.appendChild(clone);
    }

    /**
     * Add styles to shadow dom from css file in the components folder.
     *
     * @param sr
     */
    addStyles = (sr: ShadowRoot) => {
      const style = document.createElement('style');
      style.textContent = this.styles;
      sr.appendChild(style);
    }

    connectedCallback() {
      console.log("Connected callback", this.entityData.field_background_image);
      const backgroundImage = `background-image: url('${this.entityData.field_background_image.imageStyleObject.medium}'); background-repeat: no-repeat; background-size: cover;`;
      this.mountPoint.querySelector('.card').setAttribute('style', backgroundImage);
    }
  }
);