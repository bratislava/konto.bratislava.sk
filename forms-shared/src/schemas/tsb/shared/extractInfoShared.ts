import { GenericObjectType } from "@rjsf/utils";
import { safeString } from "../../../form-utils/safeData";

export const tsbExtractEmail = (formData: GenericObjectType) => {
  return safeString(formData.objednavatel?.email || formData.ziadatel?.email)
}
