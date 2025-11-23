import { Sdk } from "@aboutcircles/sdk";
import { circlesConfig } from "@aboutcircles/sdk-core";
import { createBrowserRunner } from "./browser-runner";

export async function bootstrapCircles() {
  const runner = await createBrowserRunner();
  await runner.init();

  const sdk = new Sdk(circlesConfig[100], runner);
  const avatar = await sdk.getAvatar(
    "0xf6e5f26d647fc0494e749823e7feb33df3641acc"
  );

  const profile = await avatar.profile.get();
  console.log(`Profile: ${JSON.stringify(profile, null, 2)} \n`);

  const trustGraph = await sdk.data.getTrustRelations(avatar.address);
  console.log(`Trustees: ${trustGraph.length}`);

  const topHolders = sdk.tokens.getHolders(avatar.address, 3);
  await topHolders.queryNextPage();
  console.log("Top holders", topHolders.currentPage?.results ?? []);
}
