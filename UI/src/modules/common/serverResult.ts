import { ResultWrapper } from "@libCommon";

/**Describes result code coming from the server*/
type serverResult = {
  success: boolean;
  code: number;
  reason: string;
};

/**Converts server result code to client result code*/
export let serverResultMessageToResult = (result: serverResult) => {
  return new ResultWrapper(result["success"], result["reason"]);
};
