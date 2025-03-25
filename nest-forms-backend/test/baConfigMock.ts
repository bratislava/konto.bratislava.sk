import BaConfig from '../src/config/ba-config'

type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T

export default function createBaConfigMock(
  baConfig: DeepPartial<BaConfig>,
): BaConfig {
  return baConfig as BaConfig
}
