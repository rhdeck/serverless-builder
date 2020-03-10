
import { {{{aliases}}} } from "{{{inputPath}}}";
import "source-map-support/register";
import { isArray} from "util"
import { withAuthentication} from "@privilege/backend-model-2"
import epsagon from "epsagon";
import { withBatch } from "@privilege/backend-model-2"
import sourcemap from 'source-map-support'
sourcemap.install();
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
const appSyncResolver = withWrapper(async (a, b, c) => {
    if (a.source === "serverless-plugin-warmup") {
        if(process.env.epsagonToken) epsagon.label("appsync", "warmup");
        console.log("Warmup invocation")
        return; 
    }
    console.log("Starting appsyncresolver")
    // console.log(`received a arg of ${JSON.stringify(a, null, 2)}`);
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
