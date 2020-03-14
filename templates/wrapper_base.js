
import { {{{aliases}}} } from "{{{handlersPath}}}";
import { isArray} from "util"
const withWrapper = f => f;
{{{wrappers}}}
const getResolverFunc = (func) => {
    console.log("Resolver starting", func)
    switch(func) {
        {{{resolvers}}}
        default:
          throw `Unhandled function: ${func}`;
      }
}
const withBatch = f => async (args, b, cb) => {
    if (args.__isBatch) return f(args, b, cb);
    args.map(async (args,b,cb) => {
          const newArgs = { ...args, __isBatch: true };
          try {
            const data = await f(newArgs, b);
            return { data };
          } catch (error) {
            if (!error) console.error("Error was undefined");
            else {
              console.error(JSON.stringify(error));
              if (error.Fault) console.error(JSON.stringify(error.Fault.Error));
              if (error.fault) console.error(JSON.stringify(error.fault.error));
            }
            return {
              data: null,
              errorMessage: error
                ? error.message
                  ? error.message.toString()
                  : error
                : "Error was undefined",
              errorType: "ERROR"
            };
          }
        });
      cb(null, results);
  };
const appSyncResolver = withWrapper(async (a, b, c) => {
    if (isArray(a)) {
        return withBatch(async (a, b, c) => {
            const { func } = a;
            const toRun = getResolverFunc(func);
            return toRun(a, b, c);
        })(a, b, c);
    } else {
        const { func } = a;
        const toRun = getResolverFunc(func);
        return toRun(a, b, c);
    }
});
export {
    appSyncResolver
    {{{exporteds}}}
}
