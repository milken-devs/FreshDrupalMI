import { SlideDataFactory } from "Components/SlideDisplay";
import { SlideInterface } from 'DataTypes/Slide';
import { ImageFile } from 'DataTypes/ImageFile';
const slideDisplayTemplate = document.createElement("template");
import styles from './eck-entity-slide.scss';

slideDisplayTemplate.innerHTML = `
<div class="card" >
    <div class="card-header"></div>
    <div class="card-body">
      <div class="card-title"><slot name="title"></slot></div>
    </div>
  </div>
</div>
`;

customElements.define(
  "eck-entity-slide",
  class EckEntitySlide extends HTMLElement {
    mountPoint: HTMLElement;
    entityData: SlideInterface;

    constructor() {
      super();

      const parsed = JSON.parse(this.getAttribute('data-entity'));
      this.entityData = SlideDataFactory(parsed.data);
      const toAppend = document.createElement('h5');
      toAppend.slot = "title";
      toAppend.textContent = this.entityData.title;
      this.appendChild(toAppend);
      //console.debug("eck-entity-slide", this.entityData);
      const shadowRoot = this.attachShadow({ mode: "open" });
      this.mountPoint = document.createElement("div");
      shadowRoot.appendChild(this.mountPoint);
      const style = document.createElement('style');
      style.textContent = styles;
      shadowRoot.appendChild(style);
      if (this.nextElementSibling.classList.contains('dropbutton-wrapper')) {
        this.mountPoint.appendChild(this.nextElementSibling);
      }

      const clone = slideDisplayTemplate.content.cloneNode(true);
      this.mountPoint.appendChild(clone);

    }

    connectedCallback = () => {
      const BackgroundImage = new ImageFile(this.entityData.field_background_image);
      console.log("Background Image", BackgroundImage);
      this.mountPoint.querySelector('.card').setAttribute('style', "");
    }
  }
);
