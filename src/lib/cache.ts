import { unstable_cache as nextCache} from "next/cache" // for data cache
import { cache as reactCache} from "react" // for request memoization

type Callback = (...args: any[]) => Promise<any>

export function cache<T extends Callback>(cb: T, keyParts: string[], options: { revalidate?: number | false; tags?: string[]} = {}) {

}