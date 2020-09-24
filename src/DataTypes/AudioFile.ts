import * as FileDataObject from "./File";

export interface AudioFileInterface extends FileDataObject.FileInterface {

}

export class AudioFile extends FileDataObject.default implements AudioFileInterface {

  constructor(props) {
    super(props);
    Object.assign(this, props);
  }

}

export default AudioFile;
