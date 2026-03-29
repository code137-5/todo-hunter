import { EndingState } from "@/constants";

export interface EndingDTO {
  endingState: EndingState;
  endingCode: string;
  endingName: string;
  endingStory: string[];
  endingImage: string;
  achievableTitle: {
    titleName: string;
    description: string;
  };
}
